require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// =========== ЖАҢА КЛЮЧ – 2025 ЖЫЛҒЫ ТАЗА КЛЮЧ ===========
process.env.OPENAI_API_KEY = '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';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': 'https://kazakh-quiz-defender.kz',
        'X-Title': 'Қазақша Викторина — Темір Қорған'
    }
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(express.json({ limit: '10kb' }));
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.static('public'));

// =========== ҚОРҒАНЫС ЖҮЙЕСІ – ҚАЗАҚСТАНДЫҚ ТЕМІР ҚОРҒАН ===========

const blockedIPs = new Set();

const blockedUserAgents = [
    'curl', 'wget', 'python', 'postman', 'insomnia', 'sqlmap', 'nikto',
    'nmap', 'dirbuster', 'gobuster', 'masscan', 'zgrab', 'ahrefs', 'semrush',
    'mj12bot', 'headless', 'puppeteer', 'phantomjs', 'selenium', 'httpclient'
];

const maliciousPatterns = [
    /select.*from/i, /union.*select/i, /insert.*into/i, /drop.*table/i,
    /<script/i, /alert\(/i, /onerror=/i, /javascript:/i, /eval\(/i,
    /base64_decode/i, /exec\(/i, /system\(/i, /shell_exec/i,
    /\.\.\//g, /\/etc\/passwd/i, /whoami/i, /cmd\.exe/i, /powershell/i
];

function quickCheck(req) {
    let score = 0;
    const reasons = [];
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const url = req.originalUrl.toLowerCase();
    const query = JSON.stringify(req.query).toLowerCase();
    const body = JSON.stringify(req.body).toLowerCase();

    if (blockedUserAgents.some(bad => ua.includes(bad))) {
        score += 0.9;
        reasons.push('bad_ua');
    }

    const forbiddenPaths = ['/admin', '/wp-', '/.env', '/config', '/.git', '/backup', '/phpmyadmin', '/server.js', '/package.json'];
    if (forbiddenPaths.some(path => url.includes(path))) {
        score += 1.0;
        reasons.push('forbidden_path');
    }

    if (maliciousPatterns.some(pattern => pattern.test(url + query + body))) {
        score += 1.0;
        reasons.push('malicious_pattern');
    }

    return { score: Math.min(score, 1), reasons };
}

async function aiCheck(req, quickResult) {
    const prompt = `Қазақша жауап бер. Бұл сұраныс шабуыл ма, әлде қалыпты ойыншы ма?

Тек және тек мына форматта JSON қайтар:

{"malicious": true/false, "confidence": 0.00-1.00, "reason": "қысқа қазақша себеп"}

Method: ${req.method}
URL: ${req.originalUrl}
IP: ${req.ip}
User-Agent: ${req.headers['user-agent'] || 'жоқ'}
Query: ${JSON.stringify(req.query)}
Body: ${JSON.stringify(req.body).slice(0, 200)}
Quick score: ${quickResult.score.toFixed(2)}
Reasons: ${quickResult.reasons.join(', ') || 'жоқ'}`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0,
            max_tokens: 150
        });

        const text = completion.choices[0].message.content.trim();
        const result = JSON.parse(text);

        return {
            malicious: result.malicious || false,
            confidence: result.confidence || 0.5,
            reason: result.reason || 'no_reason'
        };

    } catch (e) {
        console.log('🤖 AI қате, fallback қолданылды:', e.message);
        return { malicious: quickResult.score > 0.7, confidence: 0.8, reason: 'ai_fail_қатты_күдік' };
    }
}

// =========== ТЕМІР ҚОРҒАН – НЕГІЗГІ MIDDLEWARE ===========
app.use(async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    // Бұрын блокталған ба?
    if (blockedIPs.has(ip)) {
        return res.status(403).json({ error: 'Сен блоктасың. Қош келдің, бірақ қайта келме 😈', blocked: true });
    }

    const quick = quickCheck(req);

    // Жылдам блок (100% шабуыл)
    if (quick.score >= 0.8) {
        blockedIPs.add(ip);
        console.log(`🚨 ЖЫЛДАМ БЛОК: ${ip} → ${quick.reasons.join(', ')}`);
        return res.status(403).json({ error: 'Шабуыл анықталды. Блокталдың.', blocked: true });
    }

    // Орташа күдік → AI шешеді
    if (quick.score >= 0.4) {
        const ai = await aiCheck(req, quick);
        if (ai.malicious && ai.confidence >= 0.7) {
            blockedIPs.add(ip);
            console.log(`🤖 AI БЛОКТАДЫ: ${ip} | Себеп: ${ai.reason} | Сенім: ${ai.confidence}`);
            return res.status(403).json({ 
                error: 'AI сені шабуылшы деп таныды. Қош бол 🤖⚡', 
                blocked: true,
                ai_reason: ai.reason
            });
        }
    }

    next();
});

// Rate Limit – соңғы қорғаныс
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 минут
    max: 150,
    message: { error: 'Тым жылдамсың, баяула. 10 минуттан кейін қайта байқап көр 😅' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// ==================== API ====================

app.get('/api/questions', (req, res) => {
    try {
        const questions = require('./questions.json');
        res.json(questions);
    } catch (e) {
        res.status(500).json({ error: 'Сұрақтар жүктелмеді' });
    }
});

app.post('/api/submit', (req, res) => {
    const { questionId, answer, timeLeft } = req.body;

    if (!questionId || !answer) {
        return res.status(400).json({ error: 'Дұрыс емес сұраныс' });
    }

    // Мұнда кейін дұрыс жауапты тексеру қосылады
    const points = Math.max(5, Math.floor(timeLeft / 2) + 10);

    res.json({ 
        success: true, 
        points,
        message: 'Керемет! Жалғастыр 🔥'
    });
});

// Админ панель – блокталғандарды көру
app.get('/api/admin/blocked', (req, res) => {
    if (req.headers['x-token'] !== 'ADMIN123') {
        return res.status(403).json({ error: 'Рұқсат жоқ, бауырым' });
    }

    res.json({
        total: blockedIPs.size,
        latest_blocked: Array.from(blockedIPs).slice(-20),
        defense_status: 'ТЕМІР ҚОРҒАН ІСКЕ ҚОСЫЛҒАН 🤖⚔️'
    });
});

// Барлық басқа сұраныстар → index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== СЕРВЕР ІСКЕ ҚОСЫЛДЫ ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🛡️  ҚАЗАҚСТАНДЫҚ ТЕМІР ҚОРҒАН ІСКЕ ҚОСЫЛДЫ`);
    console.log(`🚀 Порт: ${PORT}`);
    console.log(`🤖 AI модель: GPT-4o-mini (OpenRouter)`);
    console.log(`🔥 Шабуылшыларға хабар: КЕЛІҢДЕР, КӨРЕМІЗ! 😈\n`);
});