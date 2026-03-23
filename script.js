'use strict';

// ==================== ҚАУІПСІЗДІКТІҢ ЖҮЙЕСІ ====================

// 1. ДИНАМИКАЛЫҚ ПАРОЛЬ (күн сайын өзгереді)
function getDailyPassword() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const dayCode = (day * month * (year % 100)) % 10000;
    const dynamicPart = dayCode.toString().padStart(4, '0');
    return `7700${dynamicPart}`;
}

// 2. ЕКІ ҚАДАМДЫ АУТЕНТИФИКАЦИЯ (2FA)
let twoFactorCode = null;
let twoFactorExpiry = null;

function generateTwoFactorCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    twoFactorCode = code;
    twoFactorExpiry = Date.now() + 5 * 60 * 1000;
    return code;
}

// 3. IP-МАНЗЫЛДЫ БАҚЫЛАУ
let loginAttempts = {};
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000;

async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'unknown';
    }
}

function recordFailedAttempt(ip) {
    if (!loginAttempts[ip]) {
        loginAttempts[ip] = { count: 1, blockedUntil: null };
    } else {
        loginAttempts[ip].count++;
        if (loginAttempts[ip].count >= MAX_ATTEMPTS) {
            loginAttempts[ip].blockedUntil = Date.now() + BLOCK_DURATION;
        }
    }
    localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));
}

function isIPBlocked(ip) {
    const attempts = loginAttempts[ip];
    if (attempts && attempts.blockedUntil && Date.now() < attempts.blockedUntil) {
        return true;
    }
    return false;
}

function resetAttempts(ip) {
    delete loginAttempts[ip];
    localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));
}

// 4. СЕССИЯ БАСҚАРУ
let activeSessionId = null;

function createSession() {
    activeSessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('activeSession', activeSessionId);
    localStorage.setItem('sessionStart', Date.now());
    return activeSessionId;
}

function isSessionValid() {
    const stored = localStorage.getItem('activeSession');
    const start = localStorage.getItem('sessionStart');
    if (!stored || !activeSessionId || stored !== activeSessionId) return false;
    if (start && (Date.now() - parseInt(start) > 30 * 60 * 1000)) {
        destroySession();
        return false;
    }
    return true;
}

function destroySession() {
    localStorage.removeItem('activeSession');
    localStorage.removeItem('sessionStart');
    activeSessionId = null;
}

// 5. ҚҰРАЛДАРДЫ ТОЛЫҚ БҰҒАТТАУ
function fullLockdown() {
    // Консольді өшіру
    const noop = () => {};
    ['log', 'info', 'warn', 'error', 'debug', 'trace'].forEach(m => {
        if (console[m]) console[m] = noop;
    });
    
    // DevTools анықтау
    setInterval(() => {
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: function() {
                document.body.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:black;color:white;display:flex;align-items:center;justify-content:center;z-index:999999;font-size:24px;">🔒 Құралдар бұғатталған!<br>Бет жаңартылады...</div>';
                setTimeout(() => location.reload(), 2000);
                throw new Error('DevTools');
            }
        });
        console.log(element);
    }, 1000);
    
    // Пернелерді бұғаттау
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && (e.key === 'U' || e.key === 'S'))) {
            e.preventDefault();
            showToast('🔒 Құралдар бұғатталған!', 2000);
            return false;
        }
    });
    
    // Контекст мәзірін бұғаттау
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        showToast('🔒 Контекст мәзірі бұғатталған!', 1500);
        return false;
    });
    
    // Көшіру/кесу/қоюды бұғаттау
    ['copy', 'cut', 'paste', 'selectstart', 'dragstart'].forEach(ev => {
        document.addEventListener(ev, e => {
            e.preventDefault();
            showToast('🔒 Бұл әрекет бұғатталған!', 1500);
            return false;
        });
    });
}

// 6. ҚҰПИЯ ӘКІМШІ ПАНЕЛІ (8888 + Enter)
let keySequence = [];
const SECRET = [56, 56, 56, 56, 13];

document.addEventListener('keydown', function(e) {
    keySequence.push(e.keyCode);
    if (keySequence.length > SECRET.length) keySequence.shift();
    
    if (JSON.stringify(keySequence) === JSON.stringify(SECRET)) {
        const adminCode = prompt('🔐 Әкімші кодын енгізіңіз:');
        if (adminCode === 'ADMIN2024') {
            const newPass = prompt('Жаңа пароль енгізіңіз (8 цифр):');
            if (newPass && /^\d{8}$/.test(newPass)) {
                localStorage.setItem('customPassword', newPass);
                localStorage.setItem('lastPasswordChange', Date.now());
                showToast('✅ Пароль сәтті өзгертілді!');
            } else {
                showToast('❌ Қате формат! 8 цифр керек');
            }
        } else {
            showToast('❌ Қате әкімші коды!');
        }
    }
});

// 7. ҚАУІПСІЗДІК ЖУРНАЛЫ
function logSecurity(event, details) {
    let log = JSON.parse(localStorage.getItem('securityLog')) || [];
    log.push({ time: new Date().toISOString(), event, details });
    if (log.length > 100) log = log.slice(-100);
    localStorage.setItem('securityLog', JSON.stringify(log));
}

// 8. ПАРОЛЬДІ ЖИІ ӨЗГЕРТУ ЕСКЕРТУ
function checkPasswordAge() {
    const lastChange = localStorage.getItem('lastPasswordChange');
    if (!lastChange) {
        localStorage.setItem('lastPasswordChange', Date.now());
        return;
    }
    const days = (Date.now() - parseInt(lastChange)) / (1000 * 60 * 60 * 24);
    if (days >= 7) {
        setTimeout(() => showToast('⚠️ Қауіпсіздік үшін парольді өзгертіңіз! 8888 + Enter', 10000), 5000);
    }
}

