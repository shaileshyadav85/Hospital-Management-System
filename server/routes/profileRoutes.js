const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const profileController = require('../controllers/profileController');

console.log('🔄 Profile routes initialized');

// ✅ Upload profile photo
router.post(
    '/upload-photo',
    auth,
    upload.single('profileImage'),
    profileController.uploadProfilePhoto
);

// ✅ Delete profile photo
router.delete(
    '/delete-photo',
    auth,
    profileController.deleteProfilePhoto
);

module.exports = router;