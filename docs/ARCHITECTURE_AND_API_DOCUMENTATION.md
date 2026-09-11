# AgriCold Connect — Complete Architecture, System Design & API Reference

## 1. System Architecture Overview

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer (Frontend)"]
        UI["React 19 + Vite Single Page App"]
        Tailwind["Tailwind CSS + Framer Motion (3D Effects)"]
        Router["React Router v7 (Navigation & Dashboards)"]
    end

    subgraph APILayer ["API & Business Logic (Backend)"]
        Server["Node.js + Express REST API (Port 5000)"]
        AuthM["JWT & Bcrypt Security Middleware"]
        RecService["Smart Recommendation Engine (0-100%)"]
        CostService["Itemized Cost & Freight Calculator"]
        TransService["Pickup & Export Haulage Comparison"]
        ErrorM["Centralized Error Handling Middleware"]
    end

    subgraph DataLayer ["Data & Storage Layer"]
        Atlas["MongoDB Atlas Cloud Cluster (tastingproject)"]
        SRV["Custom DNS Resolver (8.8.8.8 & 1.1.1.1)"]
    end

    UI --> Router
    Router --> Server
    Server --> AuthM
    Server --> RecService
    Server --> CostService
    Server --> TransService
    Server --> ErrorM
    Server --> SRV
    SRV --> Atlas
```

---

## 2. API Endpoint Directory

### 2.1 Authentication & User Management (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new cold storage owner |
| `POST` | `/api/auth/login` | Public | Authenticate owner or super admin; returns JWT |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile |

### 2.2 Cold Storage Discovery & Management (`/api/storages`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/storages` | Public | Search, filter, and calculate Smart Match for storages |
| `GET` | `/api/storages/:id` | Public | Detailed specs, temperature range, accepted crops |
| `POST` | `/api/storages` | Owner/Admin | Register new storage facility |
| `PUT` | `/api/storages/:id` | Owner/Admin | Update capacity or facility parameters |
| `DELETE` | `/api/storages/:id` | Owner/Admin | Remove or deactivate a facility listing |

### 2.3 Farm Pickup & Export Logistics (`/api/transport`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/transport/compare` | Public | Compare carriers for pickup and export haulage (Wheat, Rice, Veggies) |
| `POST` | `/api/transport/book` | Public | Submit doorstep pickup or port haulage reservation |

### 2.4 Reservations & Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Public | Farmer reservation request (Zero login needed) |
| `GET` | `/api/bookings/my` | Private | Owner incoming reservation queue |
| `PUT` | `/api/bookings/:id/status` | Private | Approve, reject, or mark booking completed |

### 2.5 Super Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/metrics` | Admin | Overall platform statistics and capacity summary |
| `GET` | `/api/admin/pending` | Admin | Facilities waiting for verification |
| `PUT` | `/api/admin/storages/:id/verify` | Admin | Approve APEDA and generator compliance |

---

## 3. Deployment & Local Execution Guide

### Prerequisites
- Node.js v18+ (Tested on Node v26)
- MongoDB Atlas cluster URL or local MongoDB instance

### Step 1: Environment Variables
Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://het:het1234567@cluster0.9g4tndh.mongodb.net/tastingproject
JWT_SECRET=agricold_connect_super_secret_jwt_key_2025_secure
ADMIN_EMAIL=admin@agricold.in
ADMIN_PASSWORD=Admin@123
NODE_ENV=development
```

### Step 2: Backend Setup
```bash
cd server
npm install
node server.js
```
The server starts on port `5000` and automatically verifies the Atlas cloud database connection and seeds initial test facilities.

### Step 3: Frontend Setup
```bash
cd client
npm install
npm run dev
```
The frontend starts on `http://localhost:5173`.