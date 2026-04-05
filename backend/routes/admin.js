const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// Статистика
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalScore = await User.aggregate([{ $group: { _id: null, total: { $sum: '$score' } } }]);
    res.json({ totalUsers, totalQuizzes, totalQuestions, totalScore: totalScore[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Квиз қосу
router.post('/quiz', protect, admin, async (req, res) => {
  try {
    const { title, description, category, difficulty, timePerQuestion, questions } = req.body;
    const createdQuestions = await Question.insertMany(questions.map(q => ({ ...q })));
    const quiz = await Quiz.create({
      title, description, category, difficulty, timePerQuestion,
      questions: createdQuestions.map(q => q._id),
      createdBy: req.user._id
    });
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Квиз өшіру
router.delete('/quiz/:id', protect, admin, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Табылмады' });
    await Question.deleteMany({ _id: { $in: quiz.questions } });
    await quiz.deleteOne();
    res.json({ message: 'Квиз жойылды' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Пайдаланушылар
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ score: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;