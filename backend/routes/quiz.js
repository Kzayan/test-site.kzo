const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Барлық квиздер
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    const quizzes = await Quiz.find(filter).populate('questions', 'text').sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Квиз ID бойынша (сұрақтармен)
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz) return res.status(404).json({ message: 'Квиз табылмады' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Нәтиже жіберу
router.post('/submit', protect, async (req, res) => {
  try {
    const { quizId, answers } = req.body; // answers: [{questionId, selectedOption}]
    const quiz = await Quiz.findById(quizId).populate('questions');
    let correct = 0;
    let total = quiz.questions.length;
    let scoreEarned = 0;
    const results = [];

    quiz.questions.forEach((q, idx) => {
      const userAnswer = answers.find(a => a.questionId === q._id.toString());
      const isCorrect = userAnswer && userAnswer.selectedOption === q.correctAnswer;
      if (isCorrect) {
        correct++;
        scoreEarned += q.difficulty === 'hard' ? 30 : q.difficulty === 'medium' ? 20 : 10;
      }
      results.push({
        question: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswer ? userAnswer.selectedOption : -1,
        isCorrect,
        explanation: q.explanation
      });
    });

    const user = await User.findById(req.user._id);
    user.score += scoreEarned;
    user.quizzesTaken += 1;
    user.correctAnswers += correct;
    user.totalAnswers += total;
    user.calculateLevel();

    // Badge тексеру
    if (user.quizzesTaken === 1 && !user.badges.includes('first_quiz')) user.badges.push('first_quiz');
    if (correct === total && !user.badges.includes('perfect')) user.badges.push('perfect');
    if (user.score >= 1000 && !user.badges.includes('1000_club')) user.badges.push('1000_club');
    if (user.score >= 5000 && !user.badges.includes('5000_club')) user.badges.push('5000_club');

    await user.save();

    res.json({
      correct, total, scoreEarned, results,
      newScore: user.score, newLevel: user.level,
      newBadges: user.badges
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;