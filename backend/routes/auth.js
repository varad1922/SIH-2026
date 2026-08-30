const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/authMiddleware');

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

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

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    user = new User({
      name,
      email,
      password,
      role: role || 'Learner',
    });

    await user.save();

    const profile = new Profile({
      user: user._id,
      department,
      designation,
      jobRole,
    });

    await profile.save();

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

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid email or password',
      });
    }

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

// GOOGLE LOGIN
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: 'Google token is required',
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      sub: googleId,
      email,
      name,
    } = payload;

    let user = await User.findOne({ email });

    // Create user if Google user doesn't exist
    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        role: 'Learner',
      });

      await user.save();

      // Create empty profile for Google user
      const profile = new Profile({
        user: user._id,
      });

      await profile.save();
    }

    const jwtToken = jwt.sign(
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
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);

    res.status(401).json({
      message: 'Google authentication failed',
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