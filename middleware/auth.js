const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided or invalid format.' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(403).json({ 
      success: false,
      message: 'Invalid token.' 
    });
  }
};

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email, and password are required' 
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await user.save();
    console.log('✅ User registered successfully:', email);
    
    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error creating user'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful:', email);
    console.log('Token received:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded:', decoded);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error during login'
    });
  }
});

module.exports = { router, auth };