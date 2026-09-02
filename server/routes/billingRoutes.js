const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');

// ✅ Get revenue (for dashboard)
router.get('/revenue', auth, async (req, res) => {
    try {
        const Billing = require('../models/Billing');
        const result = await Billing.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const total = result.length > 0 ? result[0].total : 0;
        res.json({ success: true, total });
    } catch (error) {
        console.error('Revenue error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all bills
router.get('/', auth, authorize('admin'), async (req, res) => {
    try {
        const Billing = require('../models/Billing');
        const bills = await Billing.find().populate('patient', 'user');
        res.json({ success: true, data: bills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get bill by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const Billing = require('../models/Billing');
        const bill = await Billing.findById(req.params.id).populate('patient', 'user');
        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.json({ success: true, data: bill });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;