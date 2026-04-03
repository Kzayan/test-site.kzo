let currentIndex = 0;
let userSelections = new Array(QUESTIONS_DB.length).fill(null);
let totalScore = 0;
let timeLeft = 30;
let timerInterval = null;
let quizActive = true;

// DOM Elements
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const submitBtn = document.getElementById('submitBtn');
const timerSpan = document.getElementById('timer');
const currentQNum = document.getElementById('current-q-num');
const totalQCount = document.getElementById('total-q-count');
const totalQCount2 = document.getElementById('total-q-count2');
const scoreSpan = document.getElementById('score');
const progressFill = document.getElementById('global-progress-fill');
const answeredCountSpan = document.getElementById('answered-count');
const accuracySpan = document.getElementById('accuracy-badge');
const questionIndexBadge = document.getElementById('question-index-badge');
const resultModal = document.getElementById('resultModal');
const finalScoreSpan = document.getElementById('finalScore');
const correctCountSpan = document.getElementById('correct-count');
const wrongCountSpan = document.getElementById('wrong-count');
const restartBtn = document.getElementById('restartBtn');

totalQCount.innerText = QUESTIONS_DB.length;
totalQCount2.innerText = QUESTIONS_DB.length;
scoreSpan.innerText = totalScore;

function updateProgressUI() {
    const answered = userSelections.filter(v => v !== null).length;
    answeredCountSpan.innerText = answered;
    const percent = (answered / QUESTIONS_DB.length) * 100;
    progressFill.style.width = `${percent}%`;
    
    let correctAnswered = 0;
    for (let i = 0; i <= currentIndex; i++) {
        if (userSelections[i] !== null && userSelections[i] === QUESTIONS_DB[i].correct) {
            correctAnswered++;
        }
    }
    const accuracy = answered === 0 ? 0 : Math.floor((correctAnswered / answered) * 100);
    accuracySpan.innerText = `Точность: ${accuracy}%`;
}

function loadQuestion() {
    if (!quizActive) return;
    clearTimer();
    const q = QUESTIONS_DB[currentIndex];
    questionText.innerText = q.text;
    questionIndexBadge.innerText = `Вопрос ${currentIndex+1} из ${QUESTIONS_DB.length}`;
    currentQNum.innerText = currentIndex+1;
    
    optionsContainer.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const div = document.createElement('div');
        div.classList.add('option');
        div.innerText = opt;
        if (userSelections[currentIndex] === idx) div.classList.add('selected');
        div.addEventListener('click', () => selectOption(idx));
        optionsContainer.appendChild(div);
    });
    
    timeLeft = 30;
    timerSpan.innerText = timeLeft;
    startTimer();
    updateProgressUI();
}

function selectOption(idx) {
    if (!quizActive) return;
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    const opts = document.querySelectorAll('.option');
    if (opts[idx]) opts[idx].classList.add('selected');
    userSelections[currentIndex] = idx;
    updateProgressUI();
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!quizActive) return;
        if (timeLeft <= 1) {
            clearTimer();
            handleTimeout();
        } else {
            timeLeft--;
            timerSpan.innerText = timeLeft;
        }
    }, 1000);
}

function clearTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function handleTimeout() {
    if (!quizActive) return;
    if (userSelections[currentIndex] === undefined) {
        userSelections[currentIndex] = -1;
    }
    nextQuestion(true);
}

function calculatePointsForCurrent() {
    const selected = userSelections[currentIndex];
    const isCorrect = (selected === QUESTIONS_DB[currentIndex].correct);
    if (isCorrect && selected !== undefined && selected !== -1) {
        const timeBonus = Math.max(0, timeLeft);
        const earned = 10 + Math.floor(timeBonus / 3);
        totalScore += earned;
        scoreSpan.innerText = totalScore;
    } else if (selected !== undefined && selected !== -1) {
        totalScore = Math.max(0, totalScore - 5);
        scoreSpan.innerText = totalScore;
    }
}

function nextQuestion(isTimeout = false) {
    if (!quizActive) return;
    clearTimer();
    
    if (!isTimeout && userSelections[currentIndex] === undefined) {
        alert('Әуелі жауап нұсқасын таңдаңыз!');
        startTimer();
        return;
    }
    
    calculatePointsForCurrent();
    
    if (currentIndex + 1 < QUESTIONS_DB.length) {
        currentIndex++;
        loadQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    quizActive = false;
    clearTimer();
    
    let correct = 0;
    for (let i = 0; i < QUESTIONS_DB.length; i++) {
        if (userSelections[i] === QUESTIONS_DB[i].correct) correct++;
    }
    const wrong = QUESTIONS_DB.length - correct;
    correctCountSpan.innerText = correct;
    wrongCountSpan.innerText = wrong;
    finalScoreSpan.innerText = totalScore;
    resultModal.classList.add('show');
}

function restartQuiz() {
    currentIndex = 0;
    userSelections = new Array(QUESTIONS_DB.length).fill(null);
    totalScore = 0;
    quizActive = true;
    scoreSpan.innerText = totalScore;
    resultModal.classList.remove('show');
    loadQuestion();
}

submitBtn.addEventListener('click', () => nextQuestion(false));
restartBtn.addEventListener('click', restartQuiz);

// Category filter (қосымша)
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Фильтр логикасын қаласаңыз толықтыра аласыз
    });
});

loadQuestion();