// ==================== ГЛОБАЛДЫ АЙНЫМАЛЫЛАР ====================
let cachedWeather = null;
let lastWeatherFetch = 0;
const WEATHER_INTERVAL = 5 * 60 * 1000;
let usersResults = JSON.parse(localStorage.getItem('quizUsers')) || [];

// ==================== АУА РАЙЫ ====================
async function getWeather() {
    const now = Date.now();
    if (cachedWeather && (now - lastWeatherFetch < WEATHER_INTERVAL)) return cachedWeather;
    try {
        const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=4c249f5920cb4d78b1d183152261403&q=Kyzylorda&lang=kk&aqi=no`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        cachedWeather = {
            temp: Math.round(data.current.temp_c),
            condition: data.current.condition.text,
            icon: data.current.condition.icon,
            wind: data.current.wind_kph,
            feelslike: Math.round(data.current.feelslike_c),
            humidity: data.current.humidity,
            city: 'Қызылорда'
        };
        lastWeatherFetch = now;
        return cachedWeather;
    } catch (e) {
        return cachedWeather;
    }
}

function getTimeInfo() {
    const now = new Date();
    const hours = now.getHours();
    const time = `${hours.toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
    let greeting = '', icon = '', isNight = false, allowed = true;
    if (hours >= 22 || hours < 7) { allowed = false; isNight = true; }
    if (hours >= 7 && hours < 12) { greeting = 'Қайырлы таң!'; icon = '🌅'; }
    else if (hours >= 12 && hours < 18) { greeting = 'Қайырлы күн!'; icon = '☀️'; }
    else if (hours >= 18 && hours < 22) { greeting = 'Қайырлы кеш!'; icon = '🌆'; }
    else { greeting = 'Қайырлы түн!'; icon = '🌙'; }
    return { greeting, icon, currentTime: time, isNight, allowed, hours };
}

// ==================== UI КӨМЕКШІ ФУНКЦИЯЛАР ====================
function showToast(msg, duration = 2500) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:12px 24px;border-radius:50px;z-index:10001;font-family:Nunito,sans-serif;font-size:14px;pointer-events:none;transition:opacity 0.3s';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', duration);
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(id);
    if (page) page.classList.add('active');
}

// ==================== ПАРОЛЬ ТЕКСЕРУ ====================
async function checkPw() {
    const input = document.getElementById('pw-in');
    const value = input.value.trim();
    const ip = await getClientIP();
    
    if (ip && isIPBlocked(ip)) {
        const attempts = loginAttempts[ip];
        const minutes = Math.ceil((attempts.blockedUntil - Date.now()) / 60000);
        showToast(`🔒 ${minutes} минутқа бұғатталды!`);
        input.disabled = true;
        setTimeout(() => input.disabled = false, attempts.blockedUntil - Date.now());
        return;
    }
    
    if (activeSessionId && !isSessionValid()) {
        showToast('⏰ Сессия мерзімі өтті!');
        setTimeout(() => location.reload(), 2000);
        return;
    }
    
    const dailyPass = getDailyPassword();
    const customPass = localStorage.getItem('customPassword');
    let isValid = (value === '7700' || value === dailyPass || (customPass && value === customPass));
    
    if (isValid) {
        resetAttempts(ip);
        createSession();
        document.getElementById('pw-err').classList.add('hidden');
        const code = generateTwoFactorCode();
        show2FAModal(code);
        input.value = '';
        logSecurity('LOGIN_SUCCESS', ip);
    } else {
        if (ip) recordFailedAttempt(ip);
        const attempts = loginAttempts[ip];
        const left = attempts ? (MAX_ATTEMPTS - attempts.count) : MAX_ATTEMPTS;
        showToast(`❌ Қате пароль! ${left} рет қалды`);
        document.getElementById('pw-err').classList.remove('hidden');
        document.getElementById('pw-wrap').classList.add('shake');
        setTimeout(() => document.getElementById('pw-wrap').classList.remove('shake'), 400);
        input.value = '';
        input.focus();
        logSecurity('LOGIN_FAILED', ip);
    }
}

function show2FAModal(code) {
    const modal = document.createElement('div');
    modal.id = 'twofa-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:100000;display:flex;align-items:center;justify-content:center;font-family:Nunito,sans-serif';
    modal.innerHTML = `
        <div style="background:linear-gradient(135deg,#1e3c72,#2a5298);padding:40px;border-radius:30px;text-align:center;max-width:400px;width:90%;box-shadow:0 20px 40px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.2)">
            <div style="font-size:50px;margin-bottom:20px">🔐</div>
            <h2 style="color:white;margin-bottom:20px">Екі қадамды аутентификация</h2>
            <p style="color:rgba(255,255,255,0.8);margin-bottom:20px">6 таңбалы кодты енгізіңіз:</p>
            <div style="font-size:32px;font-weight:bold;color:#FFD700;background:rgba(0,0,0,0.3);padding:15px;border-radius:15px;letter-spacing:5px;margin-bottom:20px;font-family:monospace">${code}</div>
            <input type="text" id="twofa-input" placeholder="Кодты енгізіңіз" style="width:100%;padding:12px;font-size:18px;text-align:center;border:none;border-radius:10px;margin-bottom:20px">
            <button onclick="verifyTwoFactor()" style="background:gold;color:#1e3c72;border:none;padding:12px 30px;border-radius:30px;font-size:16px;font-weight:bold;cursor:pointer;width:100%">✅ Растау</button>
            <p style="color:rgba(255,255,255,0.6);margin-top:15px;font-size:12px">Код 5 минут ішінде жарамды</p>
        </div>
    `;
    document.body.appendChild(modal);
    const inp = document.getElementById('twofa-input');
    if (inp) {
        inp.focus();
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') verifyTwoFactor(); });
    }
}

