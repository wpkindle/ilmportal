# 🇵🇰 IlmPortal Pakistan - Quran & Academic Tutoring LMS Portal

A modern, production-grade **Learning Management System (LMS)** designed specifically for Quran tutoring and academic tutoring across Pakistan (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Peshawar, Quetta, Kashmir, Gilgit-Baltistan, and beyond).

---

## 🌟 Key Features

### 1. In-Platform Live WebRTC Video Classroom (No Zoom/Meet Needed)
- **100% On-Platform HD Video & Audio**: Real-time 1:1 sessions directly embedded inside the browser.
- **Screen Sharing**: Tutors can share Quran digital pages, Tajweed rules, PDF past papers, and digital whiteboards.
- **Digital Quran Reader**: Integrated Tajweed Surah viewer right inside the classroom.
- **In-Class Live Chat**: Instant messaging during ongoing live calls.
- **Live Class Session Logging**: Automatically records start time, end time, and duration minutes for student/tutor records and admin audit.

### 2. Pakistani-Centric Search & Multi-Faceted Filters
- **Location Coverage**: Filter by all Pakistani provinces and major cities (Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, Quetta, Faisalabad, Muzaffarabad, Gilgit, etc.).
- **Islamic Disciplines**: Nazra Quran, Tajweed al-Quran, Hifz al-Quran, Quran Translation & Tafseer, Noorani Qaida for Kids, Islamic Studies & Fiqh/Hadith, Arabic Grammar.
- **Academic Tutoring**: Matric / SSC Science (Class 9 & 10), FSc Pre-Medical & Pre-Engineering, Cambridge CAIE O-Level / IGCSE, Cambridge A-Level, Computer Science & Coding, Spoken English & IELTS.
- **Tutoring Modes**: Online (Livestream) / In-Person (Home Tutoring) / Both.
- **Gender & Price Filters**: Gender preference filter for female Quran teachers/students, and price slider in PKR.

### 3. Deal & 3-Day Risk-Free Trial System
- **Structured Deal Offers**: Tutors compose custom deal offers in chat (Subject, PKR rate, schedule, mode).
- **Automated 3-Day Trial**: Acceptance automatically starts an admin-configurable 3-day free trial window with a live countdown timer.
- **Manual Payment Verification**: Students submit payment proof via **JazzCash, EasyPaisa, or Online Bank Transfer (e.g. Meezan Bank)**. Admins verify the Transaction ID (TID) from the control center to activate paid course subscriptions.
- **Access Restrictions**: Configurable restriction tiers (warning banner, limit chat, suspend classroom access) if trial expires unpaid.

### 4. Admin Control Center & CMS
- **Tutor Approval Queue**: Inspect applicant bio, qualifications, and uploaded **Sanad/Certificate documents** with 1-click Approve, Reject (with reason), or Contact Applicant.
- **Content Management System (CMS)**: Add, edit, and delete categories and Pakistani cities/regions with Urdu names without touching code.
- **Chat Oversight & Transcripts**: Read full chronological transcripts between any student and tutor pair.
- **Ratings & Reviews Moderation**: Admin override capabilities to edit star ratings (1-5), edit comments, or hide/delete reviews with automatic tutor average recalculation.
- **Session Logs & Audit Trail**: Immutable logging of all admin actions for accountability.

### 5. Bilingual Support (English & اردو)
- Full bilingual toggle with RTL layout support, Urdu typography, and cultural trust signals (Verified Sanad badge, verified tutor indicator).

---

## 🛠️ Tech Stack

- **Frontend**: React 18 (Vite), React Router v6, TailwindCSS, Framer Motion, Lucide Icons, Canvas Confetti, Socket.IO Client, WebRTC.
- **Backend**: Node.js + Express.js, RESTful APIs, WebSockets via Socket.IO.
- **Database**: MongoDB (Mongoose) with embedded MongoDB Memory Server for zero-setup standalone execution.
- **Authentication**: JWT (JSON Web Tokens), bcryptjs, Email verification via 6-digit OTP codes.
- **File Uploads**: Multer handling for profile avatars and Sanad certificate uploads (JPG, PNG, PDF up to 10MB).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Installation
Clone the repository and install all dependencies:
```bash
cd quran-academic-lms
npm run install:all
```

### 2. Seed Initial Pakistani Data
Populate Pakistani cities, Quranic & Academic subjects, and pre-configured demo accounts:
```bash
npm run seed
```

### 3. Start Development Servers
Run both backend API (port 5000) and frontend client (port 5173):
```bash
npm run dev
```

Visit the application at **`http://localhost:5173`**.

---

## 🔑 Demo Credentials

| Role | Email | Password | Details |
|------|-------|----------|---------|
| **Administrator** | `admin@pakistanlms.pk` | `Admin@12345` | Full admin control, approvals queue, CMS, payment verification |
| **Qari / Tutor** | `qari.huzaifa@example.com` | `Password@123` | Verified Hafiz & Tajweed Qari (Lahore) |
| **Alimah / Tutor** | `alimah.fatima@example.com` | `Password@123` | Verified Alimah & Noorani Qaida teacher (Islamabad) |
| **Academic Tutor** | `bilal.ahmad@example.com` | `Password@123` | Verified O/A Level Math & Physics coach (Karachi) |
| **Student** | `student.hamza@example.com` | `Password@123` | Active student with 3-day trial deal |

---

## 🐳 Docker Deployment

To build and run the entire stack with Docker Compose:
```bash
docker-compose up --build -d
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017/pakistan_lms`

---

## 🧪 Testing

Run automated Jest API tests:
```bash
npm run test
```
