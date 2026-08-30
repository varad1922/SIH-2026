const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/authMiddleware');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      designation,
      jobRole
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    // Create user
    user = new User({
      name,
      email,
      password,
      role: role || 'Learner',
    });

    await user.save();

    // Create user profile
    const profile = new Profile({
      user: user._id,
      department,
      designation,
      jobRole,
    });

    await profile.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '30d',
      }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid email or password',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '30d',
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// GET CURRENT USER
router.get('/me', protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user._id,
    });

    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      profile,
    });
  } catch (error) {
    console.error('Get user error:', error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Temporary password reset token generation
    // Replace this with real email functionality later
    const resetToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '15m',
      }
    );

    console.log(
      `[SIMULATED EMAIL] Password reset token generated for ${email}`
    );

    res.json({
      message: 'Password reset request processed',
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;