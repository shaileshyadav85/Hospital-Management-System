const User = require('../models/User');

// ✅ Upload profile photo
exports.uploadProfilePhoto = async (req, res) => {
    try {
        console.log('📸 Uploading profile photo...');
        console.log('📝 User ID:', req.user?._id);
        console.log('📝 File:', req.file);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;
        
        console.log('✅ File URL:', imageUrl);

        // ✅ FIXED: Use returnDocument instead of new (deprecated)
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { profileImage: imageUrl },
            { 
                returnDocument: 'after',  // ✅ YEH CHANGE KARO
                runValidators: true 
            }
        ).select('-password');

        if (!user) {
            console.log('❌ User not found');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('✅ User updated successfully');
        console.log('📝 Updated profileImage:', user.profileImage);

        res.status(200).json({
            success: true,
            message: 'Profile photo updated successfully',
            data: {
                profileImage: user.profileImage,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profileImage: user.profileImage
                }
            }
        });
    } catch (error) {
        console.error('❌ Upload photo error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload photo'
        });
    }
};

// ✅ Delete profile photo
exports.deleteProfilePhoto = async (req, res) => {
    try {
        console.log('🗑️ Deleting profile photo...');
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { profileImage: null },
            { returnDocument: 'after' }  // ✅ YEH CHANGE KARO
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('✅ Profile photo deleted');

        res.status(200).json({
            success: true,
            message: 'Profile photo deleted successfully',
            data: {
                profileImage: null,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profileImage: null
                }
            }
        });
    } catch (error) {
        console.error('❌ Delete photo error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete photo'
        });
    }
};