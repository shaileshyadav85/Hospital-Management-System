const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
const profileDir = path.join(uploadDir, 'profiles');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Uploads folder created');
}

if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
    console.log('📁 Profiles folder created');
}

// ✅ Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5000'
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

console.log('📁 Uploads directory:', uploadDir);
console.log('📁 Static files served from: /uploads');

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_db')
.then(() => {
    console.log('✅ MongoDB Connected');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
})
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('💡 Make sure MongoDB is running');
});

// ✅ Root & API Landing Routes (Prevents Cannot GET / and Cannot GET /api)
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Hospital Management System API is live',
        healthCheck: '/api/health'
    });
});

app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Hospital API root reached successfully',
        healthCheck: '/api/health'
    });
});

// ✅ Import routes with error handling
try {
    const authRoutes = require('./routes/authRoutes');
    const doctorRoutes = require('./routes/doctorRoutes');
    const patientRoutes = require('./routes/patientRoutes');
    const appointmentRoutes = require('./routes/appointmentRoutes');
    const billingRoutes = require('./routes/billingRoutes');
    const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
    const adminRoutes = require('./routes/adminRoutes');
    const profileRoutes = require('./routes/profileRoutes');

    console.log('✅ All routes imported successfully');

    // ✅ Register API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/doctors', doctorRoutes);
    app.use('/api/patients', patientRoutes);
    app.use('/api/appointments', appointmentRoutes);
    app.use('/api/billing', billingRoutes);
    app.use('/api/medical-records', medicalRecordRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/profile', profileRoutes);

    console.log('✅ All routes registered');

} catch (error) {
    console.error('❌ Error loading routes:', error.message);
    console.error('❌ Stack:', error.stack);
}

// ✅ Health check route
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: statusMap[dbStatus] || 'unknown',
        uploads: fs.existsSync(uploadDir) ? 'available' : 'not available'
    });
});

// ✅ Test upload route
app.get('/api/test-upload', (req, res) => {
    res.json({
        success: true,
        message: 'Upload system is working',
        uploadDir: uploadDir,
        exists: fs.existsSync(uploadDir)
    });
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB'
        });
    }
    
    if (err.message && err.message.includes('Only image files are allowed')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Something went wrong!'
    });
});

// ✅ 404 handler (Keep at bottom)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('========================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📁 Uploads: http://localhost:${PORT}/uploads/`);
    console.log(`🌐 API Base: http://localhost:${PORT}/api/`);
    console.log('========================================');
});
