# Portfolio Website - Run Instructions

Follow these steps to start and manage the application.

## 🚀 Getting Started

### 1. Backend Server
- **Directory**: `server/`
- **Start Command**: `npm run dev`
- **Port**: `5001` (as per `.env`)
- **API Base**: `http://localhost:5001/api`

### 2. Frontend Client
- **Directory**: `client/`
- **Start Command**: `npm run dev`
- **Port**: Typically `5173`
- **URL**: `http://localhost:5173`

## 🔐 Admin Access
- **URL**: `http://localhost:5173/admin/login`
- **Credentials**: (Check `server/.env` for `ADMIN_EMAIL` and `ADMIN_PASSWORD`)
  - *Default*: `ms.sudhirgupta@rediffmail.com`

## 🎨 Theme Management
- **Quick Switch**: Use the **Palette** icon in the Admin Navbar to switch presets and toggle Dark Mode instantly.
- **Advanced Appearance**: Go to **Admin -> Settings -> Appearance** to manage global theme settings.
- **Config**: Preset themes are defined in `client/src/config/themes.js`.

## 🛠️ Maintenance & Sync
- **Database Sync**: If you add new tables or migrate, run `node server/scripts/sync-db.js`.
- **Media**: Uploaded images are stored in `server/public/uploads`.
