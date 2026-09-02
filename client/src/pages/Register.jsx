import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaIdCard, FaTint } from 'react-icons/fa';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient',
        phone: '',
        address: '',
        age: '',
        gender: 'Male',
        bloodGroup: '',        // ✅ ADDED
        aadharNumber: '',      // ✅ ADDED
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ✅ Validate password match
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        // ✅ Validate Aadhar (if provided)
        if (formData.aadharNumber && !/^[0-9]{12}$/.test(formData.aadharNumber)) {
            alert('Aadhar number must be 12 digits');
            return;
        }

        setLoading(true);
        const { confirmPassword, ...registerData } = formData;
        const result = await register(registerData);
        
        if (result.success) {
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card register-card">
                <div className="auth-header">
                    <span className="auth-icon">🏥</span>
                    <h2>Create Account</h2>
                    <p>Register to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min 6 characters"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm password"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter address"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Role</label>
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Age</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="Enter age"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* ✅ NEW: Blood Group */}
                        <div className="form-group">
                            <label>Blood Group</label>
                            <select 
                                name="bloodGroup" 
                                value={formData.bloodGroup} 
                                onChange={handleChange}
                                style={{
                                    padding: '12px 16px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    background: 'white',
                                    width: '100%'
                                }}
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
                    </div>

                    {/* ✅ NEW: Aadhar Number - Full Width */}
                    <div className="form-group" style={{ marginTop: '4px' }}>
                        <label>Aadhar Number (12 digits) <span style={{ color: '#999', fontSize: '0.8rem' }}>(optional)</span></label>
                        <input
                            type="text"
                            name="aadharNumber"
                            value={formData.aadharNumber}
                            onChange={handleChange}
                            placeholder="Enter 12-digit Aadhar number"
                            maxLength="12"
                            pattern="[0-9]{12}"
                            style={{
                                padding: '12px 16px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                width: '100%'
                            }}
                        />
                        <small style={{ color: '#999', fontSize: '0.75rem', marginTop: '4px' }}>
                            <FaIdCard style={{ marginRight: '4px' }} />
                            Enter 12-digit Aadhar number (optional)
                        </small>
                    </div>

                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;