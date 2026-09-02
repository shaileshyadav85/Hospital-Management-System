import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaUser, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        filterPatients();
    }, [searchTerm, patients]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/patients');
            console.log('📥 Patients response:', res.data);
            setPatients(res.data?.data || []);
            setFilteredPatients(res.data?.data || []);
            
            if (res.data?.data?.length === 0) {
                toast.info('No patients found. Add your first patient!');
            }
        } catch (error) {
            console.error('❌ Error fetching patients:', error);
            
            // Better error messages
            if (error.response?.status === 403) {
                toast.error('You are not authorized to view patients');
            } else if (error.response?.status === 401) {
                toast.error('Please login to view patients');
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to load patients');
            }
            
            setPatients([]);
            setFilteredPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const filterPatients = () => {
        if (!searchTerm.trim()) {
            setFilteredPatients(patients);
            return;
        }
        const term = searchTerm.toLowerCase().trim();
        const filtered = patients.filter(p => 
            p.user?.name?.toLowerCase().includes(term) ||
            p.user?.email?.toLowerCase().includes(term) ||
            p.user?.phone?.includes(term)
        );
        setFilteredPatients(filtered);
    };

    // ✅ DELETE PATIENT - Better Error Handling
    const deletePatient = async (id) => {
        if (!window.confirm('⚠️ Are you sure you want to delete this patient? This action cannot be undone!')) {
            return;
        }
        
        setDeletingId(id);
        
        try {
            console.log('🗑️ Deleting patient:', id);
            const res = await axios.delete(`/patients/${id}`);
            console.log('✅ Delete response:', res.data);
            
            if (res.data.success) {
                toast.success('Patient deleted successfully!');
                fetchPatients(); // Refresh list
            } else {
                toast.error(res.data.message || 'Failed to delete patient');
            }
        } catch (error) {
            console.error('❌ Delete error:', error);
            
            // ✅ Better error messages based on status
            if (error.response?.status === 403) {
                toast.error('❌ You are not authorized to delete this patient');
            } else if (error.response?.status === 404) {
                toast.error('❌ Patient not found');
            } else if (error.response?.status === 401) {
                toast.error('❌ Please login to delete patient');
            } else if (error.response?.data?.message) {
                toast.error(`❌ ${error.response.data.message}`);
            } else {
                toast.error('❌ Failed to delete patient. Please try again.');
            }
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#1a237e' }}>Patients</h2>
                    <p style={{ margin: 0, color: '#666' }}>
                        Total Patients: <strong>{patients.length}</strong>
                    </p>
                </div>
                <button 
                    onClick={() => navigate('/patients/add')}
                    style={{
                        padding: '10px 24px',
                        background: '#1a237e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#0d47a1';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(26,35,126,0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = '#1a237e';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    <FaPlus /> Add Patient
                </button>
            </div>

            {/* Search Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'white',
                borderRadius: '12px',
                padding: '0 16px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '2px solid transparent',
                transition: 'all 0.3s'
            }}
            onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1a237e';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,35,126,0.1)';
            }}
            onBlur={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
            >
                <FaSearch style={{ color: '#999', marginRight: '12px' }} />
                <input
                    type="text"
                    placeholder="Search patients by name, email or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        border: 'none',
                        padding: '14px 0',
                        width: '100%',
                        fontSize: '0.95rem',
                        outline: 'none',
                        background: 'transparent'
                    }}
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#999',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            padding: '0 8px',
                            transition: 'color 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#f44336'}
                        onMouseLeave={(e) => e.target.style.color = '#999'}
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Loading State */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #1a237e',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 12px'
                    }}></div>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                    Loading patients...
                </div>
            ) : filteredPatients.length === 0 ? (
                /* Empty State */
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>👤</div>
                    <p style={{ color: '#666', fontSize: '1.1rem' }}>No patients found</p>
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>
                        {searchTerm ? 'Try adjusting your search' : 'Register a new patient to get started'}
                    </p>
                    <button 
                        onClick={() => navigate('/patients/add')}
                        style={{
                            padding: '10px 24px',
                            background: '#1a237e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginTop: '10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <FaPlus /> Add First Patient
                    </button>
                </div>
            ) : (
                /* Patients List */
                <div style={{ display: 'grid', gap: '16px' }}>
                    {filteredPatients.map((patient) => (
                        <div key={patient._id} style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        >
                            {/* Avatar */}
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #1a237e, #0d47a1)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: '600',
                                flexShrink: 0
                            }}>
                                {patient.user?.name?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            
                            {/* Info */}
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 4px', color: '#1a237e', fontSize: '1.1rem' }}>
                                    {patient.user?.name || 'Unknown'}
                                </h3>
                                <p style={{ margin: '0 0 6px', color: '#666', fontSize: '0.9rem' }}>
                                    📧 {patient.user?.email || ''}
                                </p>
                                <p style={{ display: 'flex', gap: '16px', margin: 0, color: '#333', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                                    <span>📱 {patient.user?.phone || 'N/A'}</span>
                                    <span>🎂 {patient.age || 'N/A'} yrs</span>
                                    <span>🩸 {patient.user?.bloodGroup || 'N/A'}</span>
                                    <span>🆔 {patient.user?.aadharNumber || 'N/A'}</span>
                                </p>
                            </div>
                            
                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                <button 
                                    onClick={() => navigate(`/patients/edit/${patient._id}`)}
                                    style={{
                                        padding: '8px 12px',
                                        background: '#e3f2fd',
                                        color: '#1a237e',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = '#bbdefb';
                                        e.target.style.transform = 'scale(1.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = '#e3f2fd';
                                        e.target.style.transform = 'scale(1)';
                                    }}
                                >
                                    <FaEdit />
                                </button>
                                <button 
                                    onClick={() => deletePatient(patient._id)}
                                    disabled={deletingId === patient._id}
                                    style={{
                                        padding: '8px 12px',
                                        background: deletingId === patient._id ? '#ffcdd2' : '#ffebee',
                                        color: '#f44336',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: deletingId === patient._id ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s',
                                        opacity: deletingId === patient._id ? 0.6 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!deletingId) {
                                            e.target.style.background = '#ffcdd2';
                                            e.target.style.transform = 'scale(1.05)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!deletingId) {
                                            e.target.style.background = '#ffebee';
                                            e.target.style.transform = 'scale(1)';
                                        }
                                    }}
                                >
                                    {deletingId === patient._id ? 'Deleting...' : <FaTrash />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Patients;