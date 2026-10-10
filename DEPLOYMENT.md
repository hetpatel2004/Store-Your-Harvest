# 🚀 Complete Deployment Guide: AgriCold Connect (MERN Stack on Vercel)

This guide walks you step-by-step through deploying both the **Frontend (Vite + React)** and **Backend (Node.js + Express + MongoDB)** of AgriCold Connect to **Vercel**.

---

## 📋 Prerequisites
1. **GitHub Account**: Your project pushed to a GitHub repository.
2. **Vercel Account**: Sign up for free at [vercel.com](https://vercel.com) using your GitHub account.
3. **MongoDB Atlas Account**: Free cloud database at [mongodb.com/atlas](https://www.mongodb.com/atlas).

---

## ⚠️ STEP 0: Prepare MongoDB Atlas (CRITICAL)

Because Vercel runs backend functions on dynamic, serverless IP addresses, **MongoDB Atlas will reject incoming requests unless you allow access from all IPs**.

1. Log into your [MongoDB Atlas Dashboard](https://cloud.mongodb.com).
2. Go to **Security** -> **Network Access** in the left sidebar.
3. Click **Add IP Address**.
4. Click **Allow Access from Anywhere** (enters `0.0.0.0/0`).
5. Click **Confirm**.
6. Go to **Database** -> Click **Connect** on your cluster:
   - Select **Drivers** (Node.js).
   - Copy your connection string. It looks like:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/agricold_connect?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password and specify the database name (e.g. `agricold_connect`).

---

## 🛠️ RECOMMENDED ARCHITECTURE: Deploy as Two Vercel Projects
Deploying the frontend and backend as two separate Vercel projects from the **same GitHub repository** is the official, most reliable pattern for MERN apps on Vercel.

```
GitHub Repository: Store-Your-Harvest
   ├── Vercel Project 1: Backend API (Root Directory = 'server')
   └── Vercel Project 2: Frontend App (Root Directory = 'client')
```

---

## 🟢 STEP 1: Deploy the Backend API (`server`)

1. Open your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
2. Select your GitHub repository (`Store-Your-Harvest`).
3. In the configuration screen:
   - **Project Name**: e.g., `agricold-backend`
   - **Framework Preset**: Select **Other**
   - **Root Directory**: Click **Edit** and choose the `server` folder. Click **Continue**.
4. Open the **Environment Variables** section and add the following keys:

| Key | Example Value | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/agricold_connect` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `agricold_connect_super_secret_jwt_key_2025_secure` | Secret key for JWT auth tokens |
| `NODE_ENV` | `production` | Production environment flag |
| `ADMIN_EMAIL` | `admin@agricold.in` | Super admin login email |
| `ADMIN_PASSWORD` | `Admin@123` | Super admin login password |

5. Click **Deploy**.
6. Once deployment finishes, copy your live backend URL from Vercel:
   - Example: `https://agricold-backend.vercel.app`
7. Test your backend in your browser by opening:
   - `https://agricold-backend.vercel.app/api/health`
   - You should see: `{"status":"online","platform":"AgriCold Connect API"}`.

---

## 🔵 STEP 2: Deploy the Frontend (`client`)

1. Go back to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
2. Select the **same GitHub repository** (`Store-Your-Harvest`).
3. In the configuration screen:
   - **Project Name**: e.g., `agricold-frontend`
   - **Framework Preset**: Select **Vite** (auto-detected)
   - **Root Directory**: Click **Edit** and choose the `client` folder. Click **Continue**.
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
4. Open the **Environment Variables** section and add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://agricold-backend.vercel.app/api` |

*(Replace `agricold-backend.vercel.app` with your actual backend URL from Step 1. Be sure to include `/api` at the end).*

5. Click **Deploy**.
6. Once deployed, open your live frontend URL:
   - Example: `https://agricold-frontend.vercel.app`

---

## 🔄 STEP 3: Link Frontend URL to Backend CORS (Final Polish)

1. Go to your **Backend Project** in Vercel (`agricold-backend`).
2. Go to **Settings** -> **Environment Variables**.
3. Add or update:
   - Key: `CLIENT_URL`
   - Value: `https://agricold-frontend.vercel.app`
4. Click **Save**, then go to **Deployments** -> click the three dots (`...`) on the latest deployment -> click **Redeploy**.

---

## ⚡ What We Made Ready in the Codebase

1. **Serverless MongoDB Pooling (`server/config/db.js`)**:
   - Connection caching so serverless functions reuse open sockets across requests without opening duplicate connections.
   - Graceful fallback and clear production errors if Atlas credentials are misconfigured.
2. **Serverless Request Lifecycle (`server/server.js`)**:
   - Automatically checks and ensures DB connection before every incoming API request.
   - Exports `module.exports = app` for Vercel's serverless handler.
   - Permissive CORS configured for all `*.vercel.app` domains.
3. **SPA Routing Rewrite (`client/vercel.json`)**:
   - Prevents `404 Not Found` when refreshing React Router URLs like `/farmer`, `/storages`, `/admin`, or `/transport`.
4. **Backend Serverless Routing (`server/vercel.json`)**:
   - Directs all serverless calls to `server.js`.
5. **Smart API Normalizer (`client/src/services/api.js`)**:
   - Automatically handles trailing slashes or duplicate `/api/` prefixes so API calls never fail.

---

## 🧪 Post-Deployment Checklist

- [ ] Open frontend: `https://agricold-frontend.vercel.app`
- [ ] View cold storages page: `/storages`
- [ ] Test farmer login: `ramesh@farmer.com` / `Farmer@123`
- [ ] Test admin dashboard: `admin@agricold.in` / `Admin@123`
- [ ] Refresh any page (e.g. `/farmer` or `/transport`) to verify SPA rewrites work.
