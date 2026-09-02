const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// ============================================
// REGISTER USER
// ============================================
exports.register = async (req, res) => {
    try {
        console.log('📝 Registration request received:', req.body);

        const { 
            name, 
            email, 
            password, 
            role, 
            phone, 
            address, 
            aadharNumber,    // ✅ ADDED
            bloodGroup,      // ✅ ADDED
            ...extraData 
        } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phone || !address) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user with all fields including aadhar and bloodGroup
        const user = new User({
            name,
            email,
            password,
            role: role || 'patient',
            phone,
            address,
            aadharNumber: aadharNumber || '',    // ✅ ADDED
            bloodGroup: bloodGroup || ''         // ✅ ADDED
        });

        // Save user
        await user.save();
        console.log('✅ User saved successfully:', user._id);

        // Create role-specific profile
        if (role === 'doctor') {
            const doctor = new Doctor({
                user: user._id,
                specialization: extraData.specialization || 'General Medicine',
                experience: extraData.experience || 0,
                qualification: extraData.qualification || 'MBBS',
                consultationFee: extraData.consultationFee || 500
            });
            await doctor.save();
            console.log('✅ Doctor profile created');
        } else if (role === 'patient') {
            const patient = new Patient({
                user: user._id,
                age: extraData.age || 25,
                gender: extraData.gender || 'Male'
            });
            await patient.save();
            console.log('✅ Patient profile created');
        }

        // Generate token
        const token = generateToken(user._id);

        // Send response with all user data
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                aadharNumber: user.aadharNumber,   // ✅ ADDED
                bloodGroup: user.bloodGroup,       // ✅ ADDED
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during registration'
        });
    }
};

// ============================================
// LOGIN USER
// ============================================
exports.login = async (req, res) => {
    try {
        console.log('🔐 Login request received:', req.body.email);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            console.log('❌ User not found with email:', email);
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('✅ User found:', user.email);

        // Check password
        const isMatch = await user.comparePassword(password);
        console.log('🔐 Password match result:', isMatch);

        if (!isMatch) {
            console.log('❌ Password mismatch for:', email);
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        console.log('✅ Login successful for:', user.email);

        // Send response with all user data
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                aadharNumber: user.aadharNumber,   // ✅ ADDED
                bloodGroup: user.bloodGroup,       // ✅ ADDED
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during login'
        });
    }
};

// ============================================
// GET CURRENT USER PROFILE
// ============================================
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prepare profile data with all fields
        let profileData = { 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                aadharNumber: user.aadharNumber,   // ✅ ADDED
                bloodGroup: user.bloodGroup,       // ✅ ADDED
                profileImage: user.profileImage,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        };

        // Get role-specific data
        if (user.role === 'doctor') {
            const doctor = await Doctor.findOne({ user: user._id });
            profileData.doctor = doctor;
        } else if (user.role === 'patient') {
            const patient = await Patient.findOne({ user: user._id });
            profileData.patient = patient;
        }

        res.status(200).json({
            success: true,
            data: profileData
        });
    } catch (error) {
        console.error('❌ Get profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// ============================================
// UPDATE USER PROFILE
// ============================================
exports.updateProfile = async (req, res) => {
    try {
        console.log('📝 Update profile request:', req.body);

        const { 
            name, 
            phone, 
            address, 
            aadharNumber,    // ✅ ADDED
            bloodGroup,      // ✅ ADDED
            ...updateData 
        } = req.body;

        // Update user with all fields including aadhar and bloodGroup
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { 
                name, 
                phone, 
                address,
                aadharNumber: aadharNumber || '',    // ✅ ADDED
                bloodGroup: bloodGroup || ''         // ✅ ADDED
            },
            { 
                new: true, 
                runValidators: true 
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('✅ User updated successfully');

        // Update role-specific data if needed
        if (req.user.role === 'doctor') {
            await Doctor.findOneAndUpdate(
                { user: req.user._id },
                { ...updateData },
                { new: true }
            );
        } else if (req.user.role === 'patient') {
            await Patient.findOneAndUpdate(
                { user: req.user._id },
                { ...updateData },
                { new: true }
            );
        }

        // Send updated user data
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                aadharNumber: user.aadharNumber,   // ✅ ADDED
                bloodGroup: user.bloodGroup,       // ✅ ADDED
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error('❌ Update profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// ============================================
// CHANGE PASSWORD
// ============================================
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        const user = await User.findById(req.user._id);

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('❌ Change password error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};