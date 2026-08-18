# 🌱 Smart Waste Reporting System - Quick Start Guide

## 📋 Prerequisites
- Node.js installed on your computer
- Git (optional)

---

## 🚀 STEP 1: Extract the Zip File
1. Extract the project folder to your computer
2. Navigate into the project folder

---

## 🚀 STEP 2: Open TWO Command Terminals

### **Terminal 1 - Backend Setup**
```bash
cd server
npm install
```
Wait for installation to complete.

---

### **Terminal 2 - Frontend Setup**
```bash
cd client
npm install
```
Wait for installation to complete.

---

## 🚀 STEP 3: Seed the Database (ONE TIME ONLY)

In **Terminal 1**, run:
```bash
cd server
node seed.js
```

You should see:
```
✓ Database synced
✓ Admin user created: jaja / 123456
✓ User created: John Doe / password123
✓ Created 5 sample complaints
✅ Database seeded successfully!
```

---

## 🚀 STEP 4: Start the Backend

In **Terminal 1**, run:
```bash
cd server
node index.js
```

You should see:
```
✓ Connected to SQLite and database synced
✓ Server running on port 5000
```

**Keep this terminal running!**

---

## 🚀 STEP 5: Start the Frontend

In **Terminal 2**, run:
```bash
cd client
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

**Keep this terminal running!**

---

## 🎯 STEP 6: Open in Browser

Open your web browser and go to:
```
http://localhost:5173
```

---

## 🔐 Login Credentials

### **Option 1: Admin Dashboard** (See all complaints & update status)
- Email: `jaja@admin.com`
- Password: `123456`

### **Option 2: Regular User** (Report new waste)
- Email: `user@example.com`
- Password: `password123`

---

## ⚠️ Important Notes

1. **Keep both terminals running** - Don't close them while using the app
2. **Port 5000 & 5173** - Make sure these ports are not blocked
3. **Only seed ONCE** - After first time, don't run `node seed.js` again
4. **Database file** - `server/smart_waste.db` (auto-created)

---

## 🆘 Troubleshooting

**"Port 5000 already in use"**
- Change port in `server/index.js` (line 56)

**"Port 5173 already in use"**
- Vite will automatically use a different port (5174, 5175, etc)

**"npm not found"**
- Install Node.js from https://nodejs.org/

**"Module not found"**
- Run `npm install` in both server and client folders

---

## 📞 Quick Reference

| Command | What it does |
|---------|-------------|
| `node seed.js` | Create demo data (run ONCE) |
| `node index.js` | Start backend server |
| `npm run dev` | Start frontend server |
| `npm install` | Install dependencies |

---

## ✅ All Set!

Your app is now running at: **http://localhost:5173** 🎉

---

**Need Help?** Check that:
- Both terminals are still running
- No error messages in the terminals
- Ports 5000 and 5173 are available
- You used correct credentials to login
