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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Mount REST API Routes
app.use('/api/auth', authRoutes);
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

// Start server and seed database
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 AgriCold Connect API Server running on port ${PORT}`);
      console.log(`🌾 API Endpoints available at: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
