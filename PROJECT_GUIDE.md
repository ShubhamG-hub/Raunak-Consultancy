# Raunak Consultancy - Project Information & Instructions

Welcome to the comprehensive guide for the **Raunak Consultancy** portfolio and booking platform. This document provide all the technical details, structural overview, and operational instructions needed to manage and maintain the website.

---

## 🚀 Project Overview
Raunak Consultancy is a professional service platform designed for legal and financial consultation. It features a modern, responsive public interface and a robust admin dashboard for managing leads, bookings, testimonials, and gallery content.

### Core Features:
- **Instant Booking System:** Public-facing modal with real-time slot selection and double-booking prevention.
- **Admin Dashboard:** Centralized hub for managing appointments, leads, and site content.
- **WhatsApp Integration:** Automated notifications for booking confirmations and status updates via Twilio.
- **Multi-Language Support:** Integrated translation system for Hindi and English.
- **Dynamic Content:** Editable gallery, testimonials, and service information.

---

## 🛠 Tech Stack
| Layer | Technologies |
|-------|--------------|
| **Frontend** | React (Vite), Tailwind CSS, Framer Motion, Lucide React, React Hook Form, Zod |
| **Backend** | Node.js, Express.js |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | JWT (JSON Web Tokens) & Supabase Auth |
| **Communication** | Twilio (WhatsApp & SMS) |

---

## 📁 Project Structure

### `/client` (Frontend)
- `src/pages/`: Contains all main views (Home, About, Services, Admin Dashboard, etc.)
- `src/components/`: Reusable UI components (Modals, Navbars, Buttons).
- `src/lib/`: Utility files like `api.js` (Axios config) and `supabase.js` (DB config).
- `src/context/`: React Context providers for Auth, Theme, and Language.

### `/server` (Backend)
- `index.js`: Main entry point for the Express server.
- `routes/`: API endpoints categorized by feature (bookings, leads, auth, etc.)
- `middleware/`: Security and compliance filters.
- `scripts/`: Operational scripts for database maintenance (keep `seed-admin.js`).

---

## ⚙️ How to Run Locally

### 1. Prerequisites
Ensure you have **Node.js** installed on your system.

### 2. Installation
Open two terminals (one for client, one for server) and run:
```bash
# In /client
npm install

# In /server
npm install
```

### 3. Environment Configuration
Create a `.env` file in both `client/` and `server/` directories. Use the keys found in `.env.example` as a template.

### 4. Start Development
```bash
# Start Backend (Term 1)
cd server
npm start

# Start Frontend (Term 2)
cd client
npm run dev
```

---

## 🛠 Ongoing Maintenance

### Managing Bookings
- Access the **Admin Panel** at `/admin/login`.
- Manage status updates (Confirm/Complete/Cancel) which automatically trigger WhatsApp notifications.

### Updating Credentials
If you change your Supabase or Twilio accounts:
1. Update `.env` files in both `client` and `server`.
2. For production (Vercel/Netlify), update the **Environment Variables** in your hosting dashboard and **redeploy**.

### Troubleshooting
- **Credentials Warning:** If you see "Supabase credentials missing" in the console during development, ensure your `.env` keys start with `VITE_` for the client side.

---

## 📝 Important Notes
- **Safety First:** Never share your secret `.env` keys on public platforms.
- **Admin Access:** Use the provided admin credentials to manage the platform contents.

---
*Created by Antigravity AI for Raunak Consultancy.*
