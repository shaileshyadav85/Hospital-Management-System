const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true,
        min: 0
    },
    qualification: {
        type: String,
        required: true
    },
    consultationFee: {
        type: Number,
        required: true,
        min: 0
    },
    availability: {
        days: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }],
        startTime: String,
        endTime: String,
        slotDuration: {
            type: Number,
            default: 30 // minutes
        }
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    totalPatients: {
        type: Number,
        default: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);