const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registro
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user exists (Sequelize)
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // Create user; hashing is handled by model hooks
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
// Login
// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find by email (Sequelize)
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secreto', {
      expiresIn: '1h'
    });

    // Send complete user object
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
