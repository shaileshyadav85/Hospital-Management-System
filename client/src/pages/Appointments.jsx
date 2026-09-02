import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaSearch, FaFilter, FaCalendarAlt, FaTimes, FaUserMd, FaCalendarCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Appointments.css';

const Appointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // ✅ Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [doctorFilter, setDoctorFilter] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    // ✅ Apply Filters
    useEffect(() => {
        applyFilters();
    }, [searchTerm, statusFilter, dateFilter, doctorFilter, appointments]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/appointments/my-appointments');
            console.log('📥 Appointments:', res.data);
            setAppointments(res.data.data || []);
            setFilteredAppointments(res.data.data || []);
        } catch (error) {
            console.error('❌ Error fetching appointments:', error);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Filter Function
    const applyFilters = () => {
        let filtered = [...appointments];

        // 1. Search Filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(app => {
                const doctorName = app.doctor?.user?.name?.toLowerCase() || '';
                const patientName = app.patient?.user?.name?.toLowerCase() || '';
                const reason = app.reason?.toLowerCase() || '';
                const specialization = app.doctor?.specialization?.toLowerCase() || '';
                
                return doctorName.includes(term) || 
                       patientName.includes(term) || 
                       reason.includes(term) ||
                       specialization.includes(term);
            });
        }

        // 2. Status Filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter);
        }

        // 3. Date Filter
        if (dateFilter) {
            filtered = filtered.filter(app => {
                const appDate = new Date(app.date).toISOString().split('T')[0];
                return appDate === dateFilter;
            });
        }

        // 4. Doctor Filter
        if (doctorFilter) {
            filtered = filtered.filter(app => {
                const doctorName = app.doctor?.user?.name || '';
                return doctorName === doctorFilter;
            });
        }

        setFilteredAppointments(filtered);
    };

    // ✅ Reset Filters
    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateFilter('');
        setDoctorFilter('');
        toast.success('Filters cleared');
    };

    // ✅ Get unique doctors
    const getUniqueDoctors = () => {
        const doctors = appointments
            .map(app => app.doctor?.user?.name)
            .filter(Boolean);
        return [...new Set(doctors)];
    };

    // ✅ Handle Search Change
    const handleSearchChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSearchTerm(e.target.value);
    };

    // ✅ Handle Status Change
    const handleStatusChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setStatusFilter(e.target.value);
    };

    // ✅ Handle Date Change
    const handleDateChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDateFilter(e.target.value);
    };

    // ✅ Handle Doctor Change
    const handleDoctorChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDoctorFilter(e.target.value);
    };

    return (
        <div className="appointments-page">
            <div className="page-header">
                <div>
                    <h2>Appointments</h2>
                    <p>Manage all your appointments here</p>
                </div>
                <div className="appointment-count">
                    <FaCalendarCheck />
                    <span>{filteredAppointments.length} appointments</span>
                </div>
            </div>

            {/* ✅ FILTERS BAR - Fixed with proper event handling */}
            <div className="filters-bar" onClick={(e) => e.stopPropagation()}>
                {/* 1. Search Box */}
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search by doctor, patient, reason..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                    />
                    {searchTerm && (
                        <button 
                            className="clear-search"
                            onClick={() => setSearchTerm('')}
                            type="button"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                {/* 2. Status Filter */}
                <div className="filter-group">
                    <select
                        value={statusFilter}
                        onChange={handleStatusChange}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* 3. Date Filter */}
                <div className="filter-group">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={handleDateChange}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        className="date-filter"
                    />
                </div>

                {/* 4. Doctor Filter */}
                <div className="filter-group">
                    <select
                        value={doctorFilter}
                        onChange={handleDoctorChange}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                    >
                        <option value="">All Doctors</option>
                        {getUniqueDoctors().map((doctor, index) => (
                            <option key={index} value={doctor}>
                                {doctor}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 5. Reset Button */}
                <button 
                    className="reset-btn" 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        resetFilters();
                    }}
                    type="button"
                >
                    <FaFilter /> Reset
                </button>
            </div>

            {/* ✅ APPOINTMENTS LIST */}
            <div className="appointments-list">
                {loading ? (
                    <div className="loading">Loading appointments...</div>
                ) : filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => (
                        <div key={appointment._id} className="appointment-card">
                            <div className="appointment-header">
                                <div className="doctor-info">
                                    <div className="doctor-avatar">
                                        {appointment.doctor?.user?.name?.charAt(0) || 'D'}
                                    </div>
                                    <div>
                                        <h4>Dr. {appointment.doctor?.user?.name || 'Unknown'}</h4>
                                        <span className="specialization">
                                            {appointment.doctor?.specialization || 'General'}
                                        </span>
                                    </div>
                                </div>
                                <span className={`status-badge ${appointment.status}`}>
                                    {appointment.status}
                                </span>
                            </div>

                            <div className="appointment-details">
                                <div className="detail-item">
                                    <span className="label">Patient:</span>
                                    <span>{appointment.patient?.user?.name || 'Unknown'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Date:</span>
                                    <span>{new Date(appointment.date).toLocaleDateString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Time:</span>
                                    <span>{appointment.time}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Reason:</span>
                                    <span>{appointment.reason || 'No reason'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-appointments">
                        <div className="no-data-icon">📅</div>
                        <p>No appointments found matching your filters</p>
                        <button 
                            className="btn-primary" 
                            onClick={(e) => {
                                e.preventDefault();
                                resetFilters();
                            }}
                            type="button"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointments;