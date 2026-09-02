import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    FaPlus, FaFileMedical, FaSearch, FaEye, FaEdit, FaTrash, 
    FaDownload, FaCalendarAlt, FaUserMd 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import './MedicalRecords.css';

const MedicalRecords = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        fetchRecords();
    }, []);

    useEffect(() => {
        filterRecords();
    }, [searchTerm, records]);

    // ✅ FIXED: fetchRecords function
    const fetchRecords = async () => {
        try {
            setLoading(true);
            
            // ✅ Get user ID from auth
            const userRes = await axios.get('/auth/me');
            const userId = userRes.data?.data?.user?.id || userRes.data?.user?.id;
            
            if (!userId) {
                console.log('No user ID found');
                setRecords([]);
                setFilteredRecords([]);
                setLoading(false);
                return;
            }

            // ✅ Find patient by user ID
            try {
                const patientRes = await axios.get(`/patients/user/${userId}`);
                const patientId = patientRes.data?.data?._id;
                
                if (!patientId) {
                    console.log('No patient profile found');
                    setRecords([]);
                    setFilteredRecords([]);
                    setLoading(false);
                    return;
                }

                // ✅ Get medical records
                const res = await axios.get(`/medical-records/patient/${patientId}`);
                setRecords(res.data?.data || []);
                setFilteredRecords(res.data?.data || []);
                
                if (res.data?.data?.length === 0) {
                    console.log('No medical records found');
                }
            } catch (patientError) {
                // ✅ If patient not found, it's okay - just show empty state
                if (patientError.response?.status === 404) {
                    console.log('Patient profile not found. Please complete your profile.');
                    setRecords([]);
                    setFilteredRecords([]);
                } else {
                    throw patientError;
                }
            }
        } catch (error) {
            console.error('Error fetching medical records:', error);
            // ✅ Don't show error toast for empty records
            if (error.response?.status !== 404) {
                toast.error('Failed to load medical records');
            }
            setRecords([]);
            setFilteredRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const filterRecords = () => {
        if (!searchTerm.trim()) {
            setFilteredRecords(records);
            return;
        }
        const term = searchTerm.toLowerCase().trim();
        const filtered = records.filter(r => 
            r.diagnosis?.toLowerCase().includes(term) ||
            r.doctor?.user?.name?.toLowerCase().includes(term) ||
            r.treatmentPlan?.toLowerCase().includes(term)
        );
        setFilteredRecords(filtered);
    };

    const deleteRecord = async (id) => {
        if (!window.confirm('Are you sure you want to delete this medical record?')) return;
        try {
            await axios.delete(`/medical-records/${id}`);
            toast.success('Medical record deleted successfully');
            fetchRecords();
        } catch (error) {
            toast.error('Failed to delete record');
        }
    };

    const viewRecord = (record) => {
        setSelectedRecord(record);
        setShowModal(true);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'active': return '#4caf50';
            case 'completed': return '#2196f3';
            case 'pending': return '#ff9800';
            default: return '#999';
        }
    };

    return (
        <div className="medical-records-page">
            <div className="page-header">
                <div>
                    <h2>Medical Records</h2>
                    <p>Manage your medical history and health records</p>
                </div>
                <button 
                    className="btn-primary"
                    onClick={() => navigate('/medical-records/add')}
                >
                    <FaPlus /> Add Record
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
                <FaSearch />
                <input
                    type="text"
                    placeholder="Search by diagnosis, doctor, treatment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                        ✕
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading">Loading medical records...</div>
            ) : filteredRecords.length === 0 ? (
                <div className="no-data">
                    <FaFileMedical className="no-data-icon" />
                    <p>No medical records found</p>
                    <p className="sub-text">Add your first medical record to get started</p>
                    <button className="btn-primary" onClick={() => navigate('/medical-records/add')}>
                        <FaPlus /> Add First Record
                    </button>
                </div>
            ) : (
                <div className="records-grid">
                    {filteredRecords.map((record) => (
                        <div key={record._id} className="record-card">
                            <div className="record-header">
                                <div className="record-icon">
                                    <FaFileMedical />
                                </div>
                                <div className="record-info">
                                    <h3>{record.diagnosis || 'Unknown Diagnosis'}</h3>
                                    <p>
                                        <FaUserMd /> Dr. {record.doctor?.user?.name || 'Unknown Doctor'}
                                    </p>
                                    <p>
                                        <FaCalendarAlt /> {new Date(record.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span 
                                    className="status-badge"
                                    style={{ 
                                        background: getStatusColor(record.status) + '20', 
                                        color: getStatusColor(record.status) 
                                    }}
                                >
                                    {record.status || 'Active'}
                                </span>
                            </div>

                            <div className="record-body">
                                {record.symptoms && record.symptoms.length > 0 && (
                                    <div className="record-symptoms">
                                        <strong>Symptoms:</strong>
                                        <div className="symptoms-tags">
                                            {record.symptoms.map((symptom, idx) => (
                                                <span key={idx} className="symptom-tag">{symptom}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {record.treatmentPlan && (
                                    <div className="record-treatment">
                                        <strong>Treatment:</strong>
                                        <p>{record.treatmentPlan}</p>
                                    </div>
                                )}
                            </div>

                            <div className="record-actions">
                                <button className="btn-view" onClick={() => viewRecord(record)}>
                                    <FaEye /> View
                                </button>
                                <button className="btn-edit" onClick={() => navigate(`/medical-records/edit/${record._id}`)}>
                                    <FaEdit /> Edit
                                </button>
                                <button className="btn-delete" onClick={() => deleteRecord(record._id)}>
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Record Modal */}
            {showModal && selectedRecord && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Medical Record Details</h3>
                        <div className="modal-body">
                            <div className="modal-row">
                                <label>Diagnosis:</label>
                                <p>{selectedRecord.diagnosis || 'N/A'}</p>
                            </div>
                            <div className="modal-row">
                                <label>Doctor:</label>
                                <p>Dr. {selectedRecord.doctor?.user?.name || 'Unknown'}</p>
                            </div>
                            <div className="modal-row">
                                <label>Date:</label>
                                <p>{new Date(selectedRecord.createdAt).toLocaleDateString()}</p>
                            </div>
                            {selectedRecord.symptoms && selectedRecord.symptoms.length > 0 && (
                                <div className="modal-row">
                                    <label>Symptoms:</label>
                                    <div className="symptoms-tags">
                                        {selectedRecord.symptoms.map((s, idx) => (
                                            <span key={idx} className="symptom-tag">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selectedRecord.treatmentPlan && (
                                <div className="modal-row">
                                    <label>Treatment Plan:</label>
                                    <p>{selectedRecord.treatmentPlan}</p>
                                </div>
                            )}
                            {selectedRecord.notes && (
                                <div className="modal-row">
                                    <label>Notes:</label>
                                    <p>{selectedRecord.notes}</p>
                                </div>
                            )}
                            {selectedRecord.followUpDate && (
                                <div className="modal-row">
                                    <label>Follow-up Date:</label>
                                    <p>{new Date(selectedRecord.followUpDate).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>
                                Close
                            </button>
                            <button className="btn-primary" onClick={() => {
                                setShowModal(false);
                                navigate(`/medical-records/edit/${selectedRecord._id}`);
                            }}>
                                Edit Record
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalRecords;