# Smart Waste Reporting System

A full-stack web application for city waste management where users can report waste issues with photos and locations, and administrators can manage and resolve these reports in real-time.

## Features

- **User Dashboard**: Report waste with photo upload and map location picker.
- **Admin Dashboard**: View all reports, mark them as 'In Progress' or 'Completed'.
- **Real-time Updates**: Status updates are sent to users instantly via WebSockets.
- **Role-based Authentication**: Secure login and registration for both Users and Admins.
- **Responsive Design**: Modern UI built with Tailwind CSS and Framer Motion.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Leaflet (Maps), Lucide Icons, Socket.io-client.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Multer (File uploads), Socket.io.

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed and running locally

### 1. Backend Setup
```bash
cd server
npm install
node index.js
```
*Note: Make sure to update the `.env` file if your MongoDB URI is different.*

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## How to Test
1. Register as a **User** first.
2. Go to the dashboard and report a waste issue by picking a location on the map and uploading a photo.
3. Open a new incognito window or browser and register as an **Admin**.
4. In the Admin dashboard, you will see the report.
5. Change the status to 'In Progress' or 'Completed'.
6. Check the User dashboard window; the status will update in real-time!
