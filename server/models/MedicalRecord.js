const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
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
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    diagnosis: {
        type: String,
        required: true
    },
    symptoms: [String],
    vitals: {
        bloodPressure: String,
        heartRate: Number,
        temperature: Number,
        weight: Number,
        height: Number,
        bmi: Number
    },
    prescription: [{
        medicine: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String
    }],
    tests: [{
        name: String,
        result: String,
        date: Date,
        file: String,
        notes: String
    }],
    notes: String,
    followUpDate: Date,
    treatmentPlan: String,
    attachments: [{
        name: String,
        url: String,
        uploadedAt: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);