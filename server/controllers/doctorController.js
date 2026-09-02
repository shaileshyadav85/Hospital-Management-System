const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Get all doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const { specialization, isAvailable } = req.query;
        
        let query = {};
        if (specialization) query.specialization = specialization;
        if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

        const doctors = await Doctor.find(query)
            .populate('user', 'name email phone address profileImage')
            .sort({ rating: -1 });

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate('user', 'name email phone address profileImage');

        if (!doctor) {
            return res.status(404).json({ 
                message: 'Doctor not found', 
                success: false 
            });
        }

        res.status(200).json({
            success: true,
            data: doctor
        });
    } catch (error) {
        console.error('Get doctor error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Get doctor count
exports.getDoctorCount = async (req, res) => {
    try {
        const count = await Doctor.countDocuments();
        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Get doctor count error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Create doctor (Admin only)
exports.createDoctor = async (req, res) => {
    try {
        const { userId, specialization, experience, qualification, consultationFee, availability } = req.body;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found', 
                success: false 
            });
        }

        // Check if doctor already exists
        const existingDoctor = await Doctor.findOne({ user: userId });
        if (existingDoctor) {
            return res.status(400).json({ 
                message: 'Doctor profile already exists for this user', 
                success: false 
            });
        }

        const doctor = new Doctor({
            user: userId,
            specialization,
            experience,
            qualification,
            consultationFee,
            availability: availability || {
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                startTime: '09:00',
                endTime: '17:00'
            }
        });

        await doctor.save();

        const populatedDoctor = await Doctor.findById(doctor._id)
            .populate('user', 'name email phone address profileImage');

        res.status(201).json({
            success: true,
            message: 'Doctor created successfully',
            data: populatedDoctor
        });
    } catch (error) {
        console.error('Create doctor error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Update doctor
exports.updateDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('user', 'name email phone address profileImage');

        if (!doctor) {
            return res.status(404).json({ 
                message: 'Doctor not found', 
                success: false 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Doctor updated successfully',
            data: doctor
        });
    } catch (error) {
        console.error('Update doctor error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Delete doctor (Admin only)
exports.deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        
        if (!doctor) {
            return res.status(404).json({ 
                message: 'Doctor not found', 
                success: false 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Doctor deleted successfully'
        });
    } catch (error) {
        console.error('Delete doctor error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};