const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// Get patient records
exports.getPatientRecords = async (req, res) => {
    try {
        const { patientId } = req.params;
        
        const records = await MedicalRecord.find({ patient: patientId })
            .populate('doctor', 'user specialization')
            .populate('appointment')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });
    } catch (error) {
        console.error('Get patient records error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Get record by ID
exports.getRecordById = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id)
            .populate('patient', 'user')
            .populate('doctor', 'user specialization')
            .populate('appointment');

        if (!record) {
            return res.status(404).json({ 
                message: 'Medical record not found', 
                success: false 
            });
        }

        res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        console.error('Get record error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Create medical record
exports.createRecord = async (req, res) => {
    try {
        const { patientId, appointmentId, diagnosis, symptoms, vitals, prescription, tests, notes, followUpDate, treatmentPlan } = req.body;

        // Get doctor
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) {
            return res.status(404).json({ 
                message: 'Doctor profile not found', 
                success: false 
            });
        }

        // Check patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ 
                message: 'Patient not found', 
                success: false 
            });
        }

        // Create record
        const record = new MedicalRecord({
            patient: patientId,
            doctor: doctor._id,
            appointment: appointmentId || null,
            diagnosis,
            symptoms: symptoms || [],
            vitals: vitals || {},
            prescription: prescription || [],
            tests: tests || [],
            notes,
            followUpDate: followUpDate || null,
            treatmentPlan
        });

        await record.save();

        // Update patient's medical history
        await Patient.findByIdAndUpdate(patientId, {
            $push: {
                medicalHistory: {
                    condition: diagnosis,
                    diagnosisDate: new Date(),
                    treatment: treatmentPlan,
                    doctor: doctor._id,
                    notes: notes
                }
            }
        });

        // Update appointment status if provided
        if (appointmentId) {
            await Appointment.findByIdAndUpdate(appointmentId, {
                status: 'completed',
                completedAt: new Date()
            });
        }

        const populatedRecord = await MedicalRecord.findById(record._id)
            .populate('doctor', 'user specialization')
            .populate('appointment');

        res.status(201).json({
            success: true,
            message: 'Medical record created successfully',
            data: populatedRecord
        });
    } catch (error) {
        console.error('Create record error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Update medical record
exports.updateRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('doctor', 'user specialization');

        if (!record) {
            return res.status(404).json({ 
                message: 'Medical record not found', 
                success: false 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Medical record updated successfully',
            data: record
        });
    } catch (error) {
        console.error('Update record error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Delete medical record
exports.deleteRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findByIdAndDelete(req.params.id);
        
        if (!record) {
            return res.status(404).json({ 
                message: 'Medical record not found', 
                success: false 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Medical record deleted successfully'
        });
    } catch (error) {
        console.error('Delete record error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};