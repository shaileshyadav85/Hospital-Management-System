const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const { sendEmail } = require('../utils/email');

// Book appointment
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, type, reason, symptoms } = req.body;
        
        // Get patient
        const patient = await Patient.findOne({ user: req.user._id });
        if (!patient) {
            return res.status(404).json({ 
                message: 'Patient profile not found', 
                success: false 
            });
        }

        // Check doctor exists and is available
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ 
                message: 'Doctor not found', 
                success: false 
            });
        }

        if (!doctor.isAvailable) {
            return res.status(400).json({ 
                message: 'Doctor is not available', 
                success: false 
            });
        }

        // Check for appointment conflict
        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            date: new Date(date),
            time: time,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointment) {
            return res.status(400).json({ 
                message: 'Time slot is already booked', 
                success: false 
            });
        }

        // Create appointment
        const appointment = new Appointment({
            patient: patient._id,
            doctor: doctorId,
            date: new Date(date),
            time,
            type: type || 'in-person',
            reason,
            symptoms,
            status: 'pending'
        });

        await appointment.save();

        // Populate appointment details
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patient', 'user')
            .populate('doctor', 'user specialization');

        // Send confirmation email
        // await sendEmail(
        //     req.user.email,
        //     'Appointment Confirmation',
        //     `Your appointment with Dr. ${populatedAppointment.doctor.user.name} is booked for ${date} at ${time}`
        // );

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: populatedAppointment
        });
    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Get all appointments for current user
exports.getMyAppointments = async (req, res) => {
    try {
        let appointments;
        
        if (req.user.role === 'patient') {
            const patient = await Patient.findOne({ user: req.user._id });
            appointments = await Appointment.find({ patient: patient._id })
                .populate('doctor', 'user specialization consultationFee')
                .populate('patient', 'user')
                .sort({ date: -1 });
        } else if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ user: req.user._id });
            appointments = await Appointment.find({ doctor: doctor._id })
                .populate('patient', 'user age gender bloodGroup')
                .populate('doctor', 'user specialization')
                .sort({ date: -1 });
        } else {
            appointments = await Appointment.find()
                .populate('patient', 'user')
                .populate('doctor', 'user specialization')
                .sort({ date: -1 });
        }

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Get appointments for a specific doctor
exports.getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date, status } = req.query;

        let query = { doctor: doctorId };
        
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }
        
        if (status) {
            query.status = status;
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'user age gender bloodGroup')
            .populate('doctor', 'user specialization')
            .sort({ date: 1, time: 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('Get doctor appointments error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status, cancellationReason } = req.body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ 
                message: 'Appointment not found', 
                success: false 
            });
        }

        // Check authorization
        if (req.user.role === 'patient') {
            const patient = await Patient.findOne({ user: req.user._id });
            if (appointment.patient.toString() !== patient._id.toString()) {
                return res.status(403).json({ 
                    message: 'Not authorized to update this appointment', 
                    success: false 
                });
            }
        }

        // Update status
        appointment.status = status;
        
        if (status === 'cancelled') {
            appointment.cancellationReason = cancellationReason;
            appointment.cancelledAt = new Date();
        } else if (status === 'completed') {
            appointment.completedAt = new Date();
        }

        await appointment.save();

        res.status(200).json({
            success: true,
            message: 'Appointment status updated successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Get available slots for a doctor
exports.getAvailableSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ 
                message: 'Doctor not found', 
                success: false 
            });
        }

        // Check if doctor is available on this day
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        if (!doctor.availability.days.includes(dayOfWeek)) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'Doctor is not available on this day'
            });
        }

        // Generate time slots
        const startTime = doctor.availability.startTime;
        const endTime = doctor.availability.endTime;
        const slotDuration = doctor.availability.slotDuration || 30;

        const slots = [];
        let currentTime = startTime;

        while (currentTime < endTime) {
            // Check if slot is booked
            const existingAppointment = await Appointment.findOne({
                doctor: doctorId,
                date: new Date(date),
                time: currentTime,
                status: { $in: ['pending', 'confirmed'] }
            });

            if (!existingAppointment) {
                slots.push(currentTime);
            }

            // Increment time
            const [hours, minutes] = currentTime.split(':').map(Number);
            const newMinutes = minutes + slotDuration;
            const newHours = hours + Math.floor(newMinutes / 60);
            currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes % 60).padStart(2, '0')}`;
        }

        res.status(200).json({
            success: true,
            data: slots
        });
    } catch (error) {
        console.error('Get available slots error:', error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};