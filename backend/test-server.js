const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Қарапайым тест API
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Сервер жұмыс істеп тұр!', timestamp: new Date() });
});

app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  res.json({ 
    success: true, 
    message: `Қош келдіңіз! Email: ${email}`,
    token: 'test_jwt_token_12345'
  });
});

app.get('/api/posts', (req, res) => {
  res.json({
    posts: [
      { id: 1, content: 'Бұл тест пост', likes: 5, comments: 2 },
      { id: 2, content: 'Екінші тест пост', likes: 10, comments: 7 }
    ]
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🧪 Тест сервері http://localhost:${PORT} портында істеді`);
  console.log(`📡 API мекенжайы: http://localhost:${PORT}/api/test`);
});