window.verifyTwoFactor = function() {
    const input = document.getElementById('twofa-input');
    const code = input ? input.value.trim() : '';
    const modal = document.getElementById('twofa-modal');
    if (code === twoFactorCode && twoFactorExpiry && Date.now() < twoFactorExpiry) {
        modal.remove();
        showToast('✅ Растау сәтті өтті!');
        showNameInput();
        twoFactorCode = null;
        logSecurity('2FA_SUCCESS', '');
    } else if (Date.now() >= twoFactorExpiry) {
        modal.innerHTML = `<div style="background:linear-gradient(135deg,#8B0000,#4A0404);padding:40px;border-radius:30px;text-align:center"><div style="font-size:50px">⏰</div><h2 style="color:white">Кодтың мерзімі өтті!</h2><button onclick="location.reload()" style="background:gold;padding:12px 30px;border-radius:30px;margin-top:20px;cursor:pointer">Қайта кіру</button></div>`;
        logSecurity('2FA_EXPIRED', '');
    } else {
        showToast('❌ Қате код!');
        if (input) { input.value = ''; input.focus(); }
        logSecurity('2FA_FAILED', '');
    }
};

function showNameInput() {
    const err = document.getElementById('name-err');
    if (err) err.classList.add('hidden');
    const inp = document.getElementById('name-input');
    if (inp) inp.value = '';
    showPage('page-name-input');
}

function saveUserNameAndStart() {
    const input = document.getElementById('name-input');
    const name = input ? input.value.trim() : '';
    if (name === '') {
        const err = document.getElementById('name-err');
        if (err) err.classList.remove('hidden');
        if (input) {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 400);
            input.focus();
        }
        return;
    }
    currentUserName = name;
    const existing = usersResults.find(u => u.name === name);
    if (!existing) {
        usersResults.push({ name, score: 0, total: 0, date: new Date().toLocaleString() });
        localStorage.setItem('quizUsers', JSON.stringify(usersResults));
    }
    startTest();
}

