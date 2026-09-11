const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'agricold_connect_super_secret_jwt_key_2025_secure',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user (Cold Storage Owner or Farmer)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = 'owner', city, address } = req.body;

    if (!name || !email || !phone || !password) {
      return next(new ErrorResponse('Please provide all required fields (Name, Email, Phone, Password)', 400));
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return next(new ErrorResponse('An account with this email is already registered. Please log in.', 400));
    }

    // Role cannot be set to 'admin' via public registration
    const assignedRole = role === 'admin' ? 'owner' : (role || 'owner');

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      role: assignedRole,
      city: city || 'Ahmedabad',
      address: address || '',
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please sign in with your email and password to access your facility dashboard.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & return JWT token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorResponse('Please provide both email and password to log in', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return next(new ErrorResponse('Invalid email or password credentials', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid email or password credentials', 401));
    }

    // Sign secure JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user profile
// @route   GET /api/auth/me
// @access  Private (Protected by JWT)
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
