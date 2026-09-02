import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaUserMd, FaStar, FaCalendarPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Doctors.css';

const Doctors = () => {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [specialization, setSpecialization] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await axios.get('/api/doctors');
            setDoctors(res.data.data || []);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialization = !specialization || doctor.specialization === specialization;
        return matchesSearch && matchesSpecialization;
    });

    const specializations = [...new Set(doctors.map(d => d.specialization))];

    return (
        <div className="doctors-page">
            <div className="page-header">
                <div>
                    <h2>Our Doctors</h2>
                    <p>Find and book appointments with our specialists</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="filters-bar">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search doctors by name or specialization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="specialization-filter"
                >
                    <option value="">All Specializations</option>
                    {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                    ))}
                </select>
            </div>

            {/* Doctors Grid */}
            {loading ? (
                <div className="loading">Loading doctors...</div>
            ) : (
                <div className="doctors-grid">
                    {filteredDoctors.map((doctor) => (
                        <div key={doctor._id} className="doctor-card">
                            <div className="doctor-card-header">
                                <img 
                                    src={doctor.user.profileImage || '/default-doctor.png'} 
                                    alt={doctor.user.name}
                                    className="doctor-image"
                                />
                                <div className="doctor-rating">
                                    <FaStar className="star" />
                                    <span>{doctor.rating || '4.5'}</span>
                                </div>
                            </div>
                            <div className="doctor-card-body">
                                <h3>Dr. {doctor.user.name}</h3>
                                <p className="specialization">{doctor.specialization}</p>
                                <p className="experience">{doctor.experience} years experience</p>
                                <p className="fee">Consultation: ₹{doctor.consultationFee}</p>
                                <div className="availability">
                                    <span>Available: {doctor.availability.days.slice(0, 3).join(', ')}</span>
                                </div>
                            </div>
                            <div className="doctor-card-footer">
                                <button 
                                    className="btn-book"
                                    onClick={() => {/* Navigate to booking */}}
                                >
                                    <FaCalendarPlus /> Book Appointment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredDoctors.length === 0 && (
                <div className="no-doctors">
                    <p>No doctors found matching your criteria</p>
                </div>
            )}
        </div>
    );
};

export default Doctors;