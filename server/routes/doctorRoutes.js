const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');

// ✅ Get doctor count (for dashboard)
router.get('/count', auth, async (req, res) => {
    try {
        const Doctor = require('../models/Doctor');
        const count = await Doctor.countDocuments();
        res.json({ success: true, count });
    } catch (error) {
        console.error('Count error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all doctors
router.get('/', auth, async (req, res) => {
    try {
        const Doctor = require('../models/Doctor');
        const doctors = await Doctor.find().populate('user', 'name email phone address profileImage');
        res.json({ success: true, data: doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get doctor by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const Doctor = require('../models/Doctor');
        const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone address profileImage');
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        res.json({ success: true, data: doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;