const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['farmer', 'owner', 'trader'],
    default: 'farmer',
  },
  city: {
    type: String,
    default: 'Ahmedabad',
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
  },
  status: {
    type: String,
    enum: ['unread', 'contacted', 'resolved'],
    default: 'unread',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Inquiry', inquirySchema);
