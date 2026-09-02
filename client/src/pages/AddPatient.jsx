import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddPatient = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        age: '',
        gender: 'Male',
        bloodGroup: '',
        aadharNumber: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.age) {
            toast.error('Please fill all required fields');
            setLoading(false);
            return;
        }

        try {
            const registerData = {
                name: formData.name,
                email: formData.email,
                password: formData.password || 'patient123',
                phone: formData.phone,
                address: formData.address,
                role: 'patient',
                age: parseInt(formData.age),
                gender: formData.gender,
                bloodGroup: formData.bloodGroup,
                aadharNumber: formData.aadharNumber
            };

            await axios.post('/auth/register', registerData);
            toast.success('Patient added successfully!');
            navigate('/patients');
        } catch (error) {
            console.error('Error adding patient:', error);
            toast.error(error.response?.data?.message || 'Failed to add patient');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ margin: '0 0 5px 0', color: '#1a237e' }}>Add New Patient</h2>
                <p style={{ margin: 0, color: '#666' }}>Register a new patient in the system</p>
            </div>

            <form onSubmit={handleSubmit} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Full Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            required
                            style={{
                                padding: '10px 14px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                width: '100%'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            required
                            style={{
                                padding: '10px 14px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                width: '100%'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Leave blank for default"
                            style={{
                                padding: '10px 14px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                width: '100%'
                            }}
                        />
                        <small style={{ color: '#999', fontSize: '0.75rem' }}>Default: patient123</small>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Phone *</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            required
                            style={{
                                padding: '10px 14px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                width: '100%'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                        <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Address *</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter full address"
                            required
                            style={{
                                padding: '10px 14px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                width: '100%'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Age *</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="Enter age"
                            min="0"
                            max="150"
                            required
                            style={{
                                padding: '10px 14px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                width: '100%'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Gender *</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                            style={{
                                padding: '10px 14px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                width: '100%'
                            }}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Blood Group</label>
                        <select
                            name="bloodGroup"
                            value={formData.bloodGroup}
                            onChange={handleChange}
                            style={{
                                padding: '10px 14px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Aadhar Number</label>
                        <input
                            type="text"
                            name="aadharNumber"
                            value={formData.aadharNumber}
                            onChange={handleChange}
                            placeholder="12-digit Aadhar number"
                            maxLength="12"
                            style={{
                                padding: '10px 14px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                width: '100%'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/patients')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: '#e3f2fd',
                            color: '#1a237e',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: '#1a237e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Adding...' : 'Add Patient'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPatient;