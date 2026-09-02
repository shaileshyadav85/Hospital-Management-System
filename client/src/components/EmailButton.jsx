import React from 'react';
import { FaEnvelope } from 'react-icons/fa';

const EmailButton = ({ email, subject, body, children }) => {
    const openGmail = () => {
        const to = email || 'hospital@gmail.com';
        const sub = subject || 'Query from Hospital Management System';
        const bdy = body || 'Hello, I would like to inquire about...';
        
        const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(sub)}&body=${encodeURIComponent(bdy)}`;
        window.open(url, '_blank', 'width=800,height=600');
    };

    return (
        <button 
            onClick={openGmail}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#1a237e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
                e.target.style.background = '#0d47a1';
                e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.target.style.background = '#1a237e';
                e.target.style.transform = 'translateY(0)';
            }}
        >
            <FaEnvelope />
            {children || 'Send Email'}
        </button>
    );
};

export default EmailButton;