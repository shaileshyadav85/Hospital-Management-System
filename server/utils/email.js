const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send email
exports.sendEmail = async (to, subject, html, text) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: html || text,
            text: text || html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending error:', error);
        throw error;
    }
};

// Send appointment confirmation
exports.sendAppointmentConfirmation = async (email, patientName, doctorName, date, time) => {
    const subject = 'Appointment Confirmation';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a237e;">Appointment Confirmation</h2>
            <p>Dear ${patientName},</p>
            <p>Your appointment has been confirmed with the following details:</p>
            <ul style="list-style: none; padding: 0;">
                <li><strong>Doctor:</strong> Dr. ${doctorName}</li>
                <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
                <li><strong>Time:</strong> ${time}</li>
            </ul>
            <p>Please arrive 15 minutes before your scheduled time.</p>
            <p>Thank you for choosing our hospital.</p>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
    `;
    
    return await exports.sendEmail(email, subject, html);
};

// Send appointment reminder
exports.sendAppointmentReminder = async (email, patientName, doctorName, date, time) => {
    const subject = 'Appointment Reminder';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a237e;">Appointment Reminder</h2>
            <p>Dear ${patientName},</p>
            <p>This is a reminder for your upcoming appointment:</p>
            <ul style="list-style: none; padding: 0;">
                <li><strong>Doctor:</strong> Dr. ${doctorName}</li>
                <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
                <li><strong>Time:</strong> ${time}</li>
            </ul>
            <p>Please ensure you arrive on time.</p>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
    `;
    
    return await exports.sendEmail(email, subject, html);
};