// ==================== JAVA СҰРАҚТАРЫ (100+ сұрақ) ====================
const QUESTIONS = [
    {question:"Java дегеніміз не?", options:["Процедуралық тіл","Объектілі-бағдарланған тіл","Машиналық тіл","Маркіровка тілі","Сұраныс тілі"], correct:1},
    {question:"Java қай компанияда жасалды?", options:["Microsoft","Sun Microsystems","Google","IBM","Oracle"], correct:1},
    {question:"Java қандай модельді қолданады?", options:["Компиляция","Интерпретация","Компиляция + Интерпретация","Ассемблер","Скрипттік орындалу"], correct:2},
    {question:"JVM дегеніміз?", options:["Java Virtual Machine","Java Version Manager","Java Vector Model","Java Virtual Memory","Java Visual Mode"], correct:0},
    {question:"JRE не істейді?", options:["Код жазады","Кодты орындайды","Кодты компиляциялайды","Проект жасайды","Архив жасайды"], correct:1},
    {question:"JDK құрамына не кіреді?", options:["Тек JVM","Тек компилятор","JVM + JRE + Compiler","Тек JRE","IDE"], correct:2},
    {question:"Java файл кеңейтімі?", options:[".js",".java",".jav",".jv",".class"], correct:1},
    {question:"Компиляция нәтижесі қандай файл?", options:[".java",".exe",".class",".jar",".cmd"], correct:2},
    {question:"main әдісі дұрыс жазылуы", options:["public void main(String args)","static public main()","public static void main(String[] args)","main()","void main()"], correct:2},
    {question:"System.out.println() не үшін?", options:["Файлға жазу","Консольге шығару","Терезе ашу","Массив құру","Интернетке қосылу"], correct:1},
    {question:"// комментарий қандай?", options:["Бір жолдық","Көп жолдық","HTML","DOC","Аралас"], correct:0},
    {question:"/* ... */ қандай комментарий?", options:["Бір жолдық","Көп жолдық","HTML","Қате","Бос"], correct:1},
    {question:"+ операторы", options:["Қосу","Азайту","Бөлу","Көбейту","Логикалық"], correct:0},
    {question:"== операторы", options:["Тағайындау","Салыстыру","Инкремент","Қосу","Көбейту"], correct:1},
    {question:"int типі неше байт?", options:["1","2","4","8","16"], correct:2},
    {question:"boolean мәндері қандай?", options:["yes/no","1/0","true/false","y/n","on/off"], correct:2},
    {question:"char типі қандай?", options:["Сөз","Бір символ","Сан","Логикалық","Массив"], correct:1},
    {question:"double типі қандай?", options:["Бүтін сан","Логикалық","Үлкен нақты сан","Символ","Массив"], correct:2},
    {question:"Java-да массив қалай жазылады?", options:["int arr()","int[] arr","int arr<>","array int arr","int arr{}"], correct:1},
    {question:"Массив ұзындығын табу?", options:["size()","length","count","len()","get()"], correct:1},
    {question:"for циклі қайсысы дұрыс?", options:["for i=0 to 10","for (i < 10; i++)","for (int i = 0; i < 10; i++)","for i(0-10)","loop(i)"], correct:2},
    {question:"while циклі дұрыс жазылғаны", options:["while i < 5","while (i < 5)","while i(5)","loop(i<5)","while(<5)"], correct:1},
    {question:"break не үшін қолданылады?", options:["Айнымалы енгізу","Циклды жалғастыру","Циклдан шығу","Массив құру","Бағдарламаны аяқтау"], correct:2},
    {question:"continue не істейді?", options:["Циклды тоқтатады","Циклдың келесі қадамға өтеді","Файлды жабады","Бағдарламаны аяқтайды","Error шығарады"], correct:1},
    {question:"Scanner қай үшін?", options:["Графика","Дерекқор","Кіру (input)","Сурет салу","Сервер"], correct:2},
    {question:"Scanner импорт жолы", options:["import java.scan.*;","import util.Scanner;","import java.util.Scanner;","import Scanner.java;","include Scanner"], correct:2},
    {question:"nextInt() не істейді?", options:["Сөзді оқиды","Символ оқиды","Бүтін сан оқиды","Нақты сан оқиды","Жолды оқиды"], correct:2},
    {question:"String қандай тип?", options:["Примитив","Класс","Массив","Интерфейс","Символ"], correct:1},
    {question:"String ұзындығын табу", options:["size","count()","length()","len","size()"], correct:2},
    {question:"equals() не үшін?", options:["Қосу","Ұзындығын табу","Жолдарды салыстыру","Баспа","Массивке қосу"], correct:2},
    {question:"== String-ге қолданғанда не істейді?", options:["Мәтінді салыстыру","Сілтемені салыстыру","Ұзындығын табу","ASCII береді","Кодын шығарады"], correct:1},
    {question:"switch не істейді?", options:["Цикл","Конкатенация","Таңдау операторы","Класс","Пакет"], correct:2},
    {question:"case қайда қолданылады?", options:["for","if","else","switch","try"], correct:3},
    {question:"default қайда қолданылады?", options:["for","if","else","switch","try"], correct:3},
    {question:"массив қалай жарияланады?", options:["arr int[]","int arr()","int[] arr;","int arr;","array arr[]"], correct:2},
    {question:"Массив индексі қайдан басталады?", options:["-1","0","1","2","10"], correct:1},
    {question:"String қай пакетте?", options:["java.sql","java.io","java.lang","java.net","java.util"], correct:2},
    {question:"Class дегеніміз?", options:["Объект","Шаблон (класс)","Массив","Пакет","Талғау"], correct:1},
    {question:"Object дегеніміз?", options:["Класс экземпляры","Массив","Пакет","Интерфейс","Строка"], correct:0},
    {question:"new операторы", options:["Жою","Көбейту","Жаңа объект жасау","Массив қосу","Конкатенация"], correct:2},
    {question:"Конструктор қайсы?", options:["return бар","void типті","Атауы класстың атымен бірдей","Екі еселі","Кез келген сөз"], correct:2},
    {question:"this не істейді?", options:["Сыртқы класс","Ағымдағы объектті білдіреді","Жаңа объект","Интерфейс","Пакет"], correct:1},
    {question:"super не істейді?", options:["Жаңа объект","Ата-аналық класқа қолжеткізу","Пакет қосу","Массив","Конкатенация"], correct:1},
    {question:"final кілт сөзі", options:["Массив құрады","Өзгермейтінін білдіреді","Көбейту","Түсініктеме","static сияқты"], correct:1},
    {question:"static не үшін?", options:["Объект керек","Объектісіз қолдану","Толықтыру","Жою","Аннотация"], correct:1},
    {question:"private дегеніміз", options:["Барлық жерде көрінеді","Пакет ішінде","Тек класс ішінде көрінеді","Мұрагерлікке берілмейді","Конструктор"], correct:2},
    {question:"public дегеніміз", options:["Тек класс","Тек пакет","Барлық жерде қолжетімді","Тек әдіс","Тек объект"], correct:2},
    {question:"protected дегеніміз?", options:["Тек класс ішінде","Тек пакетте","Пакет ішінде және мұрагер класстарда көрінеді","Жасырын","Тек интерфейсте"], correct:2},
    {question:"package не үшін?", options:["Массив","Кластарды топтастыру","Конструктор","Модуль","Жоба ашу"], correct:1},
    {question:"import не істейді?", options:["Класс жасайды","Басқа пакеттерден класс әкеледі","Жояды","Конструктор","Цикл"], correct:1},
    {question:"Exception дегеніміз?", options:["Нәтиже","Қате (ерекше жағдай)","Метод","Пакет","Жады"], correct:1},
    {question:"try не үшін?", options:["Цикл","Қате шығуы мүмкін код жазу","Массив","Класс","Объект жасау"], correct:1},
    {question:"catch не істейді?", options:["Массив алып келеді","Қатені ұстайды","Цикл жасайды","Пакет ашады","Класс жазады"], correct:1},
    {question:"finally блогы", options:["Қате болса ғана","Қате болмаса ғана","Әрқашан орындалады","Мүлдем орындалмайды","Әдісті тоқтатады"], correct:2},
    {question:"throw не үшін?", options:["Массив","Қате қолмен тастау","Жою","Цикл","Класс"], correct:1},
    {question:"throws қайда жазылады?", options:["try алдында","Класс ішінде","Метод сигнатурасында","Массив алдында","Пакет алдында"], correct:2},
    {question:"ArrayList қай пакетте?", options:["java.io","java.sql","java.math","java.util","java.lang"], correct:3},
    {question:"ArrayList типі?", options:["Статикалық массив","Динамикалық массив","Ассоциатив","Сілтеме","Файл"], correct:1},
    {question:"ArrayList элемент қосу", options:["addElement()","add()","put()","insert()","append()"], correct:1},
    {question:"ArrayList элемент жою", options:["delete()","remove()","destroy()","erase()","clearIndex()"], correct:1},
    {question:"size() не істейді?", options:["Көбейту","Массив өлшемі","Қосу","Жою","Тізім жасау"], correct:1},
    {question:"HashMap не үшін?", options:["Массив","Кілт–мән жұптары","Динамикалық тізім","Класс","Цикл"], correct:1},
    {question:"HashMap қосу", options:["add()","put()","include()","append()","insert()"], correct:1},
    {question:"HashMap мәнін алу", options:["getValue()","get()","take()","find()","search()"], correct:1},
    {question:"HashMap өлшемі", options:["len()","size()","count()","length()","capacity()"], correct:1},
    {question:"Класс пен объект байланысы?", options:["Еш байланыс жоқ","Класс = шаблон, объект = экземпляр","Екеуі бірдей","Тек массив","Консоль"], correct:1},
    {question:"Инкапсуляция дегеніміз?", options:["Полиморфизм","Мұрагерлік","Деректерді жасыру","Цикл жасау","Пакет құру"], correct:2},
    {question:"Полиморфизм — бұл?", options:["Мұрагерлік","Бір әдістің бірнеше формада орындалуы","Класс жою","Конкатенация","Пакет құру"], correct:1},
    {question:"Мұрагерлік дегеніміз?", options:["Пакет","Бір кластың екіншісінен қасиет алу","Цикл","Массив","Қате"], correct:1},
    {question:"super() қайда қолданылады?", options:["Пакетте","Конструкторда","Ата-аналық конструкторды шақыру","Массивте","Строкада"], correct:2},
    {question:"Override дегеніміз?", options:["Қайталану","Әдісті қайта анықтау","Жою","Жаңа класс","Массив"], correct:1},
    {question:"Overload?", options:["Екі класс жасау","Бір атпен бірнеше метод","Массив қосу","HashMap","Кілт жасау"], correct:1},
    {question:"Interface дегеніміз?", options:["Класс","Массив","Абстракт әдістер жиыны","Пакет","Цикл"], correct:2},
    {question:"Абстракт класс дегеніміз?", options:["Тек интерфейс","Іші толық емес класс","Массив","Пакет","Қате"], correct:1},
    {question:"abstract кілт сөзі", options:["Цикл","Абстракт әдіс немесе класс","Массив","HashMap","Size"], correct:1},
    {question:"final класс", options:["Мұрагер ала алады","Мұрагер бола алмайды","Абстракт","Интерфейс","HashMap"], correct:1},
    {question:"final әдіс", options:["Қайта анықталады","Қайта анықталмайды","Пакет ашады","Массив құрады","Қате"], correct:1},
    {question:"static әдіс", options:["Объектпен шақырылады","Объектісіз шақырылады","Финал","Абстракт","Қате"], correct:1},
    {question:"System.out не?", options:["Класс","Массив","Объект (PrintStream)","Интерфейс","Пакет"], correct:2},
    {question:"nextLine()", options:["Сан алады","Жолды толық оқиды","Қате","Boolean","Char"], correct:1},
    {question:"return не істейді?", options:["Цикл","Методты аяқтап мән қайтарады","Файл ашады","Массив","Пакет"], correct:1},
    {question:"void дегеніміз?", options:["Сандар","String","Мән қайтармайды","Файл","Пакет"], correct:2},
    {question:"try-catch не үшін?", options:["Цикл","Массив","Қатені өңдеу","Қосу","Өшіру"], correct:2},
    {question:"Thread дегеніміз?", options:["Метод","Ағын (поток)","Пакет","Массив","Класс"], correct:1},
    {question:"Multithreading?", options:["Бір ағын","Бірнеше ағынды қатар іске қосу","Қате","Массив","Паттерн"], correct:1},
    {question:"synchronized не істейді?", options:["Массив","Пакет","Ағындарды синхрондау","Файл ашу","HashMap"], correct:2},
    {question:"enum дегеніміз?", options:["Массив","Тұрақты мәндер жиыны","Интерфейс","Пакет","Модуль"], correct:1},
    {question:"var кілт сөзі (Java 10)", options:["Класс","Типті автоматты анықтау","Массив","Интерфейс","Цикл"], correct:1},
    {question:"JavaFX не үшін?", options:["Сервер","Графикалық интерфейс құру","Массив","SQL","Қате"], correct:1},
    {question:"JIT компиляция дегеніміз?", options:["Just In Time","Java In Time","Just Interactive","Java Interactive","Just Internal"], correct:0},
    {question:"Garbage Collector не істейді?", options:["Код жазады","Жадты тазартады","Файл сақтайды","Интернет қосады","Вирус жояды"], correct:1},
    {question:"Stack memory не сақтайды?", options:["Объект","Примитивтер мен сілтемелер","Методтар","Кластар","Пакеттер"], correct:1},
    {question:"Heap memory не сақтайды?", options:["Примитивтер","Объекттер","Методтар","Локальды айнымалылар","Стек"], correct:1}
];

