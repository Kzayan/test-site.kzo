const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '🎮' },
  score: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: String }],
  quizzesTaken: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  totalAnswers: { type: Number, default: 0 },
  dailyBonusClaimed: { type: Boolean, default: false },
  lastDailyBonus: { type: Date },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.calculateLevel = function() {
  this.level = Math.floor(this.score / 500) + 1;
};

module.exports = mongoose.model('User', userSchema);