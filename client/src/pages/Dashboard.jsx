import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    FaUsers, FaUserMd, FaCalendarCheck, FaMoneyBillWave,
    FaStethoscope, FaPills, FaAmbulance, FaChartLine,
    FaEye, FaPlus
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        todayAppointments: 0,
        totalRevenue: 0,
        pendingAppointments: 0
    });
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                
                // ✅ FIXED: No /api prefix - Sirf ye lines change hui hain
                const [appointmentsRes, patientsRes, doctorsRes, revenueRes] = await Promise.all([
                    axios.get('/appointments/my-appointments'),
                    axios.get('/patients/count'),
                    axios.get('/doctors/count'),
                    axios.get('/billing/revenue')
                ]);

                const today = new Date().toISOString().split('T')[0];
                const todayApps = appointmentsRes.data?.data?.filter(
                    a => new Date(a.date).toISOString().split('T')[0] === today
                ) || [];

                const pendingApps = appointmentsRes.data?.data?.filter(
                    a => a.status === 'pending' || a.status === 'confirmed'
                ) || [];

                setStats({
                    totalPatients: patientsRes.data?.count || 0,
                    totalDoctors: doctorsRes.data?.count || 0,
                    todayAppointments: todayApps.length,
                    totalRevenue: revenueRes.data?.total || 0,
                    pendingAppointments: pendingApps.length
                });

                const recent = appointmentsRes.data?.data?.slice(0, 5) || [];
                setRecentAppointments(recent);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Navigation Functions
    const goToDoctors = () => navigate('/doctors');
    const goToAppointments = () => navigate('/appointments');
    const goToBilling = () => navigate('/billing');
    const goToPatients = () => navigate('/patients');
    const goToReports = () => navigate('/admin/reports');

    // Quick Actions
    const handleBookAppointment = () => setShowModal(true);
    const handleAddPatient = () => {
        toast.success('Navigating to add patient...');
        navigate('/patients/add');
    };
    const handleWritePrescription = () => {
        toast.success('Opening prescription...');
        navigate('/medical-records/add');
    };
    const handleEmergency = () => {
        toast.error('🚨 Emergency alert sent to all staff!');
    };
    const handleReports = () => {
        toast.success('Loading reports...');
        navigate('/admin/reports');
    };

    // Stat Cards
    const statCards = [
        { 
            icon: FaUsers, 
            label: 'Total Patients', 
            value: stats.totalPatients, 
            color: '#4CAF50',
            bgColor: '#e8f5e9',
            onClick: goToPatients
        },
        { 
            icon: FaUserMd, 
            label: 'Total Doctors', 
            value: stats.totalDoctors, 
            color: '#2196F3',
            bgColor: '#e3f2fd',
            onClick: goToDoctors
        },
        { 
            icon: FaCalendarCheck, 
            label: "Today's Appointments", 
            value: stats.todayAppointments, 
            color: '#FF9800',
            bgColor: '#fff3e0',
            onClick: goToAppointments
        },
        { 
            icon: FaMoneyBillWave, 
            label: 'Total Revenue', 
            value: `₹${stats.totalRevenue.toLocaleString()}`, 
            color: '#9C27B0',
            bgColor: '#f3e5f5',
            onClick: goToBilling
        },
    ];

    // Quick Actions Data
    const quickActions = [
        { icon: FaStethoscope, label: 'Book Appointment', color: '#1a237e', onClick: handleBookAppointment },
        { icon: FaPlus, label: 'Add Patient', color: '#4caf50', onClick: handleAddPatient },
        { icon: FaPills, label: 'Write Prescription', color: '#ff9800', onClick: handleWritePrescription },
        { icon: FaAmbulance, label: 'Emergency', color: '#f44336', onClick: handleEmergency },
        { icon: FaChartLine, label: 'Reports', color: '#9c27b0', onClick: handleReports },
    ];

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return '#ff9800';
            case 'confirmed': return '#2196f3';
            case 'completed': return '#4caf50';
            case 'cancelled': return '#f44336';
            default: return '#999';
        }
    };

    return (
        <div className="dashboard">
            {/* Welcome Section */}
            <div className="welcome-section">
                <div>
                    <h2>Welcome back, {user?.name || 'User'}! 👋</h2>
                    <p>Here's what's happening with your hospital today.</p>
                </div>
                <div className="quick-actions-header">
                    <button className="btn-primary" onClick={handleBookAppointment} type="button">
                        <FaStethoscope /> Book Appointment
                    </button>
                    <button className="btn-secondary" onClick={handleAddPatient} type="button">
                        <FaPlus /> Add Patient
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div 
                        key={index} 
                        className="stat-card"
                        onClick={stat.onClick}
                    >
                        <div className="stat-icon" style={{ background: stat.bgColor, color: stat.color }}>
                            <stat.icon />
                        </div>
                        <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                        <div className="stat-arrow">
                            <FaEye />
                        </div>
                    </div>
                ))}
            </div>

            {/* Dashboard Grid */}
            <div className="dashboard-grid">
                {/* Recent Appointments */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>Recent Appointments</h3>
                        <button className="view-all" onClick={goToAppointments} type="button">
                            View All →
                        </button>
                    </div>
                    <div className="appointments-list">
                        {loading ? (
                            <div className="loading">Loading appointments...</div>
                        ) : recentAppointments.length > 0 ? (
                            recentAppointments.map((appointment) => (
                                <div 
                                    key={appointment._id} 
                                    className="appointment-item"
                                    onClick={() => navigate(`/appointments/${appointment._id}`)}
                                >
                                    <div className="appointment-info">
                                        <span className="patient-name">
                                            {appointment.patient?.user?.name || 'Patient'}
                                        </span>
                                        <span className="appointment-date">
                                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                                        </span>
                                    </div>
                                    <span 
                                        className="status-badge"
                                        style={{ 
                                            background: getStatusColor(appointment.status) + '20', 
                                            color: getStatusColor(appointment.status) 
                                        }}
                                    >
                                        {appointment.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">
                                <p>No recent appointments</p>
                                <button className="btn-primary" onClick={handleBookAppointment} type="button">
                                    Book your first appointment
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-card quick-actions-card">
                    <div className="card-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="quick-actions-grid">
                        {quickActions.map((action, index) => (
                            <button 
                                key={index} 
                                className="action-btn"
                                onClick={action.onClick}
                                type="button"
                            >
                                <action.icon style={{ color: action.color }} />
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Book Appointment Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>📋 Book Appointment</h3>
                        <p>Redirecting to appointments page...</p>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowModal(false)} type="button">
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={() => {
                                setShowModal(false);
                                navigate('/appointments');
                            }} type="button">
                                Go to Appointments
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;