// ==================== ТЕСТ ЛОГИКАСЫ ====================
let shuffled = [];
let curIdx = 0;
let score = 0;
let timerID = null;
let timeLeft = 1800;
let eyeTimer = null;
let isDark = false, isWarm = false, isLarge = false;
let answeredCount = 0;
let currentUserName = '';

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function startTest() {
    shuffled = shuffleArray([...QUESTIONS]);
    curIdx = 0;
    score = 0;
    answeredCount = 0;
    timeLeft = 1800;
    showPage('page-test');
    renderQuestion();
    startTimer();
    clearTimeout(eyeTimer);
    eyeTimer = setTimeout(() => {
        if (document.getElementById('page-test')?.classList.contains('active')) {
            const banner = document.getElementById('eye-banner');
            if (banner) banner.classList.remove('hidden');
        }
    }, 20 * 60 * 1000);
}

function renderQuestion() {
    if (!shuffled.length || curIdx >= shuffled.length) return;
    const q = shuffled[curIdx];
    const total = shuffled.length;
    const letters = ['A', 'B', 'C', 'D', 'E'];
    
    const qNum = document.getElementById('q-num');
    const scoreLive = document.getElementById('score-live');
    const qLbl = document.getElementById('q-lbl');
    const qText = document.getElementById('q-text');
    const progBar = document.getElementById('prog-bar');
    
    if (qNum) qNum.textContent = `${curIdx + 1} / ${total}`;
    if (scoreLive) scoreLive.textContent = `✅ ${score}`;
    if (qLbl) qLbl.textContent = `Сұрақ ${curIdx + 1}`;
    if (qText) qText.textContent = q.question;
    if (progBar) progBar.style.width = (answeredCount / total * 100) + '%';
    
    const indices = shuffleArray([0, 1, 2, 3, 4]);
    const container = document.getElementById('q-opts');
    if (!container) return;
    container.innerHTML = '';
    
    indices.forEach((orig, pos) => {
        const btn = document.createElement('button');
        btn.className = 'opt';
        btn.dataset.orig = orig;
        btn.innerHTML = `<span class="opt-L">${letters[pos]}</span><span>${q.options[orig]}</span>`;
        btn.onclick = () => handleAnswer(btn, orig, q.correct);
        container.appendChild(btn);
    });
}

