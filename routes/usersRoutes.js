const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust the path if necessary

// Crear usuario
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body; // Change the fields according to your model
    const newUser = await User.create({ name, email, password, role });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
    }
  });

  // Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll(); // If you use Sequelize
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

module.exports = router;