const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        default: 30 // minutes
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },
    type: {
        type: String,
        enum: ['in-person', 'video', 'phone'],
        default: 'in-person'
    },
    reason: {
        type: String,
        required: true
    },
    symptoms: [String],
    notes: String,
    prescription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription'
    },
    billing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Billing'
    },
    cancellationReason: String,
    cancelledAt: Date,
    completedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for efficient queries
appointmentSchema.index({ doctor: 1, date: 1, time: 1 });
appointmentSchema.index({ patient: 1, date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);