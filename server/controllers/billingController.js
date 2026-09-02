const Billing = require('../models/Billing');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// Generate bill
exports.generateBill = async (req, res) => {
    try {
        const { patientId, appointmentId, items, discount, notes } = req.body;

        // Get patient
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ 
                message: 'Patient not found', 
                success: false 
            });
        }

        // Get appointment if provided
        let appointmentData = null;
        if (appointmentId) {
            appointmentData = await Appointment.findById(appointmentId);
        }

        // Calculate totals
        let subtotal = 0;
        const processedItems = items.map(item => {
            const total = item.quantity * item.unitPrice;
            subtotal += total;
            return {
                ...item,
                total
            };
        });

        // Apply discount
        const discountAmount = discount || 0;
        const tax = subtotal * 0.05; // 5% tax
        const total = subtotal + tax - discountAmount;

        // Create bill
        const bill = new Billing({
            patient: patientId,
            appointment: appointmentId || null,
            items: processedItems,
            subtotal,
            tax,
            discount: discountAmount,
            total,
            notes,
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
        });

        await bill.save();

        // Update appointment with billing reference
        if (appointmentId) {
            await Appointment.findByIdAndUpdate(appointmentId, {
                billing: bill._id
            });
        }

        res.status(201).json({
            success: true,
            message: 'Bill generated successfully',
            data: bill
        });
    } catch (error) {
        console.error('Generate bill error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Get bills for a patient
exports.getPatientBills = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        
        const bills = await Billing.find({ patient: patientId })
            .populate('appointment')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bills.length,
            data: bills
        });
    } catch (error) {
        console.error('Get patient bills error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Get all bills (Admin only)
exports.getAllBills = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        let query = {};
        if (status) query.status = status;
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const bills = await Billing.find(query)
            .populate('patient', 'user')
            .populate('appointment')
            .sort({ createdAt: -1 });

        // Calculate statistics
        const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);
        const paidBills = bills.filter(b => b.status === 'paid');
        const pendingBills = bills.filter(b => b.status === 'pending');

        res.status(200).json({
            success: true,
            count: bills.length,
            statistics: {
                totalRevenue,
                paidCount: paidBills.length,
                pendingCount: pendingBills.length,
                paidRevenue: paidBills.reduce((sum, bill) => sum + bill.total, 0),
                pendingRevenue: pendingBills.reduce((sum, bill) => sum + bill.total, 0)
            },
            data: bills
        });
    } catch (error) {
        console.error('Get all bills error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Update bill status
exports.updateBillStatus = async (req, res) => {
    try {
        const { billId } = req.params;
        const { status, paymentMethod } = req.body;

        const bill = await Billing.findById(billId);
        if (!bill) {
            return res.status(404).json({ 
                message: 'Bill not found', 
                success: false 
            });
        }

        bill.status = status;
        if (status === 'paid') {
            bill.paymentDate = new Date();
            bill.paymentMethod = paymentMethod;
        }

        await bill.save();

        res.status(200).json({
            success: true,
            message: 'Bill status updated successfully',
            data: bill
        });
    } catch (error) {
        console.error('Update bill status error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};