const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // индекс (0-3)
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  explanation: { type: String, default: '' }
});

module.exports = mongoose.model('Question', questionSchema);