const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

router.post('/book', auth, appointmentController.bookAppointment);
router.get('/my-appointments', auth, appointmentController.getMyAppointments);
router.get('/doctor/:doctorId', auth, appointmentController.getDoctorAppointments);
router.get('/available-slots/:doctorId', auth, appointmentController.getAvailableSlots);
router.put('/:appointmentId/status', auth, appointmentController.updateAppointmentStatus);

module.exports = router;