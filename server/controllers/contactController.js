const Inquiry = require('../models/Inquiry');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Submit a new contact / harvest helpline inquiry
// @route   POST /api/contact
// @access  Public
const submitInquiry = async (req, res, next) => {
  try {
    const { name, phone, role, city, message } = req.body;

    if (!name || !phone || !message) {
      return next(new ErrorResponse('Please provide name, phone, and inquiry message', 400));
    }

    const inquiry = await Inquiry.create({
      name,
      phone,
      role: role || 'farmer',
      city: city || 'Ahmedabad',
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry received. A regional cold chain coordinator will contact you shortly.',
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all inquiries for admin review
// @route   GET /api/contact
// @access  Private (Admin)
const getInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inquiry resolution status
// @route   PUT /api/contact/:id/status
// @access  Private (Admin)
const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return next(new ErrorResponse('Inquiry not found', 404));
    }

    inquiry.status = status || 'resolved';
    await inquiry.save();

    res.json({
      success: true,
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitInquiry,
  getInquiries,
  updateInquiryStatus,
};
