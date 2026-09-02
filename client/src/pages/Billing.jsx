import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaMoneyBillWave, FaFileInvoice, FaDownload } from 'react-icons/fa';
import './Billing.css';

const Billing = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const res = await axios.get('/api/billing/patient/me');
            setBills(res.data.data || []);
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'paid': return '#4caf50';
            case 'pending': return '#ff9800';
            case 'overdue': return '#f44336';
            default: return '#999';
        }
    };

    return (
        <div className="billing-page">
            <div className="page-header">
                <div>
                    <h2>Billing</h2>
                    <p>View and manage your bills</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="billing-summary">
                <div className="summary-card">
                    <div className="summary-icon">
                        <FaMoneyBillWave />
                    </div>
                    <div>
                        <h4>Total Due</h4>
                        <p className="amount">₹{bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.total, 0).toFixed(2)}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">
                        <FaFileInvoice />
                    </div>
                    <div>
                        <h4>Total Bills</h4>
                        <p className="amount">{bills.length}</p>
                    </div>
                </div>
            </div>

            {/* Bills List */}
            {loading ? (
                <div className="loading">Loading bills...</div>
            ) : (
                <div className="bills-list">
                    {bills.length > 0 ? (
                        bills.map((bill) => (
                            <div key={bill._id} className="bill-card">
                                <div className="bill-header">
                                    <div>
                                        <h4>#{bill.invoiceNumber}</h4>
                                        <span className="bill-date">
                                            {new Date(bill.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span 
                                        className="status-badge"
                                        style={{ background: getStatusColor(bill.status) + '20', color: getStatusColor(bill.status) }}
                                    >
                                        {bill.status}
                                    </span>
                                </div>
                                <div className="bill-details">
                                    <div className="bill-items">
                                        {bill.items.map((item, idx) => (
                                            <div key={idx} className="bill-item">
                                                <span>{item.description}</span>
                                                <span>₹{item.total.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bill-total">
                                        <div>
                                            <span>Subtotal:</span>
                                            <span>₹{bill.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span>Tax:</span>
                                            <span>₹{bill.tax.toFixed(2)}</span>
                                        </div>
                                        {bill.discount > 0 && (
                                            <div>
                                                <span>Discount:</span>
                                                <span>-₹{bill.discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="total-amount">
                                            <span>Total:</span>
                                            <span>₹{bill.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bill-actions">
                                    <button className="btn-download">
                                        <FaDownload /> Download Invoice
                                    </button>
                                    {bill.status === 'pending' && (
                                        <button className="btn-pay">Pay Now</button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-bills">
                            <p>No bills found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Billing;