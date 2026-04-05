const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Рейтинг
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const users = await User.find()
      .select('-password')
      .sort({ score: -1 })
      .limit(100);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Профиль
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Табылмады' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;