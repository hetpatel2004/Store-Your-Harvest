const crypto = require('crypto');
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

// Email validation helper
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// @desc    Register a new user (Cold Storage Owner or Farmer)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = 'farmer', city, address } = req.body;

    // Type validation to prevent NoSQL injection
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof phone !== 'string' ||
      typeof password !== 'string'
    ) {
      return next(new ErrorResponse('Please provide valid text inputs for all required fields', 400));
    }

    const cleanName = name.trim();
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanEmail || !cleanPhone || !password) {
      return next(new ErrorResponse('Please provide all required fields (Name, Email, Phone, Password)', 400));
    }

    if (!isValidEmail(cleanEmail)) {
      return next(new ErrorResponse('Please provide a valid email address format', 400));
    }

    if (password.length < 6) {
      return next(new ErrorResponse('Password must be at least 6 characters long', 400));
    }

    if (password.length > 128) {
      return next(new ErrorResponse('Password must not exceed 128 characters', 400));
    }

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return next(new ErrorResponse('An account with this email is already registered. Please sign in.', 400));
    }

    // Role cannot be set to 'admin' via public registration
    const assignedRole = role === 'admin' ? 'farmer' : ['farmer', 'owner'].includes(role) ? role : 'farmer';

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password,
      role: assignedRole,
      city: typeof city === 'string' ? city.trim() : 'Ahmedabad',
      address: typeof address === 'string' ? address.trim() : '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
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

    // Type validation to prevent NoSQL injection ($ne, $gt objects)
    if (typeof email !== 'string' || typeof password !== 'string') {
      return next(new ErrorResponse('Please provide valid email/phone and password', 400));
    }

    const identifier = email.trim();
    if (!identifier || !password) {
      return next(new ErrorResponse('Please provide email/phone and password to log in', 400));
    }

    // Search by email or phone number with explicit password inclusion
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier },
      ],
    }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid email/phone or password credentials', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid email/phone or password credentials', 401));
    }

    if (user.isBanned) {
      return next(
        new ErrorResponse(
          `Your account has been suspended by the platform administrator. Reason: ${user.banReason || 'Administrative suspension.'}`,
          403
        )
      );
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
        isBanned: user.isBanned || false,
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

// @desc    Forgot Password - Generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (typeof email !== 'string' || !email.trim()) {
      return next(new ErrorResponse('Please provide an email address', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return success message to prevent user enumeration
      return res.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been dispatched.',
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Password reset link sent to your email address.',
      ...(process.env.NODE_ENV !== 'production' && { resetToken }),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password with token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (typeof token !== 'string' || typeof newPassword !== 'string') {
      return next(new ErrorResponse('Invalid token or password format', 400));
    }

    if (newPassword.length < 6) {
      return next(new ErrorResponse('Password must be at least 6 characters long', 400));
    }

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired password reset token', 400));
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password has been successfully updated. You are now logged in.',
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
};