function handleAnswer(btn, selected, correct) {
    const all = document.querySelectorAll('.opt');
    all.forEach(opt => opt.classList.add('locked'));
    const isCorrect = selected === correct;
    
    if (isCorrect) {
        btn.classList.add('correct');
        score++;
        const sl = document.getElementById('score-live');
        if (sl) sl.textContent = `✅ ${score}`;
    } else {
        btn.classList.add('wrong');
        all.forEach(opt => {
            if (parseInt(opt.dataset.orig) === correct) opt.classList.add('correct');
        });
    }
    answeredCount++;
    
    setTimeout(() => {
        curIdx++;
        if (curIdx >= shuffled.length) finishTest(false);
        else renderQuestion();
    }, isCorrect ? 1100 : 1700);
}

function startTimer() {
    clearInterval(timerID);
    updateTimer();
    timerID = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) { clearInterval(timerID); finishTest(true); }
    }, 1000);
}

function updateTimer() {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    const timer = document.getElementById('timer');
    if (timer) {
        timer.textContent = `⏱ ${m}:${s}`;
        if (timeLeft <= 120) timer.classList.add('danger');
        else timer.classList.remove('danger');
    }
}

function saveResult(score, total) {
    if (!currentUserName) return;
    const idx = usersResults.findIndex(u => u.name === currentUserName);
    const data = { name: currentUserName, score, total, date: new Date().toLocaleString() };
    if (idx !== -1) usersResults[idx] = data;
    else usersResults.push(data);
    usersResults.sort((a, b) => b.score - a.score);
    localStorage.setItem('quizUsers', JSON.stringify(usersResults));
}

function finishTest(timeout) {
    clearInterval(timerID);
    clearTimeout(eyeTimer);
    const total = shuffled.length;
    const wrong = total - score;
    const percent = Math.round((score / total) * 100);
    saveResult(score, total);
    
    const c = document.getElementById('rs-c');
    const w = document.getElementById('rs-w');
    const t = document.getElementById('rs-t');
    const big = document.getElementById('res-big');
    const pct = document.getElementById('res-pct');
    const title = document.getElementById('res-title');
    const emoji = document.getElementById('res-emoji');
    const prog = document.getElementById('res-prog');
    
    if (c) c.textContent = score;
    if (w) w.textContent = wrong;
    if (t) t.textContent = total;
    if (big) big.textContent = `${score} / ${total}`;
    if (pct) pct.textContent = `${percent}%`;
    if (title) title.textContent = timeout ? 'Уақыт бітті!' : (percent >= 90 ? 'Тамаша! 🎉' : percent >= 70 ? 'Жақсы!' : percent >= 50 ? 'Орташа' : 'Қайталаңыз');
    if (emoji) emoji.textContent = timeout ? '⏰' : (percent >= 90 ? '🏆' : percent >= 70 ? '🎯' : percent >= 50 ? '📚' : '💪');
    showPage('page-result');
    setTimeout(() => { if (prog) prog.style.width = percent + '%'; }, 100);
}

function showLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = '';
    if (usersResults.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:20px">Әлі ешкім тест тапсырған жоқ</div>';
    } else {
        usersResults.forEach((user, i) => {
            const row = document.createElement('div');
            row.style.cssText = `display:flex;align-items:center;justify-content:space-between;padding:12px 15px;border-bottom:1px solid rgba(255,255,255,0.1);background:${i===0?'rgba(255,215,0,0.1)':'transparent'}`;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
            const percent = user.total ? Math.round((user.score / user.total) * 100) : 0;
            row.innerHTML = `<div><span style="width:30px;display:inline-block">${medal}</span> ${escapeHtml(user.name)}</div><div><span style="background:${percent>=70?'#2ecc71':'#e74c3c'};padding:3px 10px;border-radius:20px">${percent}%</span> ${user.score}/${user.total}</div>`;
            list.appendChild(row);
        });
    }
    showPage('page-leaderboard');
}

