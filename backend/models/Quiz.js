const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true, enum: ['IT', 'Тарих', 'Қазақ тілі', 'Логика', 'Жалпы білім'] },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  timePerQuestion: { type: Number, default: 15 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Quiz', quizSchema);