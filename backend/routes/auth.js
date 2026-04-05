const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Тіркелу
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email бұрын тіркелген' });

    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      avatar: user.avatar, score: user.score, level: user.level,
      role: user.role, token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Кіру
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
      res.json({
        _id: user._id, name: user.name, email: user.email,
        avatar: user.avatar, score: user.score, level: user.level,
        role: user.role, token
      });
    } else {
      res.status(401).json({ message: 'Email немесе пароль қате' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Профиль
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Күнделікті бонус
router.post('/daily-bonus', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    const lastBonus = user.lastDailyBonus ? new Date(user.lastDailyBonus) : null;

    if (lastBonus && now.toDateString() === lastBonus.toDateString()) {
      return res.status(400).json({ message: 'Бонус бүгін алынған' });
    }

    const bonus = 50 + Math.floor(Math.random() * 51);
    user.score += bonus;
    user.calculateLevel();
    user.dailyBonusClaimed = true;
    user.lastDailyBonus = now;
    await user.save();

    res.json({ message: `🎁 ${bonus} ұпай алдыңыз!`, bonus, score: user.score });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;