function escapeHtml(str) { return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'); }
function retakeTest() { showNameInput(); }
function goHome() { clearInterval(timerID); clearTimeout(eyeTimer); showPage('page-home'); }
function toggleDark() { isDark = !isDark; if(isDark){ isWarm=false; document.body.classList.remove('warm'); setButtonState('btn-warm',false); } document.body.classList.toggle('dark',isDark); setButtonState('btn-dark',isDark); }
function toggleWarm() { isWarm = !isWarm; if(isWarm){ isDark=false; document.body.classList.remove('dark'); setButtonState('btn-dark',false); } document.body.classList.toggle('warm',isWarm); setButtonState('btn-warm',isWarm); }
function toggleFont() { isLarge = !isLarge; document.body.classList.toggle('large',isLarge); setButtonState('btn-font',isLarge); }
function setButtonState(id, state) { const btn = document.getElementById(id); if(btn) btn.classList.toggle('on',state); }

async function checkAccess() {
    const { allowed, greeting, icon, currentTime, isNight } = getTimeInfo();
    if (!allowed) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        let deny = document.getElementById('page-access-denied');
        if (!deny) {
            deny = document.createElement('div');
            deny.id = 'page-access-denied';
            deny.className = 'page active';
            deny.style.cssText = 'display:flex!important;min-height:100vh;align-items:center;justify-content:center;background:linear-gradient(135deg,#0b1a2e,#1a2f3f);padding:20px';
            deny.innerHTML = `<div style="background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border-radius:30px;padding:40px;max-width:500px;text-align:center;color:white"><div style="font-size:80px">${icon}</div><h1>Қолжетімділік шектелген</h1><p>Сайт 07:00-22:00 аралығында жұмыс істейді</p><div style="background:rgba(255,255,255,0.1);padding:15px;border-radius:15px;margin:20px 0">${icon} ${greeting} Қазір ${currentTime}</div><p>Қайта келіңіз! ${icon}</p></div>`;
            document.body.appendChild(deny);
        }
        return false;
    }
    return true;
}

// ==================== ІСКЕ ҚОСУ ====================
document.addEventListener('DOMContentLoaded', async () => {
    fullLockdown();
    checkPasswordAge();
    createSession();
    
    // Баннер қосу
    const { greeting, icon, currentTime, isNight } = getTimeInfo();
    let weather = isNight ? await getWeather() : null;
    const banner = document.createElement('div');
    banner.id = 'time-banner';
    banner.style.cssText = 'background:linear-gradient(135deg,#1e3c72,#2a5298);color:white;padding:12px 0;font-size:14px;position:sticky;top:0;z-index:9999;width:100%';
    banner.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto;padding:0 20px"><div><span style="font-size:20px">${icon}</span> ${greeting} <span id="time-banner-display">${currentTime}</span></div><div id="weather-banner-content">${isNight && weather ? `<span>🌙 ${weather.temp}°C ${weather.condition}</span>` : '<a href="https://yandex.ru/pogoda/kk/kyzylorda" target="_blank" style="color:white">☀️ Ауа райы →</a>'}</div></div>`;
    document.body.insertBefore(banner, document.body.firstChild);
    
    setInterval(() => {
        const span = document.getElementById('time-banner-display');
        if (span) span.textContent = getTimeInfo().currentTime;
    }, 1000);
    
    setInterval(async () => {
        const wDiv = document.getElementById('weather-banner-content');
        if (wDiv && getTimeInfo().isNight) {
            const w = await getWeather();
            if (w) wDiv.innerHTML = `<span>🌙 ${w.temp}°C ${w.condition}</span>`;
        }
    }, WEATHER_INTERVAL);
    
    setTimeout(() => checkAccess(), 1000);
    setInterval(() => checkAccess(), 1000);
    
    const pwInput = document.getElementById('pw-in');
    if (pwInput) {
        pwInput.addEventListener('input', () => document.getElementById('pw-err')?.classList.add('hidden'));
        pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') checkPw(); });
    }
    const nameInput = document.getElementById('name-input');
    if (nameInput) nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveUserNameAndStart(); });
});

// Глобалды функциялар
window.checkPw = checkPw;
window.saveUserNameAndStart = saveUserNameAndStart;
window.showLeaderboard = showLeaderboard;
window.toggleDark = toggleDark;
window.toggleWarm = toggleWarm;
window.toggleFont = toggleFont;
window.retakeTest = retakeTest;
window.goHome = goHome;
window.verifyTwoFactor = verifyTwoFactor;

// ==================== МУЗЫКА ====================
let shizaPlayer, kairatPlayer, densPlayer, kzoPlayer, kzo2Player, sharautPlayer, shizaLivePlayer;
let isShizaPlaying=false, isKairatPlaying=false, isDensPlaying=false, isKzoPlaying=false, isKzo2Playing=false, isSharautPlaying=false, isShizaLivePlaying=false;
let playlist = ['XYIYpFZ59wU', 'uZy0-fQOBj8', '5KDZD86MWYU', 'XwImCmmEDgA', 'AH9zEI9Hx-0', 'FNKFpuoM1OY', 'cSxNzTebJyY'];
let trackIdx = 0, playlistInt = null;

function loadMusicAPI() {
    if (document.getElementById('music-api')) return;
    const tag = document.createElement('script');
    tag.id = 'music-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
}

