const User = require('../models/User');
const Patient = require('../models/Patient');

// Get all patients
exports.getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find()
            .populate('user', 'name email phone address profileImage')
            .sort({ registeredAt: -1 });

        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id)
            .populate('user', 'name email phone address profileImage')
            .populate('medicalHistory.doctor', 'user specialization');

        if (!patient) {
            return res.status(404).json({ 
                message: 'Patient not found', 
                success: false 
            });
        }

        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (error) {
        console.error('Get patient error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Get patient count
exports.getPatientCount = async (req, res) => {
    try {
        const count = await Patient.countDocuments();
        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Get patient count error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Create patient (Admin only)
exports.createPatient = async (req, res) => {
    try {
        const { userId, age, gender, bloodGroup, emergencyContact, insuranceInfo } = req.body;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found', 
                success: false 
            });
        }

        // Check if patient already exists
        const existingPatient = await Patient.findOne({ user: userId });
        if (existingPatient) {
            return res.status(400).json({ 
                message: 'Patient profile already exists for this user', 
                success: false 
            });
        }

        const patient = new Patient({
            user: userId,
            age,
            gender,
            bloodGroup,
            emergencyContact,
            insuranceInfo
        });

        await patient.save();

        const populatedPatient = await Patient.findById(patient._id)
            .populate('user', 'name email phone address profileImage');

        res.status(201).json({
            success: true,
            message: 'Patient created successfully',
            data: populatedPatient
        });
    } catch (error) {
        console.error('Create patient error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Update patient
exports.updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('user', 'name email phone address profileImage');

        if (!patient) {
            return res.status(404).json({ 
                message: 'Patient not found', 
                success: false 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Patient updated successfully',
            data: patient
        });
    } catch (error) {
        console.error('Update patient error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Delete patient (Admin only)
exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        
        if (!patient) {
            return res.status(404).json({ 
                message: 'Patient not found', 
                success: false 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Patient deleted successfully'
        });
    } catch (error) {
        console.error('Delete patient error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};