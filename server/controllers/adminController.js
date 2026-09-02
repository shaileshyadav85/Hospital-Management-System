const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalDoctors, totalPatients, totalAppointments, totalRevenue] = await Promise.all([
            User.countDocuments(),
            Doctor.countDocuments(),
            Patient.countDocuments(),
            Appointment.countDocuments(),
            Billing.aggregate([
                { $match: { status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ])
        ]);

        // Get today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAppointments = await Appointment.countDocuments({
            date: { $gte: today, $lt: tomorrow }
        });

        // Get pending appointments
        const pendingAppointments = await Appointment.countDocuments({
            status: 'pending'
        });

        // Get recent appointments
        const recentAppointments = await Appointment.find()
            .populate('patient', 'user')
            .populate('doctor', 'user specialization')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalDoctors,
                totalPatients,
                totalAppointments,
                totalRevenue: totalRevenue[0]?.total || 0,
                todayAppointments,
                pendingAppointments,
                recentAppointments
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ 
                message: 'User not found', 
                success: false 
            });
        }

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: user
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Get appointment report
exports.getAppointmentReport = async (req, res) => {
    try {
        const { startDate, endDate, doctorId } = req.query;

        let query = {};
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (doctorId) query.doctor = doctorId;

        const appointments = await Appointment.find(query)
            .populate('patient', 'user')
            .populate('doctor', 'user specialization');

        const totalAppointments = appointments.length;
        const completedAppointments = appointments.filter(a => a.status === 'completed').length;
        const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
        const pendingAppointments = appointments.filter(a => a.status === 'pending').length;

        res.status(200).json({
            success: true,
            data: {
                totalAppointments,
                completedAppointments,
                cancelledAppointments,
                pendingAppointments,
                completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
                appointments
            }
        });
    } catch (error) {
        console.error('Get appointment report error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Get revenue report
exports.getRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let query = { status: 'paid' };
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const bills = await Billing.find(query)
            .populate('patient', 'user');

        const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);
        const averageRevenue = bills.length > 0 ? totalRevenue / bills.length : 0;

        // Group by date
        const revenueByDate = {};
        bills.forEach(bill => {
            const date = bill.createdAt.toISOString().split('T')[0];
            revenueByDate[date] = (revenueByDate[date] || 0) + bill.total;
        });

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                averageRevenue,
                totalBills: bills.length,
                revenueByDate: Object.keys(revenueByDate).map(date => ({
                    date,
                    amount: revenueByDate[date]
                })),
                bills
            }
        });
    } catch (error) {
        console.error('Get revenue report error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};