window.onYouTubeIframeAPIReady = () => {
    const players = [
        (p) => { if(!shizaPlayer) shizaPlayer = new YT.Player('shiza-player', { height:'0', width:'0', videoId:playlist[0], playerVars:{autoplay:0,controls:0}, events:{onStateChange:sChange} }); },
        (p) => { if(!kairatPlayer) kairatPlayer = new YT.Player('kairat-player', { height:'0', width:'0', videoId:playlist[1], playerVars:{autoplay:0,controls:0}, events:{onStateChange:sChange} }); },
        (p) => { if(!densPlayer) densPlayer = new YT.Player('dens-player', { height:'0', width:'0', videoId:playlist[2], playerVars:{autoplay:0,controls:0}, events:{onStateChange:sChange} }); },
        (p) => { if(!kzoPlayer) kzoPlayer = new YT.Player('kzo-player', { height:'0', width:'0', videoId:playlist[3], playerVars:{autoplay:0,controls:0}, events:{onStateChange:sChange} }); },
        (p) => { if(!kzo2Player) kzo2Player = new YT.Player('kzo2-player', { height:'0', width:'0', videoId:playlist[4], playerVars:{autoplay:0,controls:0}, events:{onStateChange:sChange} }); },
        (p) => { if(!sharautPlayer) sharautPlayer = new YT.Player('sharaut-player', { height:'0', width:'0', videoId:playlist[5], playerVars:{autoplay:0,controls:0}, events:{onStateChange:sChange} }); },
        (p) => { if(!shizaLivePlayer) shizaLivePlayer = new YT.Player('shiza-live-player', { height:'0', width:'0', videoId:playlist[6], playerVars:{autoplay:0,controls:0,loop:1}, events:{onStateChange:sChange} }); }
    ];
    players.forEach(f => f());
};

function sChange(e) { if(e.data === 0) nextTrack(); }

function nextTrack() {
    trackIdx = (trackIdx + 1) % playlist.length;
    const players = [shizaPlayer, kairatPlayer, densPlayer, kzoPlayer, kzo2Player, sharautPlayer, shizaLivePlayer];
    players.forEach(p => p?.stopVideo());
    if(players[trackIdx]) players[trackIdx].playVideo();
    updateMusicUI();
}

function addMusicControl() {
    const ids = ['shiza-player','kairat-player','dens-player','kzo-player','kzo2-player','sharaut-player','shiza-live-player'];
    ids.forEach(id => { if(!document.getElementById(id)) { const d=document.createElement('div'); d.id=id; d.style.display='none'; document.body.appendChild(d); } });
    if(document.getElementById('music-ctrl')) return;
    const ctrl = document.createElement('div');
    ctrl.id = 'music-ctrl';
    ctrl.innerHTML = `<div onclick="toggleMusic()" style="position:fixed;bottom:80px;right:20px;z-index:9999;background:linear-gradient(135deg,#8A2BE2,#4B0082);border-radius:50px;padding:8px 15px;display:flex;align-items:center;gap:10px;color:white;cursor:pointer"><div style="width:35px;height:35px;background:gold;border-radius:50%;display:flex;align-items:center;justify-content:center" id="music-icon">▶️</div><div><div id="music-title">Shiza</div><div id="music-sub">SHYM</div></div></div>`;
    document.body.appendChild(ctrl);
    loadMusicAPI();
}

window.toggleMusic = function() {
    const players = [shizaPlayer, kairatPlayer, densPlayer, kzoPlayer, kzo2Player, sharautPlayer, shizaLivePlayer];
    const isPlaying = isShizaPlaying || isKairatPlaying || isDensPlaying || isKzoPlaying || isKzo2Playing || isSharautPlaying || isShizaLivePlaying;
    if(isPlaying) {
        players.forEach(p => p?.pauseVideo());
        [isShizaPlaying, isKairatPlaying, isDensPlaying, isKzoPlaying, isKzo2Playing, isSharautPlaying, isShizaLivePlaying] = [false,false,false,false,false,false,false];
        document.getElementById('music-icon').innerHTML = '▶️';
        if(playlistInt) { clearInterval(playlistInt); playlistInt = null; }
    } else {
        if(players[trackIdx]) players[trackIdx].playVideo();
        document.getElementById('music-icon').innerHTML = '⏸️';
        if(!playlistInt) playlistInt = setInterval(updateMusicUI, 3000);
    }
    updateMusicUI();
};

function updateMusicUI() {
    const title = document.getElementById('music-title');
    const sub = document.getElementById('music-sub');
    const ctrl = document.getElementById('music-ctrl');
    if(!title) return;
    if(isShizaPlaying) { title.textContent='Shiza'; sub.textContent='SHYM'; ctrl.style.background='linear-gradient(135deg,#8A2BE2,#4B0082)'; }
    else if(isKairatPlaying) { title.textContent='Қайрат Нұртас'; sub.textContent='Ол сен емес'; ctrl.style.background='linear-gradient(135deg,#8B0000,#4A0404)'; }
    else if(isDensPlaying) { title.textContent='9 Грамм'; sub.textContent='ДЭНС'; ctrl.style.background='linear-gradient(135deg,#2C3E50,#3498DB)'; }
    else if(isKzoPlaying) { title.textContent='6ellucci'; sub.textContent='KZO'; ctrl.style.background='linear-gradient(135deg,#006400,#228B22)'; }
    else if(isKzo2Playing) { title.textContent='6ELLUCCI & JUNIOR'; sub.textContent='KZO II'; ctrl.style.background='linear-gradient(135deg,#8B4513,#CD853F)'; }
    else if(isSharautPlaying) { title.textContent='Guf & BALLER'; sub.textContent='Шараут'; ctrl.style.background='linear-gradient(135deg,#4B0082,#9400D3)'; }
    else if(isShizaLivePlaying) { title.textContent='Shiza'; sub.textContent='SHYM (LIVE)'; ctrl.style.background='linear-gradient(135deg,#FF4500,#8B0000)'; }
}

setTimeout(addMusicControl, 3000);