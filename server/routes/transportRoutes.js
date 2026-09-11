const express = require('express');
const router = express.Router();
const { compareTransportRates, bookTransportRequest } = require('../controllers/transportController');

// Public endpoints for farmers - NO LOGIN REQUIRED
router.get('/compare', compareTransportRates);
router.post('/book', bookTransportRequest);

module.exports = router;