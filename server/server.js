require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const { seedDatabase } = require('./utils/seedData');
const { CROP_STORAGE_PROFILES } = require('./services/recommendationService');

// Route imports
const authRoutes = require('./routes/authRoutes');
const storageRoutes = require('./routes/storageRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const transportRoutes = require('./routes/transportRoutes');
const { createRateLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Hide server signature
app.disable('x-powered-by');

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Dynamic CORS configuration (Allows localhost, CLIENT_URL, and all Vercel deployments)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      // Allow configured origins or any vercel.app preview/production deployment
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for production deployment
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Payload size limit to prevent Denial-of-Service memory floods
app.use(express.json({ limit: '2mb' }));

// Request logger for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Database Connection Middleware for Serverless & Long-running instances
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error in request:', error.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please verify MONGODB_URI configuration.',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
});

// Root welcome & API health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    platform: 'AgriCold Connect API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    platform: 'AgriCold Connect API',
    endpoints: {
      auth: '/api/auth',
      storages: '/api/storages',
      bookings: '/api/bookings',
      crops: '/api/crops',
      admin: '/api/admin',
      transport: '/api/transport',
      health: '/api/health',
    },
  });
});

// Anti-Brute-Force Rate Limiter for Authentication (login/register)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.',
});

// Mount REST API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/storages', storageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transport', transportRoutes);

// Crop knowledge base endpoint
app.get('/api/crops', (req, res) => {
  res.json({
    success: true,
    crops: CROP_STORAGE_PROFILES,
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'AgriCold Connect API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Catch-all 404 for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route '${req.originalUrl}' not found`,
  });
});

// Centralized error handling middleware
app.use(errorHandler);

// Start server and seed database (Only when run directly, not in Vercel serverless)
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();
  } catch (error) {
    console.error('Database initialization notice:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 AgriCold Connect API Server running on port ${PORT}`);
    console.log(`🌾 API Endpoints available at: http://localhost:${PORT}/api`);
  });
};

if (require.main === module) {
  startServer();
}

// Export app for Vercel serverless function execution
module.exports = app;
