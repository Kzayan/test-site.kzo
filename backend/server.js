require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const connectDB = require('./config/db');

connectDB();

const app = express();

// Қауіпсіздік
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());

// Rate Limit
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

// Seed квиздер (тек бірінші рет)
app.get('/api/seed', async (req, res) => {
  try {
    const Quiz = require('./models/Quiz');
    const Question = require('./models/Question');
    const User = require('./models/User');

    // Админ жасау
    let admin = await User.findOne({ email: 'admin@qwizz.kz' });
    if (!admin) {
      admin = await User.create({
        name: 'Админ', email: 'admin@qwizz.kz', password: 'admin123', role: 'admin'
      });
    }

    const categories = [
      {
        title: 'IT Негіздері', category: 'IT', difficulty: 'medium',
        questions: [
          { text: 'HTML деген не?', options: ['Программалау тілі', 'Маркіровка тілі', 'Дерекқор', 'ОЖ'], correctAnswer: 1, explanation: 'HTML — HyperText Markup Language' },          { text: 'CSS қандай мақсатта қолданылады?', options: ['Сервер басқару', 'Деректер сақтау', 'Стиль беру', 'Логика жазу'], correctAnswer: 2, explanation: 'CSS — Cascading Style Sheets' },
          { text: 'JavaScript қай жылдан басталды?', options: ['1990', '1995', '2000', '2005'], correctAnswer: 1, explanation: '1995 жылы Brendan Eich жасады' },
          { text: 'React кім жасады?', options: ['Google', 'Facebook', 'Apple', 'Microsoft'], correctAnswer: 1, explanation: 'Facebook (Meta) жасады' },
          { text: 'HTTP 404 коды нені білдіреді?', options: ['Сервер қате', 'Табылмады', 'Рұқсат жоқ', 'Бағытталды'], correctAnswer: 1, explanation: '404 Not Found' },
        ]
      },
      {
        title: 'Қазақстан Тарихы', category: 'Тарих', difficulty: 'medium',
        questions: [
          { text: 'Қазақстан тәуелсіздігін қай жылы алды?', options: ['1990', '1991', '1992', '1993'], correctAnswer: 1, explanation: '1991 жылы 16 желтоқсан' },
          { text: 'Алтын адам қайдан табылды?', options: ['Отырар', 'Есік', 'Тараз', 'Түркістан'], correctAnswer: 1, explanation: 'Есік қорғанынан' },
          { text: 'Қазақ хандығы қай жылы құрылды?', options: ['1465', '1565', '1365', '1665'], correctAnswer: 0, explanation: '1465 жылы Керей мен Жәнібек' },
          { text: 'Абай Құнанбаев қай жылы туған?', options: ['1835', '1845', '1855', '1865'], correctAnswer: 1, explanation: '1845 жылы' },
          { text: 'Астана қалашан астана болды?', options: ['1995', '1997', '1999', '2000'], correctAnswer: 1, explanation: '1997 жылы' },
        ]
      },
      {
        title: 'Қазақ тілі', category: 'Қазақ тілі', difficulty: 'easy',
        questions: [
          { text: 'Қазақ тілінде неше септік бар?', options: ['5', '6', '7', '8'], correctAnswer: 2, explanation: '7 септік: атау, ілік, барыс, табыс, жатыс, шығыс, көмектес' },
          { text: '"Кітап" сөзі қандай септікте?', options: ['Атау', 'Ілік', 'Барыс', 'Табыс'], correctAnswer: 0, explanation: 'Бастапқы форма — атау септік' },
          { text: 'Қазақ әліпбиінде неше әріп бар?', options: ['33', '40', '42', '26'], correctAnswer: 1, explanation: 'Қазіргі латын әліпбиінде 40 әріп' },
          { text: '"Жақсы" сөзінің антонимі?', options: ['Әдемі', 'Жаман', 'Үлкен', 'Кіші'], correctAnswer: 1, explanation: 'Жақсы ↔ Жаман' },
          { text: 'Дыбыс нешеге бөлінеді?', options: ['2', '3', '4', '5'], correctAnswer: 0, explanation: 'Дауысты және дауыссыз' },
        ]
      },
      {
        title: 'Логикалық сұрақтар', category: 'Логика', difficulty: 'hard',
        questions: [
          { text: 'Егер барлық A — B болса, және барлық B — C болса, онда барлық A — C бола ма?', options: ['Иә', 'Жоқ', 'Белгісіз', 'Кейде'], correctAnswer: 0, explanation: 'Логикалық транзитивтілік' },
          { text: '2, 6, 12, 20, ? Келесі сан?', options: ['28', '30', '32', '24'], correctAnswer: 1, explanation: 'Айырма: 4, 6, 8, 10 → 20+10=30' },
          { text: 'Ата мен әке бірге 60 жаста. Әке бала 30 жаста болғанда туылған. Әке нешеде?', options: ['40', '45', '50', '35'], correctAnswer: 1, explanation: 'Әке = бала + 30. Әке + бала = 60 → 2бала + 30 = 60 → бала = 15, әке = 45' },
          { text: 'Бір қорапта 3 қызыл, 2 көк шар бар. Ең аз дегенде 1 көк алу үшін неше шар алу керек?', options: ['2', '3', '4', '5'], correctAnswer: 2, explanation: 'Ең нашар жағдай: 3 қызыл алдың, 4-ші — міндетті көк' },
          { text: 'Сағат 3:00-де минут пен сағат тілі арасындағы бұрыш?', options: ['60°', '90°', '120°', '180°'], correctAnswer: 1, explanation: '3 × 30° = 90°' },
        ]
      },
      {
        title: 'Жалпы білім', category: 'Жалпы білім', difficulty: 'easy',
        questions: [
          { text: 'Жер шарында неше құрлық бар?', options: ['5', '6', '7', '8'], correctAnswer: 1, explanation: '6 құрлық: Еуразия, Африка, Солтүстік Америка, Оңтүстік Америка, Антарктида, Австралия' },
          { text: 'Әлемдегі ең үлкен мұхит?', options: ['Атлант', 'Үнді', 'Тынық', 'Солтүстік Мұзды'], correctAnswer: 2, explanation: 'Тынық мұхит' },
          { text: 'Адам денесінде неше сүйек бар?', options: ['196', '206', '216', '226'], correctAnswer: 1, explanation: 'Ересек адамда 206 сүйек' },
          { text: 'Күн жүйесінде неше планета бар?', options: ['7', '8', '9', '10'], correctAnswer: 1, explanation: '8 планета (Плутон 2006 жылы алынды)' },
          { text: 'Дүние жүзіндегі ең биік шың?', options: ['К2', 'Эверест', 'Килиманджаро', 'Монблан'], correctAnswer: 1, explanation: 'Эверест — 8849 м' },
        ]
      }
    ];

    for (const cat of categories) {
      const exists = await Quiz.findOne({ title: cat.title });      if (!exists) {
        const createdQuestions = await Question.insertMany(cat.questions);
        await Quiz.create({
          title: cat.title, description: `${cat.category} бойынша тест`,
          category: cat.category, difficulty: cat.difficulty, timePerQuestion: 15,
          questions: createdQuestions.map(q => q._id), createdBy: admin._id
        });
      }
    }

    res.json({ message: '✅ Деректер seed болды!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 QWIZZ сервері ${PORT} портында`));