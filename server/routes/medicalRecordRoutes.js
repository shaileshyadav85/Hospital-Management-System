const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const medicalRecordController = require('../controllers/medicalRecordController');

// Get medical records for patient
router.get('/patient/:patientId', auth, medicalRecordController.getPatientRecords);

// Get medical record by ID
router.get('/:id', auth, medicalRecordController.getRecordById);

// Create medical record
router.post('/', auth, authorize('doctor'), medicalRecordController.createRecord);

// Update medical record
router.put('/:id', auth, authorize('doctor'), medicalRecordController.updateRecord);

// Delete medical record
router.delete('/:id', auth, authorize('doctor'), medicalRecordController.deleteRecord);

module.exports = router;