# 🏥 Hospital Management System

A complete full-stack Hospital Management System built with the MERN stack (MongoDB, Express.js, React, Node.js). This system helps hospitals manage patients, doctors, appointments, medical records, billing, and more.

## 🌐 Live Demo

- **Frontend:** [https://hospital-management.vercel.app](https://hospital-management.vercel.app)
- **Backend API:** [https://hospital-api.onrender.com/api](https://hospital-api.onrender.com/api)
- **Health Check:** [https://hospital-api.onrender.com/api/health](https://hospital-api.onrender.com/api/health)

## 📸 Screenshots

| Dashboard | Patients | Appointments |
|-----------|----------|--------------|
| ![Dashboard](https://via.placeholder.com/300x150?text=Dashboard) | ![Patients](https://via.placeholder.com/300x150?text=Patients) | ![Appointments](https://via.placeholder.com/300x150?text=Appointments) |

| Medical Records | Billing | Profile |
|-----------------|---------|---------|
| ![Medical Records](https://via.placeholder.com/300x150?text=Medical+Records) | ![Billing](https://via.placeholder.com/300x150?text=Billing) | ![Profile](https://via.placeholder.com/300x150?text=Profile) |

## ✨ Features

### ✅ Current Features (Implemented)

#### 🔐 Authentication & Authorization
- User registration with email/password
- Login with JWT token authentication
- Role-based access (Admin, Doctor, Patient)
- Password encryption with bcrypt
- Protected routes for authenticated users

#### 👤 Patient Management
- Add, Edit, Delete patients
- View patient list with search functionality
- Patient profile with personal details
- Aadhar number and blood group tracking
- Patient medical history tracking

#### 👨‍⚕️ Doctor Management
- Add, Edit, Delete doctors
- Doctor specialization and experience
- Consultation fee management
- Doctor availability tracking
- Doctor rating system

#### 📅 Appointment Booking
- Book appointments with doctors
- View appointment history
- Appointment status tracking (Pending, Confirmed, Completed, Cancelled)
- Date and time slot management
- Appointment reminders

#### 📋 Medical Records
- Add medical records for patients
- Track diagnosis, symptoms, and treatment
- Prescription management
- Follow-up date tracking
- Lab report attachments (coming soon)

#### 💰 Billing System
- Generate bills for patients
- Track payment status (Pending, Paid, Overdue)
- Revenue reports and analytics
- Invoice generation
- Discount and tax calculation

#### 📊 Dashboard
- Real-time statistics
- Total patients, doctors, appointments
- Today's appointments
- Quick actions (Book Appointment, Add Patient, etc.)
- Recent appointments list
- Revenue overview

#### 👤 Profile Management
- Update profile information
- Upload profile photo
- Change password
- View personal details
- Aadhar and blood group in profile

### 🚀 Future Features (Planned)

| Feature | Description | Priority |
|---------|-------------|----------|
| 🎥 **Video Consultation** | Real-time video calling between doctor and patient | High |
| 🤖 **AI Symptom Checker** | AI-powered preliminary diagnosis based on symptoms | Medium |
| 💳 **Online Payment** | Integrated payment gateway for bills | High |
| 📱 **SMS Notifications** | Appointment reminders via SMS | Medium |
| 📧 **Email Notifications** | Automated emails for appointments, bills, etc. | High |
| 📊 **Advanced Analytics** | Detailed charts and reports for hospital performance | Medium |
| 🏥 **Pharmacy Module** | Medicine inventory and prescription fulfillment | Medium |
| 🔬 **Lab Module** | Lab test management and report generation | Medium |
| 📅 **Calendar Integration** | Google Calendar sync for appointments | Low |
| 🌙 **Dark Mode** | Dark theme for better user experience | Low |
| 🌍 **Multi-language** | Support for multiple languages | Low |
| 📱 **Mobile App** | React Native mobile application | Future |
| 🏠 **Bed Management** | Hospital bed availability tracking | Medium |
| ⚕️ **Ambulance Service** | Ambulance tracking and booking | Low |
| 📋 **Digital Prescriptions** | Digital prescription sharing with pharmacies | Medium |
| 🔔 **Emergency Alerts** | Real-time emergency notifications | High |

## 🛠️ Technologies Used

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Library |
| **React Router v6** | Navigation |
| **Axios** | HTTP Client |
| **React Icons** | Icons |
| **React Hot Toast** | Notifications |
| **CSS3** | Styling |
| **Vite** | Build Tool |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime Environment |
| **Express.js** | Web Framework |
| **MongoDB** | Database |
| **Mongoose** | ODM |
| **JWT** | Authentication |
| **Bcrypt** | Password Hashing |
| **Multer** | File Upload |
| **Nodemailer** | Email Service |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Git** | Version Control |
| **GitHub** | Repository Hosting |
| **Render** | Backend Hosting |
| **Vercel** | Frontend Hosting |
| **MongoDB Atlas** | Database Hosting |

## 📁 Project Shospital-management-system/
├── client/ # Frontend React App
│ ├── src/
│ │ ├── components/ # Reusable components
│ │ │ ├── Layout.jsx
│ │ │ ├── Layout.css
│ │ │ └── PrivateRoute.jsx
│ │ ├── context/ # React Context
│ │ │ └── AuthContext.jsx
│ │ ├── pages/ # Page components
│ │ │ ├── Dashboard.jsx
│ │ │ ├── Patients.jsx
│ │ │ ├── Doctors.jsx
│ │ │ ├── Appointments.jsx
│ │ │ ├── MedicalRecords.jsx
│ │ │ ├── Billing.jsx
│ │ │ ├── Profile.jsx
│ │ │ ├── Login.jsx
│ │ │ └── Register.jsx
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css
│ ├── package.json
│ └── vite.config.js
├── server/ # Backend Node.js App
│ ├── controllers/ # Controllers
│ │ ├── authController.js
│ │ ├── patientController.js
│ │ ├── doctorController.js
│ │ ├── appointmentController.js
│ │ ├── medicalRecordController.js
│ │ └── billingController.js
│ ├── models/ # Database Models
│ │ ├── User.js
│ │ ├── Patient.js
│ │ ├── Doctor.js
│ │ ├── Appointment.js
│ │ ├── MedicalRecord.js
│ │ └── Billing.js
│ ├── routes/ # API Routes
│ │ ├── authRoutes.js
│ │ ├── patientRoutes.js
│ │ ├── doctorRoutes.js
│ │ ├── appointmentRoutes.js
│ │ ├── medicalRecordRoutes.js
│ │ └── billingRoutes.js
│ ├── middleware/ # Middleware
│ │ ├── auth.js
│ │ └── upload.js
│ ├── utils/ # Utilities
│ │ └── email.js
│ ├── server.js
│ ├── package.json
│ └── .env
├── .gitignore
├── index.html
└── README.md 

## 🚀 Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone https://github.com/shaileshyadav85/Hospital-Management-System.git
cd Hospital-Management-System
```

### Step 2: Backend Setup
cd server
npm install

### Create .env file in server directory:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital_db
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

### Start Backend Server:
npm run dev

### Step 3: Frontend Setup
cd client
npm install

### Start Frontend Server:
npm run dev

### Step 4: Access Application
Frontend: http://localhost:3000
Backend: http://localhost:5000

### Step 5: Default Login Credentials
Email: test@example.com
Password: password123
















