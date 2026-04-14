# 🚌 BusBook - Bus Booking Web Application

A full-stack MERN (MongoDB, Express, React, Node.js) bus booking system with role-based access for Admin, Bus Operator, and Passengers.

---

## 📁 Project Structure

```
bus-booking/
├── server/                    # Backend (Express + MongoDB)
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT verification & role authorization
│   ├── models/
│   │   ├── User.js            # User schema (name, email, password, role)
│   │   ├── Bus.js             # Bus schema (name, route, seats, price)
│   │   └── Booking.js         # Booking schema (user, bus, seat)
│   ├── routes/
│   │   ├── auth.js            # POST /register, POST /login
│   │   ├── bus.js             # CRUD for buses
│   │   ├── booking.js         # Create/view/cancel bookings
│   │   └── admin.js           # Admin management routes
│   ├── .env.example           # Environment variables template
│   ├── index.js               # Server entry point
│   └── package.json
│
├── client/                    # Frontend (React)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js          # Role-based navigation
│   │   │   ├── ProtectedRoute.js  # Route guard
│   │   │   └── Notification.js    # Toast notifications
│   │   ├── pages/
│   │   │   ├── Home.js            # Landing page
│   │   │   ├── Login.js           # Login form
│   │   │   ├── Register.js        # Registration form
│   │   │   ├── SearchBuses.js     # Search & browse buses
│   │   │   ├── BookBus.js         # Seat selection & booking
│   │   │   ├── MyBookings.js      # User's booking history
│   │   │   ├── OperatorDashboard.js
│   │   │   ├── AddBus.js          # Add new bus form
│   │   │   ├── ManageBuses.js     # Operator's bus list
│   │   │   ├── BusBookings.js     # Bookings for a specific bus
│   │   │   ├── AdminDashboard.js  # Admin stats
│   │   │   ├── AdminUsers.js      # Manage all users
│   │   │   └── AdminBuses.js      # Manage all buses
│   │   ├── services/
│   │   │   ├── api.js             # Axios API client
│   │   │   └── AuthContext.js     # Authentication state
│   │   ├── styles/
│   │   │   └── global.css         # All custom CSS
│   │   ├── App.js                 # Router setup
│   │   └── index.js               # Entry point
│   └── package.json
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites

1. **Node.js** (v18+) — [Download](https://nodejs.org/)
2. **MongoDB** — Either:
   - Install locally: [MongoDB Community](https://www.mongodb.com/try/download/community)
   - Or use free cloud: [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)

### Step 1: Clone & Setup Server

```bash
cd server

# Copy the example env file
cp .env.example .env

# Edit .env with your values:
# MONGO_URI=mongodb://localhost:27017/bus-booking
# JWT_SECRET=any-random-secret-string-here
# PORT=5000

# Install dependencies
npm install

# Start the server
npm run dev
```

The server will run on `http://localhost:5000`.

### Step 2: Setup Client

```bash
cd client

# Install dependencies
npm install

# Start React app
npm start
```

The client will run on `http://localhost:3000`.

### Step 3: Create an Admin Account

Register a user normally, then update their role in MongoDB:

```bash
# Using MongoDB shell (mongosh):
mongosh
use bus-booking
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/auth/register | ❌ | — | Register new user |
| POST | /api/auth/login | ❌ | — | Login, get JWT |
| GET | /api/bus/all | ❌ | — | List all buses |
| GET | /api/bus/search | ❌ | — | Search buses |
| GET | /api/bus/:id | ❌ | — | Get bus + booked seats |
| POST | /api/bus/add | ✅ | operator | Add a bus |
| GET | /api/bus/operator/my | ✅ | operator | Get operator's buses |
| PUT | /api/bus/:id | ✅ | operator | Update bus |
| DELETE | /api/bus/:id | ✅ | operator/admin | Delete bus |
| POST | /api/booking/create | ✅ | user | Book a seat |
| GET | /api/booking/my | ✅ | any | User's bookings |
| GET | /api/booking/bus/:busId | ✅ | operator | Bus bookings |
| PUT | /api/booking/cancel/:id | ✅ | user | Cancel booking |
| GET | /api/admin/stats | ✅ | admin | Dashboard stats |
| GET | /api/admin/users | ✅ | admin | All users |
| GET | /api/admin/buses | ✅ | admin | All buses |
| DELETE | /api/admin/user/:id | ✅ | admin | Delete user |
| DELETE | /api/admin/bus/:id | ✅ | admin | Delete bus |

---

## 👥 User Roles

| Role | Can Do |
|------|--------|
| **user** | Search buses, book seats, view/cancel bookings |
| **operator** | Add/edit/delete buses, view bookings for their buses |
| **admin** | View stats, manage all users and buses |

---

## 🎨 Styling

All styles are in `client/src/styles/global.css` using CSS custom properties (variables). No CSS frameworks used. The design is responsive and works on mobile and desktop.

---

## 📝 Notes for Beginners

- Every file has comments explaining the code
- Passwords are hashed with bcrypt (never stored as plain text)
- JWT tokens are stored in localStorage for simplicity
- The `proxy` field in client's package.json forwards API calls to the server
- Mongoose schemas validate data before saving to MongoDB
- The unique index on Booking prevents double-booking the same seat
