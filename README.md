# 🌾 AgriCold Connect — Store Smarter. Sell Better. Save Your Harvest.

> **Hackathon Submission**: A production-grade MERN Stack agritech platform connecting Indian farmers with nearby cold-storage facilities to eliminate post-harvest distress sales and hidden storage fees.

---

## 🚀 Key Innovations & Features

### 1. 🧠 Multi-Factor Smart Recommendation System
Does **NOT** simply rank facilities by the lowest nominal price. The intelligent matching algorithm computes a **Match Score (0–100%)** combining:
- **Biological Crop Compatibility**: Verifies specific commodity bays and post-harvest physiological handling.
- **Optimal Temperature Alignment**: Cross-checks the facility's active multi-zone refrigeration range against the crop's ideal conservation temperature.
- **Available Capacity Cushion**: Validates that free space comfortably accommodates the farmer's shipment.
- **Haversine Farm Distance**: Minimizes field-to-chiller transit time to prevent heat spoilage.
- **Facility Verification & Reliability**: Weighs APEDA/NABARD standards, generator failover backup, and farmer review ratings.
- **Clear Rationale Badges**: e.g., *"⭐ 96% Best Match • Ideal temp for Tomato (8°–13°C), 7.4 km distance, ample 1,850 MT free space"*.

### 2. 💡 Transparent Total Cost Calculator
Directly tackles the critical industry issue: **"Lowest storage price isn't always the lowest total cost."**
- Itemizes Chamber Storage Rent + Labor/Handling Fee + Estimated Freight Transport into one clear total outlay.
- Interactive simulator demonstrates how traveling 40 km for a "₹0.30 cheaper" storage rate actually costs ₹1,500+ extra in diesel and vehicle wear.

### 3. ⚖️ Side-by-Side Facility Comparison Drawer
- Farmers can tick **"Compare"** on any 2 or 3 cold storages to evaluate them side-by-side on available capacity, temperature bounds, storage rate, handling fee, distance, and total cost.

### 4. 🚜 Frictionless Farmer Discovery (< 60 Seconds)
- **Zero forced login**: Farmers can immediately search, filter, compare, and calculate costs without an account.
- One-click harvest presets (Tomato, Potato, Onion, Mango, Apple, Banana, Grapes, Chilli, Carrot) that automatically calibrate optimal storage temperatures.

### 5. 🏢 Storage Owner Command Center
- Live chamber capacity gauge and utilization percentage.
- Review incoming farmer booking requests with crop, quantity, arrival date, and special handling instructions.
- Accept, Reject, or Complete bookings with automatic database capacity adjustment.
- Add new storage facilities with temperature boundaries, tariffs, and spoilage responsibility policies.

### 6. 🛡️ Regulatory Admin Verification Dashboard
- Verify cold storage facilities, audit backup power capability, and issue verified badges.
- Manage pending approvals queue and monitor statewide tonnage preserved.

### 7. ⚡ 1-Click Instant Demo Login Switcher
- Built specifically for hackathon judges and reviewers: Switch between **Farmer**, **Storage Owner**, and **Platform Admin** with 1 click from the navbar or login screen without typing credentials.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React Icons, Framer Motion, Axios, React Router v7 |
| **Backend** | Node.js, Express.js REST APIs, JSON Web Tokens (JWT), bcryptjs |
| **Database** | MongoDB & Mongoose ODM (Supports local MongoDB, MongoDB Atlas, and automatic embedded In-Memory fallback for turnkey zero-config review) |

---

## 🧑‍🌾 Pre-Configured Demo Test Accounts

| Role | Email | Password | Facility / Notes |
|---|---|---|---|
| **Super Admin** | `admin@agricold.in` | `Admin@123` | Platform oversight & facility verification |
| **Storage Owner** | `rajesh@patelcoldstorage.com` | `Owner@123` | Patel Agro Multi-Chamber Cold Storage, Sanand |
| **Storage Owner 2**| `kirit@greenfresh.in` | `Owner@123` | GreenFresh Cold Chain Logistics, Naroda |
| **Farmer** | `ramesh@farmer.com` | `Farmer@123` | Ramesh Patel, Vegetable Grower, Sanand |

> *Tip: You can also use the **"Demo Switch"** button in the top navigation bar to switch roles instantly!*

---

