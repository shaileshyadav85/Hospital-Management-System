const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 0
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    // ❌ bloodGroup REMOVED - ab User model mein hai
    medicalHistory: [{
        condition: String,
        diagnosisDate: Date,
        treatment: String,
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor'
        },
        notes: String
    }],
    allergies: [String],
    chronicConditions: [String],
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },
    insuranceInfo: {
        provider: String,
        policyNumber: String,
        validUntil: Date
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);