import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import MedicalRecords from './pages/MedicalRecords';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import Patients from './pages/Patients';
import AddPatient from './pages/AddPatient';

// Layout
import Layout from './components/Layout';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                            borderRadius: '12px',
                            padding: '16px',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#4ade80',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 4000,
                            iconTheme: {
                                primary: '#f87171',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />

                    {/* Protected Routes */}
                    <Route element={<PrivateRoute />}>
                        <Route element={<Layout />}>
                            {/* Main Pages */}
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/doctors" element={<Doctors />} />
                            <Route path="/appointments" element={<Appointments />} />
                            <Route path="/medical-records" element={<MedicalRecords />} />
                            <Route path="/billing" element={<Billing />} />
                            <Route path="/profile" element={<Profile />} />
                            
                            {/* Patient Routes */}
                            <Route path="/patients" element={<Patients />} />
                            <Route path="/patients/add" element={<AddPatient />} />
                        </Route>
                    </Route>

                    {/* 404 Page */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

// 404 Not Found Component
const NotFound = () => (
    <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
        padding: '20px'
    }}>
        <div style={{
            background: 'white',
            padding: '60px',
            borderRadius: '24px',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}>
            <div style={{ fontSize: '6rem', marginBottom: '20px' }}>😕</div>
            <h2 style={{ color: '#1a237e', marginBottom: '10px' }}>Page Not Found</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                The page you're looking for doesn't exist or has been moved.
            </p>
            <a href="/dashboard" style={{
                padding: '12px 30px',
                background: '#1a237e',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.3s'
            }}>
                Go to Dashboard
            </a>
        </div>
    </div>
);

export default App;