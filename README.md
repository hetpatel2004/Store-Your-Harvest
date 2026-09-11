# 🌾 AgriCold Connect — Store Smarter. Sell Better. Save Your Harvest.

> **Hackathon Submission**: A production-grade MERN Stack agritech platform connecting Indian farmers with nearby cold-storage facilities to eliminate post-harvest distress sales and hidden storage fees.

---

## 🔑 Static Super Administrator Credentials

| Role | Email | Password | Access & Dashboard |
|---|---|---|---|
| **Super Admin** | `admin@agricold.in` | `Admin@123` | Platform oversight, storage verification queue, booking monitoring |

---

## 🏢 Cold Storage Owner Workflow (Register First, Then Login)

1. Storage owners register via the **Storage Owner Portal** (`/auth?tab=register`) with their official email, phone, password, and location.
2. The server records the user in the MongoDB `users` collection via `POST /api/auth/register`.
3. The interface prompts them to sign in with their password via `POST /api/auth/login`.
4. The server cryptographically signs a **JWT Token** (30-day validity) and redirects the owner to their **Owner Dashboard** (`/owner`).
5. All demo bypass buttons have been removed.

---

## 🌾 Farmer Direct Flow (No Login Required)

- Farmers have **zero login barrier**.
- Clicking **"🌾 I'm a Farmer (Find Storage)"** or the direct farmer banner opens `/storages` immediately.
- Farmers can search, view live available capacity, compare facilities side-by-side, and calculate transparent costs without an account.

---

## 💾 Where Data Is Saved in MongoDB

All platform data is persisted using Mongoose ODM in real MongoDB collections:

- **`users`** (`server/models/User.js`): Accounts for Owners, Admins, and Farmers with `bcryptjs` password hashing.
- **`storages`** (`server/models/Storage.js`): Cold storage facilities with capacity, multi-zone temperature ranges, tariffs, and APEDA compliance.
- **`bookings`** (`server/models/Booking.js`): Farmer reservation requests with itemized storage, handling, and freight costs.
- **`reviews`** (`server/models/Review.js`): Farmer ratings and reviews with automated Mongoose aggregation calculating average storage ratings.
- **`inquiries`** (`server/models/Inquiry.js`): Contact helpline messages from the Contact page.

### MongoDB Configuration (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/agricold_connect
JWT_SECRET=agricold_connect_super_secret_jwt_key_2025_secure
NODE_ENV=development
```
*Note: If you have a local MongoDB daemon or a MongoDB Atlas Cloud URI, paste it into `server/.env`. If local MongoDB is not running, the server automatically starts an embedded MongoDB engine (`mongodb-memory-server`) so all Mongoose models, writes, and reads function smoothly.*

---

## 🚀 Running the Project

### 1. Backend Server (`http://localhost:5000`)
```bash
cd server
npm start
```

### 2. Frontend Client (`http://localhost:5175`)
```bash
cd client
npm run dev
```
