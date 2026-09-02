const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');

// Get patient count
router.get('/count', auth, async (req, res) => {
    try {
        const Patient = require('../models/Patient');
        const count = await Patient.countDocuments();
        res.json({ success: true, count });
    } catch (error) {
        console.error('Count error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all patients - Anyone logged in can view
router.get('/', auth, async (req, res) => {
    try {
        const Patient = require('../models/Patient');
        const patients = await Patient.find()
            .populate('user', 'name email phone address profileImage aadharNumber bloodGroup');
        
        console.log('✅ Patients fetched:', patients.length);
        res.json({ success: true, data: patients });
    } catch (error) {
        console.error('❌ Get patients error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch patients'
        });
    }
});

// Get patient by user ID
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const Patient = require('../models/Patient');
        const patient = await Patient.findOne({ user: req.params.userId })
            .populate('user', 'name email phone address profileImage aadharNumber bloodGroup');
        
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
        res.json({ success: true, data: patient });
    } catch (error) {
        console.error('Get patient by user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get patient by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const Patient = require('../models/Patient');
        const patient = await Patient.findById(req.params.id)
            .populate('user', 'name email phone address profileImage aadharNumber bloodGroup');
        
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
        res.json({ success: true, data: patient });
    } catch (error) {
        console.error('Get patient error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create patient - Admin only
router.post('/', auth, authorize('admin'), async (req, res) => {
    try {
        const Patient = require('../models/Patient');
        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).json({ success: true, data: patient });
    } catch (error) {
        console.error('Create patient error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update patient - Anyone logged in can update
router.put('/:id', auth, async (req, res) => {
    try {
        const Patient = require('../models/Patient');
        const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('user', 'name email phone address profileImage aadharNumber bloodGroup');
        
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
        res.json({ success: true, data: patient });
    } catch (error) {
        console.error('Update patient error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ FIXED: Delete patient - Admin only (with better error handling)
router.delete('/:id', auth, async (req, res) => {
    try {
        const Patient = require('../models/Patient');
        const patient = await Patient.findById(req.params.id);
        
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // ✅ Check if user is admin OR deleting their own profile
        const isAdmin = req.user.role === 'admin';
        const isOwnProfile = patient.user.toString() === req.user._id.toString();
        
        if (!isAdmin && !isOwnProfile) {
            return res.status(403).json({ 
                success: false, 
                message: 'You are not authorized to delete this patient' 
            });
        }

        // ✅ Delete the patient
        await Patient.findByIdAndDelete(req.params.id);
        
        // ✅ Also delete the user if it's not admin and it's their own profile
        if (!isAdmin && isOwnProfile) {
            const User = require('../models/User');
            await User.findByIdAndDelete(req.user._id);
        }

        console.log('✅ Patient deleted:', req.params.id);
        res.json({ success: true, message: 'Patient deleted successfully' });
        
    } catch (error) {
        console.error('❌ Delete patient error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to delete patient'
        });
    }
});

module.exports = router;