## 💻 Quick Start & Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested on v26)

### 1. Start Backend API Server
```bash
cd server
npm install
npm start
```
*The server will run on `http://localhost:5000` and automatically connect to MongoDB (or launch the embedded database engine) and seed realistic Gujarat cold storage facilities.*

### 2. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
*The client will launch on `http://localhost:5173`.*

---

## 📂 Project Structure

```
xcoder_Hackathon/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Navigation with 1-click demo switcher
│   │   │   ├── Footer.jsx      # Agricultural footer & helpline
│   │   │   ├── HeroSearchCard.jsx # Interactive search card with presets
│   │   │   ├── StorageCard.jsx # Facility card with match badges & cost breakdown
│   │   │   ├── CompareDrawer.jsx # Side-by-side facility comparison
│   │   │   ├── BookingModal.jsx # Direct booking request modal
│   │   │   └── CostCalculatorModal.jsx # Interactive total outlay simulator
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # JWT auth & instant demo login
│   │   │   └── SearchContext.jsx # Search parameters & comparison state
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx # Startup landing page & how-it-works
│   │   │   ├── StorageResultsPage.jsx # Filterable storage discovery
│   │   │   ├── StorageDetailPage.jsx # Technical specifications & policies
│   │   │   ├── OwnerDashboardPage.jsx # Capacity gauge & request workflow
│   │   │   ├── AdminDashboardPage.jsx # Approval queue & platform stats
│   │   │   └── AuthPage.jsx    # Role-based login & registration
│   │   ├── services/
│   │   │   └── api.js          # Axios client with JWT interceptors
│   │   ├── App.jsx             # React router configuration
│   │   └── main.jsx            # Application entrypoint
│   └── vite.config.js          # Vite config with proxy & Tailwind v4
│
└── server/                     # Node.js + Express API Server
    ├── config/
    │   └── db.js               # MongoDB connection with embedded fallback
    ├── controllers/
    │   ├── authController.js   # JWT auth & demo login controller
    │   ├── storageController.js# Smart Recommendation & cost calculation
    │   ├── bookingController.js# Farmer booking requests & capacity updates
    │   └── adminController.js  # Approvals, audits & platform analytics
    ├── middleware/
    │   └── authMiddleware.js   # JWT verification & role authorization
    ├── models/
    │   ├── User.js             # Farmer, Owner, and Admin schemas
    │   ├── Storage.js          # Cold storage facility schema
    │   └── Booking.js          # Storage reservation schema
    ├── routes/
    │   ├── authRoutes.js       # /api/auth
    │   ├── storageRoutes.js    # /api/storages
    │   ├── bookingRoutes.js    # /api/bookings
    │   └── adminRoutes.js      # /api/admin
    ├── utils/
    │   └── seedData.js         # Gujarat cold storage demo dataset
    ├── .env                    # Environment variables
    └── server.js               # Express application entrypoint
```

---

## 🏆 Hackathon Demonstration Flow (< 2 Minutes)

1. **Farmer Experience**:
   - Open Landing page: see the bold tagline *"Store Smarter. Sell Better. Save Your Harvest."*
   - In the interactive hero search card, click the **Tomato** chip — notice the temperature auto-calibrates to **8°C - 13°C** and quantity sets to **500 kg**.
   - Click **"Find Suitable Storage"** to navigate to results.
   - Observe the **⭐ 98% Best Match** badge on top with natural language explanation (*"Ideal temp for Tomato, 920 MT free capacity, 11 km distance"*).
   - Click **"View Breakdown"** on the card to see how storage + handling + transport are transparently computed.
   - Tick **Compare** on 2 facilities and click **"Compare Now"** to view side-by-side metrics.
   - Click **"Request Storage"** and submit a reservation with contact number.
2. **Storage Owner Experience**:
   - Click **"Demo Switch"** in the top navigation bar and select **"Storage Owner"**.
   - Review the live Capacity Utilization gauge (e.g. 52% full).
   - See the incoming farmer booking request and click **Accept**.
   - Observe available capacity automatically decrement in real time.
3. **Admin Verification Experience**:
   - Click **"Demo Switch"** and select **"Platform Admin"**.
   - Inspect the pending verification queue for unverified cold storage units.
   - Click **"Approve & Verify Badge"** to grant official certified status.
