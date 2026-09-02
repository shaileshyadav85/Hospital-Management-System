import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, 
    FaCamera, FaTrash, FaSpinner, FaIdCard, FaTint 
} from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        aadhar: '',
        bloodGroup: '',
        address: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                aadhar: user.aadhar || '',
                bloodGroup: user.bloodGroup || '',
                address: user.address || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.put('/auth/profile', formData);
            toast.success('Profile updated successfully!');
            setIsEditing(false);
            if (setUser) {
                setUser(res.data.user || res.data.data?.user || { ...user, ...formData });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const file = e.target.files[0];
        if (!file) {
            toast.error('No file selected');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const data = new FormData();
        data.append('profileImage', file);

        setUploading(true);
        setUploadProgress(0);

        try {
            const res = await axios.post('/profile/upload-photo', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                }
            });

            if (res.data.success) {
                toast.success('Profile photo updated successfully!');
                if (setUser && res.data.data?.user) {
                    setUser(res.data.data.user);
                }
                setUploading(false);
                setUploadProgress(0);
            } else {
                toast.error(res.data.message || 'Upload failed');
                setUploading(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload photo');
            setUploading(false);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeletePhoto = async () => {
        if (!window.confirm('Are you sure you want to delete your profile photo?')) {
            return;
        }

        setUploading(true);
        try {
            const res = await axios.delete('/profile/delete-photo');
            toast.success('Profile photo deleted successfully!');
            if (setUser && res.data.data?.user) {
                setUser(res.data.data.user);
            }
            setUploading(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete photo');
            setUploading(false);
        }
    };

    const triggerFileInput = () => {
        if (!uploading) {
            fileInputRef.current?.click();
        }
    };

    const hospitalEmail = 'hospital@gmail.com';
    const emailSubject = encodeURIComponent('Query from Hospital Management System');
    const emailBody = encodeURIComponent(
        `Hello,\n\nI have a query regarding my account.\n\nName: ${user?.name || ''}\nEmail: ${user?.email || ''}\nPhone: ${user?.phone || ''}\n\nPlease help me with...\n\nRegards,\n${user?.name || 'Patient'}`
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${hospitalEmail}&su=${emailSubject}&body=${emailBody}`;
    const mailtoUrl = `mailto:${hospitalEmail}?subject=${emailSubject}&body=${emailBody}`;

    return (
        <div className="profile-page">
            <div className="page-header">
                <h2>Profile</h2>
                <p>Manage your account information</p>
            </div>

            <div className="profile-container">
                <div className="profile-card">
                    {/* LEFT SIDE - Avatar */}
                    <div className="profile-avatar-section">
                        <div className="avatar-wrapper">
                            {user?.profileImage ? (
                                <img 
                                    src={user.profileImage} 
                                    alt={user.name}
                                    className="avatar-image"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        const fallback = e.target.nextSibling;
                                        if (fallback) fallback.style.display = 'flex';
                                    }}
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                            )}
                            
                            {uploading && (
                                <div className="upload-progress">
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <span className="progress-text">{uploadProgress}%</span>
                                </div>
                            )}
                            
                            <div className="avatar-overlay">
                                <button 
                                    className="avatar-btn upload-btn"
                                    onClick={triggerFileInput}
                                    disabled={uploading}
                                    type="button"
                                    title="Upload Photo"
                                >
                                    {uploading ? <FaSpinner className="spinner" /> : <FaCamera />}
                                </button>
                                {user?.profileImage && !uploading && (
                                    <button 
                                        className="avatar-btn delete-btn"
                                        onClick={handleDeletePhoto}
                                        type="button"
                                        title="Delete Photo"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            style={{ display: 'none' }}
                            disabled={uploading}
                        />
                        
                        <div className="avatar-hint">
                            <span>{uploading ? 'Uploading...' : 'Click camera icon to change photo'}</span>
                            <small>Max size: 5MB | Formats: JPG, PNG, GIF, WEBP</small>
                        </div>
                    </div>

                    {/* RIGHT SIDE - Profile Info */}
                    <div className="profile-info-section">
                        {!isEditing ? (
                            <>
                                <div className="profile-name">
                                    <h3>{formData.name || 'User Name'}</h3>
                                    <span className="role-badge">{user?.role || 'Patient'}</span>
                                </div>
                                
                                <div className="info-item">
                                    <FaEnvelope className="info-icon" />
                                    <div>
                                        <label>Email</label>
                                        <p>{formData.email || 'Not provided'}</p>
                                    </div>
                                </div>
                                
                                <div className="info-item">
                                    <FaPhone className="info-icon" />
                                    <div>
                                        <label>Phone</label>
                                        <p>{formData.phone || 'Not provided'}</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <FaIdCard className="info-icon" />
                                    <div>
                                        <label>Aadhar Number</label>
                                        <p>{formData.aadhar || 'Not provided'}</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <FaTint className="info-icon" />
                                    <div>
                                        <label>Blood Group</label>
                                        <p>{formData.bloodGroup || 'Not provided'}</p>
                                    </div>
                                </div>
                                
                                <div className="info-item">
                                    <FaMapMarkerAlt className="info-icon" />
                                    <div>
                                        <label>Address</label>
                                        <p>{formData.address || 'Not provided'}</p>
                                    </div>
                                </div>

                                <div className="email-buttons">
                                    <a 
                                        className="btn-gmail"
                                        href={gmailUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                                    >
                                        <FaEnvelope /> Send Email (Gmail)
                                    </a>
                                    <a 
                                        className="btn-mailto"
                                        href={mailtoUrl}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                                    >
                                        <FaEnvelope /> Contact Us (Mailto)
                                    </a>
                                </div>

                                <button 
                                    className="btn-edit-profile"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <FaEdit /> Edit Profile
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleSubmit} className="edit-form">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Aadhar Number (12 digits)</label>
                                    <input
                                        type="text"
                                        name="aadhar"
                                        placeholder="Enter 12-digit Aadhar number (optional)"
                                        value={formData.aadhar}
                                        onChange={handleChange}
                                        maxLength="12"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Blood Group</label>
                                    <select
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Blood Group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="btn-cancel"
                                        onClick={() => setIsEditing(false)}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn-save"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;