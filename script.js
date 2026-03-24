'use strict';

// Глобалды айнымалылар
let cachedWeather = null;
let lastWeatherFetch = 0;
const WEATHER_FETCH_INTERVAL = 5 * 60 * 1000; // 5 минут

// Пайдаланушылар тізімі (localStorage-де сақталады)
let usersResults = JSON.parse(localStorage.getItem('quizUsers')) || [];

// Қауіпсіздік үшін қосымша айнымалылар
let loginAttempts = 0;
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 минут
let lockoutUntil = null;

// Пароль (хэштелген түрде сақталады)
const CORRECT_PASSWORD_HASH = btoa('7700'); // Base64 шифрлау

// ==================== БЕТ ӘЛПЕТІМЕН КІРУ МОДУЛІ ====================
let faceRecognitionEnabled = false;
let videoStream = null;
let faceAuthAttempts = 0;
let isFaceAuthActive = false;
let faceDescriptors = JSON.parse(localStorage.getItem('faceDescriptors')) || {};
let faceModelLoaded = false;
let currentFaceVideo = null;

// Face API кітапханаларын жүктеу
function loadFaceAPILibraries() {
    return new Promise((resolve, reject) => {
        if (typeof faceapi !== 'undefined') {
            resolve();
            return;
        }
        
        const tfScript = document.createElement('script');
        tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.11.0/dist/tf.min.js';
        tfScript.onload = () => {
            const faceScript = document.createElement('script');
            faceScript.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
            faceScript.onload = resolve;
            faceScript.onerror = reject;
            document.head.appendChild(faceScript);
        };
        tfScript.onerror = reject;
        document.head.appendChild(tfScript);
    });
}

// Face API модельдерін жүктеу
async function initFaceRecognition() {
    try {
        if (faceModelLoaded) return true;
        
        showToast('📷 Бет тану жүктелуде...');
        
        await loadFaceAPILibraries();
        
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        
        faceModelLoaded = true;
        faceRecognitionEnabled = true;
        showToast('✅ Бет тану модулі дайын');
        
        return true;
    } catch (error) {
        console.error('Face API жүктеу қатесі:', error);
        showToast('⚠️ Бет тану модулі қолжетімсіз');
        faceRecognitionEnabled = false;
        return false;
    }
}

// Веб-камераны ашу
async function startFaceCamera() {
    try {
        if (videoStream) stopFaceCamera();
        
        videoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } 
        });
        
        let videoElement = document.getElementById('face-video');
        if (!videoElement) {
            videoElement = document.createElement('video');
            videoElement.id = 'face-video';
            videoElement.autoplay = true;
            videoElement.playsInline = true;
            videoElement.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 400px;
                height: 300px;
                border-radius: 20px;
                border: 3px solid #4CAF50;
                z-index: 10001;
                box-shadow: 0 0 30px rgba(0,0,0,0.5);
                object-fit: cover;
                background: #000;
            `;
            document.body.appendChild(videoElement);
        }
        
        videoElement.srcObject = videoStream;
        await videoElement.play();
        currentFaceVideo = videoElement;
        return videoElement;
    } catch (error) {
        console.error('Камераны ашу қатесі:', error);
        showToast('❌ Камераға рұқсат берілмеді');
        return null;
    }
}

// Камераны жабу
function stopFaceCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    const videoElement = document.getElementById('face-video');
    if (videoElement) videoElement.remove();
    currentFaceVideo = null;
}

// Бетті тіркеу
async function registerFace() {
    if (!faceRecognitionEnabled) {
        const initialized = await initFaceRecognition();
        if (!initialized) {
            showToast('⚠️ Бет тану модулі жүктелмеді');
            return false;
        }
    }
    
    if (!currentUserName) {
        showToast('❌ Алдымен атыңызды енгізіңіз');
        return false;
    }
    
    showToast('📸 Бетіңізді камераға қаратыңыз...');
    
    const video = await startFaceCamera();
    if (!video) return false;
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks().withFaceDescriptor();
        
        if (detection) {
            const faceDescriptor = Array.from(detection.descriptor);
            faceDescriptors[currentUserName] = {
                descriptor: faceDescriptor,
                date: new Date().toLocaleString(),
                name: currentUserName
            };
            localStorage.setItem('faceDescriptors', JSON.stringify(faceDescriptors));
            showToast(`✅ ${currentUserName} бетіңіз сәтті тіркелді!`);
            stopFaceCamera();
            return true;
        } else {
            showToast('❌ Бет табылмады, қайталаңыз');
            stopFaceCamera();
            return false;
        }
    } catch (error) {
        console.error('Бет тіркеу қатесі:', error);
        showToast('❌ Бет тіркеу сәтсіз аяқталды');
        stopFaceCamera();
        return false;
    }
}

// Бет арқылы аутентификация
async function authenticateWithFace() {
    if (!faceRecognitionEnabled) {
        const initialized = await initFaceRecognition();
        if (!initialized) {
            showToast('⚠️ Бет тану модулі қолжетімсіз');
            return false;
        }
    }
    
    if (isFaceAuthActive) {
        showToast('⏳ Бет тану жүріп жатыр...');
        return false;
    }
    
    if (faceAuthAttempts >= 3) {
        showToast(`🔒 3 рет қате! 5 минут күтіңіз`);
        setTimeout(() => { faceAuthAttempts = 0; }, 5 * 60 * 1000);
        return false;
    }
    
    if (Object.keys(faceDescriptors).length === 0) {
        showToast('📝 Әуелі бетіңізді тіркеңіз');
        return false;
    }
    
    isFaceAuthActive = true;
    showToast('📷 Бетіңізді камераға қаратыңыз...');
    
    const video = await startFaceCamera();
    if (!video) { isFaceAuthActive = false; return false; }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks().withFaceDescriptor();
        
        if (!detection) {
            showToast('❌ Бет табылмады');
            faceAuthAttempts++;
            stopFaceCamera();
            isFaceAuthActive = false;
            return false;
        }
        
        const currentDescriptor = detection.descriptor;
        let bestMatch = null;
        let bestDistance = 0.6;
        
        for (const [userName, userData] of Object.entries(faceDescriptors)) {
            const savedDescriptor = new Float32Array(userData.descriptor);
            const distance = faceapi.euclideanDistance(currentDescriptor, savedDescriptor);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = userName;
            }
        }
        
        if (bestMatch) {
            showToast(`✅ Сәлем, ${bestMatch}! Аутентификация сәтті өтті`);
            currentUserName = bestMatch;
            setTimeout(() => { startTest(); }, 1000);
            faceAuthAttempts = 0;
            stopFaceCamera();
            isFaceAuthActive = false;
            return true;
        } else {
            showToast('❌ Бет сәйкестендірілмеді');
            faceAuthAttempts++;
            stopFaceCamera();
            isFaceAuthActive = false;
            return false;
        }
    } catch (error) {
        console.error('Face auth қатесі:', error);
        showToast('❌ Аутентификация қатесі');
        faceAuthAttempts++;
        stopFaceCamera();
        isFaceAuthActive = false;
        return false;
    }
}

// Тіркелген беттерді көрсету
function showRegisteredFaces() {
    const faceList = Object.keys(faceDescriptors);
    if (faceList.length === 0) {
        showToast('📝 Тіркелген бет жоқ');
        return;
    }
    let message = '📋 Тіркелген беттер:\n\n';
    faceList.forEach((name, index) => {
        message += `${index + 1}. ${name}\n   📅 ${faceDescriptors[name].date}\n\n`;
    });
    alert(message);
}

// Бетті жою
function deleteFace() {
    if (!currentUserName) {
        showToast('❌ Атыңызды енгізіңіз');
        return;
    }
    if (faceDescriptors[currentUserName]) {
        delete faceDescriptors[currentUserName];
        localStorage.setItem('faceDescriptors', JSON.stringify(faceDescriptors));
        showToast(`✅ ${currentUserName} беті жойылды`);
    } else {
        showToast(`❌ ${currentUserName} беті табылмады`);
    }
}

// Бет тану интерфейсін қосу
function addFaceAuthUI() {
    const existingUI = document.getElementById('face-auth-ui');
    if (existingUI) return;
    
    const pwPage = document.getElementById('page-pw');
    if (!pwPage) return;
    
    const faceAuthDiv = document.createElement('div');
    faceAuthDiv.id = 'face-auth-ui';
    faceAuthDiv.style.cssText = `margin-top: 25px; text-align: center; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px;`;
    
    faceAuthDiv.innerHTML = `
        <div style="margin-bottom: 15px; font-size: 14px; color: rgba(255,255,255,0.8);">🎭 НЕМЕСЕ БЕТПЕН КІРУ</div>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button id="face-auth-btn" style="background: linear-gradient(135deg, #667eea, #764ba2); border: none; color: white; padding: 10px 20px; border-radius: 50px; cursor: pointer; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                <span>😀</span> Бетпен кіру
            </button>
            <button id="face-register-btn" style="background: linear-gradient(135deg, #f39c12, #e67e22); border: none; color: white; padding: 10px 20px; border-radius: 50px; cursor: pointer; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                <span>📸</span> Бет тіркеу
            </button>
            <button id="face-list-btn" style="background: linear-gradient(135deg, #3498db, #2980b9); border: none; color: white; padding: 10px 20px; border-radius: 50px; cursor: pointer; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                <span>📋</span> Тізім
            </button>
            <button id="face-delete-btn" style="background: linear-gradient(135deg, #e74c3c, #c0392b); border: none; color: white; padding: 10px 20px; border-radius: 50px; cursor: pointer; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                <span>🗑️</span> Бетті жою
            </button>
        </div>
        <div id="face-status" style="margin-top: 12px; font-size: 11px; color: rgba(255,255,255,0.6);">
            💡 Бетпен кіру үшін алдымен бетіңізді тіркеңіз
        </div>
    `;
    
    const pwContainer = pwPage.querySelector('.glass-card') || pwPage;
    pwContainer.appendChild(faceAuthDiv);
    
    setTimeout(() => {
        const authBtn = document.getElementById('face-auth-btn');
        const registerBtn = document.getElementById('face-register-btn');
        const listBtn = document.getElementById('face-list-btn');
        const deleteBtn = document.getElementById('face-delete-btn');
        if (authBtn) authBtn.addEventListener('click', authenticateWithFace);
        if (registerBtn) registerBtn.addEventListener('click', registerFace);
        if (listBtn) listBtn.addEventListener('click', showRegisteredFaces);
        if (deleteBtn) deleteBtn.addEventListener('click', deleteFace);
    }, 100);
}

// Бет тануды инициализациялау
async function initFaceAuth() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.log('Веб-камера қолжетімсіз');
            return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        
        setTimeout(() => { initFaceRecognition(); }, 3000);
        setTimeout(() => { addFaceAuthUI(); }, 1000);
    } catch (error) {
        console.log('Камера рұқсаты жоқ');
    }
}
// ==================== БЕТ ӘЛПЕТІМЕН КІРУ МОДУЛІ АЯҚТАЛДЫ ====================

// Қызылорда ауа райын алу функциясы (кэшпен)
async function getKyzylordaWeather() {
  const now = Date.now();
  
  if (cachedWeather && (now - lastWeatherFetch < WEATHER_FETCH_INTERVAL)) {
    console.log('Ауа райы кэштен алынды');
    return cachedWeather;
  }
  
  try {
    const API_KEY = '4c249f5920cb4d78b1d183152261403';
    
    const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=Kyzylorda&lang=kk&aqi=no`);
    
    if (!response.ok) {
      console.log('API жауап коды:', response.status);
      throw new Error('Ауа райын алу мүмкін болмады');
    }
    
    const data = await response.json();
    console.log('Ауа райы деректері жаңартылды:', data);
    
    cachedWeather = {
      temp: Math.round(data.current.temp_c),
      condition: data.current.condition.text,
      icon: data.current.condition.icon,
      wind: data.current.wind_kph,
      feelslike: Math.round(data.current.feelslike_c),
      humidity: data.current.humidity,
      city: 'Қызылорда',
      localtime: data.location.localtime.split(' ')[1]
    };
    
    lastWeatherFetch = now;
    return cachedWeather;
  } catch (error) {
    console.log('Ауа райын алу мүмкін болмады:', error);
    return cachedWeather;
  }
}

// Уақытқа байланысты қолжетімділік және хабарламалар
function getTimeInfo() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  let greeting = '';
  let icon = '';
  let isAccessAllowed = true;
  let isNight = false;
  
  if (hours >= 22 || hours < 7) {
    isAccessAllowed = false;
    isNight = true;
  }
  
  if (hours >= 7 && hours < 12) {
    greeting = 'Қайырлы таң!';
    icon = '🌅';
  } else if (hours >= 12 && hours < 18) {
    greeting = 'Қайырлы күн!';
    icon = '☀️';
  } else if (hours >= 18 && hours < 22) {
    greeting = 'Қайырлы кеш!';
    icon = '🌆';
  } else {
    greeting = 'Қайырлы түн!';
    icon = '🌙';
  }
  
  return { greeting, icon, isAccessAllowed, hours, currentTime, isNight };
}

// Уақыт баннерін қосу
async function addTimeBanner() {
  const oldBanner = document.getElementById('time-banner');
  if (oldBanner) return;
  
  const { greeting, icon, currentTime, isNight } = getTimeInfo();
  
  let weather = null;
  if (isNight) {
    weather = await getKyzylordaWeather();
  }
  
  const banner = document.createElement('div');
  banner.id = 'time-banner';
  
  let weatherHtml = '';
  if (isNight && weather) {
    weatherHtml = `
      <div style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.15); padding: 5px 12px; border-radius: 50px;">
        <span style="font-weight: 600;">🌙 Түнгі ауа райы</span>
        <span>Қызылорда</span>
        <img src="https:${weather.icon}" alt="icon" style="width: 24px; height: 24px;">
        <span style="font-weight: 700;">${weather.temp > 0 ? '+' : ''}${weather.temp}°C</span>
        <span style="opacity: 0.9;">${weather.condition}</span>
        <span>🌡️ ${weather.feelslike > 0 ? '+' : ''}${weather.feelslike}°C</span>
        <span>💧 ${weather.humidity}%</span>
        <span>🌬️ ${weather.wind} км/сағ</span>
      </div>
    `;
  } else if (isNight && !weather) {
    weatherHtml = `
      <div style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.15); padding: 5px 12px; border-radius: 50px;">
        <span style="font-weight: 600;">🌙 Қызылорда</span>
        <span>Ауа райы жүктелуде...</span>
      </div>
    `;
  } else if (!isNight) {
    weatherHtml = `
      <div style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.15); padding: 5px 15px; border-radius: 50px;">
        <span style="font-weight: 600;">☀️ Қызылорда ауа райы</span>
        <a href="https://yandex.ru/pogoda/kk/kyzylorda" target="_blank" style="color: white; text-decoration: none; background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 30px; font-weight: 600;">
          Көру →
        </a>
      </div>
    `;
  }
  
  banner.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; padding: 0 20px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 20px;">${icon}</span>
        <span>${greeting}</span>
        <span style="opacity: 0.8; font-family: monospace;" id="time-banner-display">${currentTime}</span>
      </div>
      <div id="weather-banner-content">${weatherHtml}</div>
    </div>
  `;
  
  banner.style.cssText = `
    background: linear-gradient(135deg, #1e3c72, #2a5298);
    color: white;
    padding: 12px 0;
    font-size: 14px;
    font-weight: 500;
    position: sticky;
    top: 0;
    z-index: 9999;
    width: 100%;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    border-bottom: 1px solid rgba(255,255,255,0.2);
    font-family: 'Nunito', sans-serif;
  `;
  
  if (document.body.firstChild) {
    document.body.insertBefore(banner, document.body.firstChild);
  } else {
    document.body.appendChild(banner);
  }
  
  console.log('Баннер қосылды, түн бе?', isNight, 'Уақыт:', currentTime);
}

function updateTimeInBanner() {
  const timeSpan = document.getElementById('time-banner-display');
  if (!timeSpan) return;
  
  const { currentTime } = getTimeInfo();
  timeSpan.textContent = currentTime;
}

async function updateWeatherInBanner() {
  const weatherDiv = document.getElementById('weather-banner-content');
  if (!weatherDiv) return;
  
  const { isNight } = getTimeInfo();
  
  if (!isNight) {
    weatherDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.15); padding: 5px 15px; border-radius: 50px;">
        <span style="font-weight: 600;">☀️ Қызылорда ауа райы</span>
        <a href="https://yandex.ru/pogoda/kk/kyzylorda" target="_blank" style="color: white; text-decoration: none; background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 30px; font-weight: 600;">
          Көру →
        </a>
      </div>
    `;
    return;
  }
  
  const weather = await getKyzylordaWeather();
  if (weather) {
    weatherDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.15); padding: 5px 12px; border-radius: 50px;">
        <span style="font-weight: 600;">🌙 Түнгі ауа райы</span>
        <span>Қызылорда</span>
        <img src="https:${weather.icon}" alt="icon" style="width: 24px; height: 24px;">
        <span style="font-weight: 700;">${weather.temp > 0 ? '+' : ''}${weather.temp}°C</span>
        <span style="opacity: 0.9;">${weather.condition}</span>
        <span>🌡️ ${weather.feelslike > 0 ? '+' : ''}${weather.feelslike}°C</span>
        <span>💧 ${weather.humidity}%</span>
        <span>🌬️ ${weather.wind} км/сағ</span>
      </div>
    `;
  } else {
    weatherDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.15); padding: 5px 12px; border-radius: 50px;">
        <span style="font-weight: 600;">🌙 Қызылорда</span>
        <span>Ауа райы жүктелуде...</span>
      </div>
    `;
  }
}

function startRealTimeClock() {
  addTimeBanner().then(() => {
    setInterval(updateTimeInBanner, 1000);
    setInterval(() => {
      updateWeatherInBanner();
    }, WEATHER_FETCH_INTERVAL);
  });
}

async function checkAccess() {
  const { isAccessAllowed, greeting, icon, currentTime, isNight } = getTimeInfo();
  
  let weather = null;
  if (isNight) {
    weather = await getKyzylordaWeather();
  }
  
  if (!isAccessAllowed) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    let accessDeniedPage = document.getElementById('page-access-denied');
    if (!accessDeniedPage) {
      accessDeniedPage = document.createElement('div');
      accessDeniedPage.id = 'page-access-denied';
      accessDeniedPage.className = 'page active';
      accessDeniedPage.style.cssText = `
        display: flex !important;
        min-height: 100vh;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #0b1a2e, #1a2f3f);
        padding: 20px;
        font-family: 'Nunito', sans-serif;
      `;
      
      const duaHtml = `
        <div style="
          margin-bottom: 30px;
          padding: 20px;
          background: rgba(0,0,0,0.3);
          border-radius: 20px;
          border: 1px solid rgba(255,215,0,0.3);
          box-shadow: 0 0 30px rgba(255,215,0,0.2);
        ">
          <h2 style="
            font-size: 36px;
            font-weight: 800;
            color: #FFD700;
            text-shadow: 0 0 10px #FFA500, 0 0 20px #FF8C00;
            margin-bottom: 20px;
            letter-spacing: 2px;
          ">✨ ҚАДІР ТҮНІ ✨</h2>
          
          <div style="margin: 25px 0;">
            <div style="font-size: 28px; color: #FFD700; margin-bottom: 5px; text-shadow: 0 0 8px gold;">اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ العَفْوَ فَاعْفُ عَنِّي</div>
            <div style="font-size: 18px; color: #F4A460; margin-bottom: 3px;">Аллаһуммә иннәкә афууун тухиббул-афуа фағфу анни.</div>
            <div style="font-size: 16px; color: #DAA520; font-style: italic;">Уа, Алла! Сен өте кешірімдісің, кешіруді жақсы көресің. Мені кешіре гөр.</div>
          </div>
          
          <div style="margin: 25px 0;">
            <div style="font-size: 28px; color: #FFD700; margin-bottom: 5px; text-shadow: 0 0 8px gold;">أَسْتَغْفِرُ اللّٰهَ وَأَتُوبُ إِلَيْهِ</div>
            <div style="font-size: 18px; color: #F4A460; margin-bottom: 3px;">Астағфируллаһ уа әтубу иләйһ</div>
            <div style="font-size: 16px; color: #DAA520; font-style: italic;">Алладан кешірім сұраймын және Оған тәубе етемін.</div>
          </div>
        </div>
      `;
      
      let weatherDisplay = '';
      if (isNight && weather) {
        weatherDisplay = `
          <div style="
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.2);
          ">
            <div style="font-size: 20px; margin-bottom: 15px; font-weight: 600;">🌙 Түнгі ауа райы - Қызылорда</div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
              <img src="https:${weather.icon}" alt="${weather.condition}" style="width: 64px; height: 64px;">
              <div style="font-size: 36px; font-weight: 700;">${weather.temp > 0 ? '+' : ''}${weather.temp}°C</div>
              <div style="font-size: 18px; background: rgba(255,255,255,0.15); padding: 8px 20px; border-radius: 50px;">${weather.condition}</div>
            </div>
            <div style="display: flex; justify-content: center; gap: 25px; margin-top: 20px; flex-wrap: wrap;">
              <div>🌡️ Сезіледі: ${weather.feelslike > 0 ? '+' : ''}${weather.feelslike}°C</div>
              <div>💧 Ылғалдылық: ${weather.humidity}%</div>
              <div>🌬️ Жел: ${weather.wind} км/сағ</div>
            </div>
          </div>
        `;
      } else if (!isNight) {
        weatherDisplay = `
          <div style="
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.2);
          ">
            <div style="font-size: 20px; margin-bottom: 15px; font-weight: 600;">☀️ Қызылорда ауа райы</div>
            <div style="display: flex; justify-content: center;">
              <a href="https://yandex.ru/pogoda/kk/kyzylorda" target="_blank" style="
                background: rgba(255,255,255,0.2);
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 50px;
                font-size: 18px;
                font-weight: 600;
                border: 1px solid rgba(255,255,255,0.3);
              ">
                Яндекс Погодада көру →
              </a>
            </div>
          </div>
        `;
      }
      
      accessDeniedPage.innerHTML = `
        <div style="
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 30px;
          padding: 40px;
          max-width: 650px;
          width: 100%;
          text-align: center;
          color: white;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        ">
          <div style="font-size: 80px; margin-bottom: 20px;">${icon}</div>
          <h1 style="font-size: 32px; margin-bottom: 15px;">Қолжетімділік шектелген</h1>
          <p style="font-size: 16px; margin-bottom: 20px; opacity: 0.9;">Сайт таңғы 7:00-ден кешкі 22:00-ге дейін жұмыс істейді</p>
          
          <div style="
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 15px;
            margin-bottom: 20px;
            font-size: 20px;
          " id="access-time-display">
            ${icon} ${greeting} Қазір ${currentTime}
          </div>
          
          ${duaHtml}
          
          ${weatherDisplay}
          
          <div style="
            background: rgba(0,0,0,0.3);
            border-radius: 15px;
            padding: 20px;
            margin-top: 20px;
          ">
            <div style="display: flex; align-items: center; gap: 15px; padding: 10px; background: rgba(46,204,113,0.15); border-radius: 10px; margin-bottom: 10px;">
              <span style="font-size: 24px;">✅</span>
              <div style="text-align: left;">
                <div style="font-weight: 600;">Қолжетімді</div>
                <div style="opacity: 0.8;">07:00 - 22:00</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px; padding: 10px; background: rgba(231,76,60,0.15); border-radius: 10px;">
              <span style="font-size: 24px;">❌</span>
              <div style="text-align: left;">
                <div style="font-weight: 600;">Қолжетімсіз</div>
                <div style="opacity: 0.8;">22:00 - 07:00</div>
              </div>
            </div>
          </div>
          
          <p style="font-size: 18px; margin-top: 25px; opacity: 0.8;">Қайта келіңіз! ${icon}</p>
        </div>
      `;
      
      document.body.appendChild(accessDeniedPage);
    } else {
      const timeDiv = document.getElementById('access-time-display');
      if (timeDiv) {
        timeDiv.innerHTML = `${icon} ${greeting} Қазір ${currentTime}`;
      }
      
      const weatherDiv = accessDeniedPage.querySelector('div[style*="border-radius: 20px; padding: 25px;"]');
      if (weatherDiv && isNight && weather) {
        weatherDiv.innerHTML = `
          <div style="font-size: 20px; margin-bottom: 15px; font-weight: 600;">🌙 Түнгі ауа райы - Қызылорда</div>
          <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
            <img src="https:${weather.icon}" alt="${weather.condition}" style="width: 64px; height: 64px;">
            <div style="font-size: 36px; font-weight: 700;">${weather.temp > 0 ? '+' : ''}${weather.temp}°C</div>
            <div style="font-size: 18px; background: rgba(255,255,255,0.15); padding: 8px 20px; border-radius: 50px;">${weather.condition}</div>
          </div>
          <div style="display: flex; justify-content: center; gap: 25px; margin-top: 20px; flex-wrap: wrap;">
            <div>🌡️ Сезіледі: ${weather.feelslike > 0 ? '+' : ''}${weather.feelslike}°C</div>
            <div>💧 Ылғалдылық: ${weather.humidity}%</div>
            <div>🌬️ Жел: ${weather.wind} км/сағ</div>
          </div>
        `;
      }
    }
    return false;
  }
  return true;
}

function startTimeChecker() {
  setTimeout(() => {
    checkAccess();
  }, 1000);
  
  setInterval(async () => {
    await checkAccess();
  }, 1000);
  
  return true;
}

// ==================== JAVA СҰРАҚТАРЫ ====================
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
  {question:"/ * ... * / қандай комментарий?", options:["Бір жолдық","Көп жолдық","HTML","Қате","Бос"], correct:1},
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
  {question:"Java-да Scanner қай үшін?", options:["Графика","Дерекқор","Кіру (input)","Сурет салу","Сервер"], correct:2},
  {question:"Scanner импорт жолы", options:["import java.scan.*;","import util.Scanner;","import java.util.Scanner;","import Scanner.java;","include Scanner"], correct:2},
  {question:"nextInt() не істейді?", options:["Сөзді оқиды","Символ оқиды","Бүтін сан оқиды","Нақты сан оқиды","Жолды оқиды"], correct:2},
  {question:"String қандай тип?", options:["Примитив","Класс","Массив","Интерфейс","Символ"], correct:1},
  {question:"String ұзындығын табу", options:["size","count()","length()","len","size()"], correct:2},
  {question:"equals() не үшін?", options:["Қосу","Ұзындығын табу","Жолдарды салыстыру","Баспа","Массивке қосу"], correct:2},
  {question:"== String-ге қолданғанда не істейді?", options:["Мәтінді салыстыру","Сілтемені салыстыру","Ұзындығын табу","ASCII береді","Кодын шығарады"], correct:1},
  {question:"switch не істейді?", options:["Цикл","Конкатенация","Таңдау операторы","Класс","Пакет"], correct:2},
  {question:"Case қайда қолданылады?", options:["for","if","else","switch","try"], correct:3},
  {question:"default қайда қолданылады?", options:["for","if","else","switch","try"], correct:3},
  {question:"массив қалай жарияланады?", options:["arr int[]","int arr()","int[] arr;","int arr;","array arr[]"], correct:2},
  {question:"Массив индексі қайдан басталады?", options:["-1","0","1","2","10"], correct:1},
  {question:"Строка типі", options:["char","int","text","String","word"], correct:3},
  {question:"String қай пакетте?", options:["java.sql","java.io","java.lang","java.net","java.util"], correct:2},
  {question:"equals() не істейді?", options:["Салыстырады (==)","Мәтінді салыстырады","Қосу","Ұзындық","Массивке айналдыру"], correct:1},
  {question:"length() не үшін?", options:["Салыстыру","Енгізу","Ұзындық алу","Массив құру","Класс шақыру"], correct:2},
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
  {question:"Оверрайд (Override) дегеніміз?", options:["Қайталану","Әдісті қайта анықтау","Жою","Жаңа класс","Массив"], correct:1},
  {question:"Оверлоад (Overload)?", options:["Екі класс жасау","Бір атпен бірнеше метод (параметрлері өзгеше)","Массив қосу","HashMap","Кілт жасау"], correct:1},
  {question:"Interface дегеніміз?", options:["Класс","Массив","Абстракт әдістер жиыны","Пакет","Цикл"], correct:2},
  {question:"Интерфейсте әдіс қандай?", options:["Private","Protected","Абстракт (default public abstract)","Static","Final"], correct:2},
  {question:"Абстракт класс дегеніміз?", options:["Тек интерфейс","Іші толық емес класс","Массив","Пакет","Қате"], correct:1},
  {question:"abstract кілт сөзі", options:["Цикл","Абстракт әдіс немесе класс","Массив","HashMap","Size"], correct:1},
  {question:"final класс", options:["Мұрагер ала алады","Мұрагер бола алмайды","Абстракт","Интерфейс","HashMap"], correct:1},
  {question:"final әдіс", options:["Қайта анықталады","Қайта анықталмайды","Пакет ашады","Массив құрады","Қате"], correct:1},
  {question:"static әдіс", options:["Объектпен шақырылады","Объектісіз шақырылады","Финал","Абстракт","Қате"], correct:1},
  {question:"System.out не?", options:["Класс","Массив","Объект (PrintStream)","Интерфейс","Пакет"], correct:2},
  {question:"Scanner қай пакетте?", options:["java.sql","java.io","java.util","java.net","java.math"], correct:2},
  {question:"Scanner nextInt() не істейді?", options:["Строка алады","Double алады","Бүтін сан оқиды","Массив","String береді"], correct:2},
  {question:"nextLine()", options:["Сан алады","Жолды толық оқиды","Қате","Boolean","Char"], correct:1},
  {question:"Java-дағы \"+\" оператор String-те?", options:["Қосу","Конкатенация (жабыстыру)","Бөлу","Азайту","Модуль"], correct:1},
  {question:"return не істейді?", options:["Цикл","Методты аяқтап мән қайтарады","Файл ашады","Массив","Пакет"], correct:1},
  {question:"void дегеніміз?", options:["Сандар","String","Мән қайтармайды","Файл","Пакет"], correct:2},
  {question:"try-catch не үшін?", options:["Цикл","Массив","Қатені өңдеу","Қосу","Өшіру"], correct:2},
  {question:"FileInputStream не істейді?", options:["Жазады","Файлдан байтпен оқиды","Массив құрады","Пакет","Қате"], correct:1},
  {question:"FileOutputStream", options:["Оқыту","Файлға байтпен жазу","Пакет","Массив","HashMap"], correct:1},
  {question:"BufferedReader не істейді?", options:["Жазады","Жолмен оқиды","Көбейту","Пакет","Цикл"], correct:1},
  {question:"Thread дегеніміз?", options:["Метод","Ағын (поток)","Пакет","Массив","Класс"], correct:1},
  {question:"Мультипоточность (multithreading)?", options:["Бір ағын","Бірнеше ағынды қатар іске қосу","Қате","Массив","Паттерн"], correct:1},
  {question:"run() қайда жазылады?", options:["Scanner","Thread ішінде","Array","HashMap","Object"], correct:1},
  {question:"synchronized не істейді?", options:["Массив","Пакет","Ағындарды синхрондау","Файл ашу","HashMap"], correct:2},
  {question:"enum дегеніміз?", options:["Массив","Тұрақты мәндер жиыны","Интерфейс","Пакет","Модуль"], correct:1},
  {question:"var кілт сөзі (Java 10)", options:["Класс","Типті автоматты анықтау","Массив","Интерфейс","Цикл"], correct:1},
  {question:"JavaFX не үшін?", options:["Сервер","Графикалық интерфейс құру","Массив","SQL","Қате"], correct:1}
];

let shuffled = [];
let curIdx = 0;
let score = 0;
let timerID = null;
let timeLeft = 1800;
let eyeTimer = null;
let isDark = false;
let isWarm = false;
let isLarge = false;
let toastT = null;
let answeredCount = 0;
let currentUserName = '';

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.add('hidden'), 2500);
}

function lockContent() {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showToast('🚫 Мәтінді көшіруге болмайды');
  });

  document.addEventListener('keydown', (e) => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && ['c','x','v','u','s','a'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      showToast('🚫 Мәтінді көшіруге болмайды');
      return false;
    }
    if (e.key === 'F12' || (ctrl && e.shiftKey && e.key.toLowerCase() === 'i')) {
      e.preventDefault();
      showToast('🔒 Құралдар бұғатталған');
      return false;
    }
  });

  ['copy', 'cut', 'paste'].forEach(ev => {
    document.addEventListener(ev, (e) => {
      e.preventDefault();
      showToast('🚫 Мәтінді көшіруге болмайды');
    });
  });
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
}

function showNameInput() {
  document.getElementById('name-err').classList.add('hidden');
  document.getElementById('name-input').value = '';
  showPage('page-name-input');
}

function saveUserNameAndStart() {
  const nameInput = document.getElementById('name-input');
  const name = nameInput.value.trim();
  
  if (name === '') {
    document.getElementById('name-err').classList.remove('hidden');
    nameInput.classList.add('shake');
    setTimeout(() => nameInput.classList.remove('shake'), 400);
    nameInput.focus();
    return;
  }
  
  currentUserName = name;
  
  const existingUser = usersResults.find(u => u.name === name);
  if (!existingUser) {
    usersResults.push({ name: name, score: 0, total: 0, date: new Date().toLocaleString() });
    localStorage.setItem('quizUsers', JSON.stringify(usersResults));
  }
  
  startTest();
}

// КҮШЕЙТІЛГЕН ПАРОЛЬ ТЕКСЕРУ (ПАРОЛЬ: 7700)
function checkPw() {
  const input = document.getElementById('pw-in');
  const value = input.value.trim();
  
  // Құлыптау уақытын тексеру
  const lockData = localStorage.getItem('loginLockout');
  if (lockData) {
    const lock = JSON.parse(lockData);
    if (Date.now() < lock.until) {
      const remainingMinutes = Math.ceil((lock.until - Date.now()) / 60000);
      showToast(`🔒 ${remainingMinutes} минут күтіңіз! Тым көп қате әрекет`);
      input.disabled = true;
      setTimeout(() => {
        input.disabled = false;
      }, lock.until - Date.now());
      return;
    } else {
      localStorage.removeItem('loginLockout');
      localStorage.removeItem('loginAttempts');
    }
  }
  
  // Қате әрекеттер санын алу
  let attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
  
  // Парольді тексеру (7700)
  if (value === '7700') {
    // Сәтті кіру
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('loginLockout');
    document.getElementById('pw-err').classList.add('hidden');
    showToast('✅ Құппия сөз дұрыс!');
    showNameInput();
    input.value = '';
    input.disabled = false;
  } else {
    // Қате пароль
    attempts++;
    localStorage.setItem('loginAttempts', attempts);
    
    if (attempts >= 3) {
      // 5 минутқа құлыптау
      const lockUntil = Date.now() + (5 * 60 * 1000);
      localStorage.setItem('loginLockout', JSON.stringify({ until: lockUntil, attempts: attempts }));
      showToast(`🔒 ${attempts} рет қате! 5 минутқа бұғатталды`);
      input.disabled = true;
      setTimeout(() => {
        input.disabled = false;
        localStorage.removeItem('loginLockout');
        localStorage.removeItem('loginAttempts');
      }, 5 * 60 * 1000);
    } else {
      showToast(`❌ Қате құппия сөз! ${3 - attempts} рет қалды`);
    }
    
    document.getElementById('pw-err').classList.remove('hidden');
    document.getElementById('pw-wrap').classList.add('shake');
    setTimeout(() => document.getElementById('pw-wrap').classList.remove('shake'), 400);
    input.value = '';
    input.focus();
  }
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
    if (document.getElementById('page-test').classList.contains('active')) {
      const eyeBanner = document.getElementById('eye-banner');
      if (eyeBanner) eyeBanner.classList.remove('hidden');
    }
  }, 20 * 60 * 1000);
}

function renderQuestion() {
  if (!shuffled.length || curIdx >= shuffled.length) return;
  
  const question = shuffled[curIdx];
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
  if (qText) qText.textContent = question.question;
  
  const progressPercent = (answeredCount / total) * 100;
  if (progBar) progBar.style.width = progressPercent + '%';
  
  const indices = shuffleArray([0, 1, 2, 3, 4]);
  const container = document.getElementById('q-opts');
  if (!container) return;
  container.innerHTML = '';
  
  indices.forEach((origIdx, pos) => {
    const btn = document.createElement('button');
    btn.className = 'opt';
    btn.dataset.orig = origIdx;
    btn.innerHTML = `<span class="opt-L">${letters[pos]}</span><span>${question.options[origIdx]}</span>`;
    btn.addEventListener('click', () => handleAnswer(btn, origIdx, question.correct));
    container.appendChild(btn);
  });
  
  const card = document.getElementById('q-card');
  if (card) {
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = '';
  }
}

function handleAnswer(btn, selectedIdx, correctIdx) {
  const allOptions = document.querySelectorAll('.opt');
  allOptions.forEach(opt => opt.classList.add('locked'));
  
  const isCorrect = selectedIdx === correctIdx;
  
  if (isCorrect) {
    btn.classList.add('correct');
    score++;
    const scoreLive = document.getElementById('score-live');
    if (scoreLive) scoreLive.textContent = `✅ ${score}`;
  } else {
    btn.classList.add('wrong');
    allOptions.forEach(opt => {
      if (parseInt(opt.dataset.orig) === correctIdx) {
        opt.classList.add('correct');
      }
    });
  }
  
  answeredCount++;
  
  setTimeout(() => {
    curIdx++;
    if (curIdx >= shuffled.length) {
      finishTest(false);
    } else {
      renderQuestion();
    }
  }, isCorrect ? 1100 : 1700);
}

function startTimer() {
  clearInterval(timerID);
  updateTimer();
  
  timerID = setInterval(() => {
    timeLeft--;
    updateTimer();
    
    if (timeLeft <= 0) {
      clearInterval(timerID);
      finishTest(true);
    }
  }, 1000);
}

function updateTimer() {
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');
  const timerEl = document.getElementById('timer');
  
  if (timerEl) {
    timerEl.textContent = `⏱ ${minutes}:${seconds}`;
    if (timeLeft <= 120) {
      timerEl.classList.add('danger');
    } else {
      timerEl.classList.remove('danger');
    }
  }
}

function saveResult(score, total) {
  if (!currentUserName) return;
  
  const userIndex = usersResults.findIndex(u => u.name === currentUserName);
  if (userIndex !== -1) {
    usersResults[userIndex] = { 
      name: currentUserName, 
      score: score, 
      total: total, 
      date: new Date().toLocaleString() 
    };
  } else {
    usersResults.push({ 
      name: currentUserName, 
      score: score, 
      total: total, 
      date: new Date().toLocaleString() 
    });
  }
  
  usersResults.sort((a, b) => b.score - a.score);
  localStorage.setItem('quizUsers', JSON.stringify(usersResults));
}

function showLeaderboard() {
  const leaderboardList = document.getElementById('leaderboard-list');
  if (!leaderboardList) return;
  leaderboardList.innerHTML = '';
  
  if (usersResults.length === 0) {
    leaderboardList.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Әлі ешкім тест тапсырған жоқ</div>';
  } else {
    usersResults.forEach((user, index) => {
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 15px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        background: ${index === 0 ? 'rgba(255,215,0,0.1)' : 'transparent'};
      `;
      
      let medal = '';
      if (index === 0) medal = '🥇';
      else if (index === 1) medal = '🥈';
      else if (index === 2) medal = '🥉';
      else medal = `${index + 1}.`;
      
      const percentage = user.total > 0 ? Math.round((user.score / user.total) * 100) : 0;
      
      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-weight: 700; width: 30px;">${medal}</span>
          <span style="font-weight: 600;">${escapeHtml(user.name)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 15px;">
          <span style="background: ${percentage >= 70 ? '#2ecc71' : '#e74c3c'}; padding: 3px 10px; border-radius: 20px; font-size: 12px;">
            ${percentage}%
          </span>
          <span style="font-weight: 700;">${user.score}/${user.total}</span>
          <span style="font-size: 11px; opacity: 0.7;">${user.date || ''}</span>
        </div>
      `;
      
      leaderboardList.appendChild(row);
    });
  }
  
  showPage('page-leaderboard');
}

// XSS қорғанысы үшін
function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function finishTest(timeout) {
  clearInterval(timerID);
  clearTimeout(eyeTimer);
  
  const total = shuffled.length;
  const wrong = total - score;
  const percentage = Math.round((score / total) * 100);
  
  saveResult(score, total);
  
  const rsC = document.getElementById('rs-c');
  const rsW = document.getElementById('rs-w');
  const rsT = document.getElementById('rs-t');
  const resBig = document.getElementById('res-big');
  const resPct = document.getElementById('res-pct');
  const resTitle = document.getElementById('res-title');
  const resEmoji = document.getElementById('res-emoji');
  const resProg = document.getElementById('res-prog');
  
  if (rsC) rsC.textContent = score;
  if (rsW) rsW.textContent = wrong;
  if (rsT) rsT.textContent = total;
  if (resBig) resBig.textContent = `${score} / ${total}`;
  if (resPct) resPct.textContent = `${percentage}%`;
  if (resTitle) resTitle.textContent = timeout ? 'Уақыт бітті!' : getResultTitle(percentage);
  if (resEmoji) resEmoji.textContent = getResultEmoji(percentage, timeout);
  
  showPage('page-result');
  
  setTimeout(() => {
    if (resProg) resProg.style.width = percentage + '%';
  }, 100);
}

function getResultTitle(percentage) {
  if (percentage >= 90) return 'Тамаша нәтиже! 🎉';
  if (percentage >= 70) return 'Жақсы нәтиже!';
  if (percentage >= 50) return 'Орташа нәтиже';
  return 'Қайта оқып, тапсырыңыз';
}

function getResultEmoji(percentage, timeout) {
  if (timeout) return '⏰';
  if (percentage >= 90) return '🏆';
  if (percentage >= 70) return '🎯';
  if (percentage >= 50) return '📚';
  return '💪';
}

function retakeTest() { 
  showNameInput(); 
}

function goHome() { 
  clearInterval(timerID); 
  clearTimeout(eyeTimer); 
  showPage('page-home'); 
}

function toggleDark() {
  isDark = !isDark;
  if (isDark) {
    isWarm = false;
    document.body.classList.remove('warm');
    setButtonState('btn-warm', false);
  }
  document.body.classList.toggle('dark', isDark);
  setButtonState('btn-dark', isDark);
}

function toggleWarm() {
  isWarm = !isWarm;
  if (isWarm) {
    isDark = false;
    document.body.classList.remove('dark');
    setButtonState('btn-dark', false);
  }
  document.body.classList.toggle('warm', isWarm);
  setButtonState('btn-warm', isWarm);
}

function toggleFont() {
  isLarge = !isLarge;
  document.body.classList.toggle('large', isLarge);
  setButtonState('btn-font', isLarge);
}

function setButtonState(id, state) {
  const btn = document.getElementById(id);
  if (btn) btn.classList.toggle('on', state);
}

document.addEventListener('DOMContentLoaded', function() {
  addTimeBanner();
  setInterval(updateTimeInBanner, 1000);
  setInterval(() => {
    updateWeatherInBanner();
  }, WEATHER_FETCH_INTERVAL);
  
  setTimeout(() => {
    checkAccess();
  }, 1000);
  
  setInterval(async () => {
    await checkAccess();
  }, 1000);
  
  const pwInput = document.getElementById('pw-in');
  if (pwInput) {
    pwInput.addEventListener('input', () => {
      document.getElementById('pw-err').classList.add('hidden');
    });
    
    pwInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkPw();
    });
  }
  
  const nameInput = document.getElementById('name-input');
  if (nameInput) {
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveUserNameAndStart();
    });
  }
  
  lockContent();
  
  // Бет тануды инициализациялау
  setTimeout(() => {
    initFaceAuth();
  }, 5000);
});

window.checkPw = checkPw;
window.saveUserNameAndStart = saveUserNameAndStart;
window.showLeaderboard = showLeaderboard;
window.toggleDark = toggleDark;
window.toggleWarm = toggleWarm;
window.toggleFont = toggleFont;
window.retakeTest = retakeTest;
window.goHome = goHome;
window.registerFace = registerFace;
window.authenticateWithFace = authenticateWithFace;
window.showRegisteredFaces = showRegisteredFaces;
window.deleteFace = deleteFace;

// ============ МУЗЫКА (YouTube API) ============
let kairatPlayer = null;
let densPlayer = null;
let shizaPlayer = null;
let shizaLivePlayer = null;
let kzoPlayer = null;
let kzo2Player = null;
let sharautPlayer = null;
let isKairatPlaying = false;
let isDensPlaying = false;
let isShizaPlaying = false;
let isShizaLivePlaying = false;
let isKzoPlaying = false;
let isKzo2Playing = false;
let isSharautPlaying = false;

let currentPlaylist = [
    'XYIYpFZ59wU',
    'uZy0-fQOBj8',
    '5KDZD86MWYU',
    'XwImCmmEDgA',
    'AH9zEI9Hx-0',
    'FNKFpuoM1OY',
    'cSxNzTebJyY'
];
let currentTrackIndex = 0;
let playlistInterval = null;

function loadMusicYouTubeAPI() {
  if (document.getElementById('music-youtube-api')) return;
  
  const tag = document.createElement('script');
  tag.id = 'music-youtube-api';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.body.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function() {
  if (!shizaPlayer) {
    shizaPlayer = new YT.Player('shiza-youtube-player', {
      height: '0', width: '0', videoId: currentPlaylist[0],
      playerVars: { 'autoplay': 0, 'controls': 0, 'disablekb': 1, 'enablejsapi': 1, 'fs': 0, 'loop': 0 },
      events: { 'onStateChange': onPlayerStateChange }
    });
  }
  if (!kairatPlayer) {
    kairatPlayer = new YT.Player('kairat-youtube-player', {
      height: '0', width: '0', videoId: currentPlaylist[1],
      playerVars: { 'autoplay': 0, 'controls': 0, 'disablekb': 1, 'enablejsapi': 1, 'fs': 0, 'loop': 0 },
      events: { 'onStateChange': onPlayerStateChange }
    });
  }
  if (!densPlayer) {
    densPlayer = new YT.Player('dens-youtube-player', {
      height: '0', width: '0', videoId: currentPlaylist[2],
      playerVars: { 'autoplay': 0, 'controls': 0, 'disablekb': 1, 'enablejsapi': 1, 'fs': 0, 'loop': 0 },
      events: { 'onStateChange': onPlayerStateChange }
    });
  }
  if (!kzoPlayer) {
    kzoPlayer = new YT.Player('kzo-youtube-player', {
      height: '0', width: '0', videoId: currentPlaylist[3],
      playerVars: { 'autoplay': 0, 'controls': 0, 'disablekb': 1, 'enablejsapi': 1, 'fs': 0, 'loop': 0 },
      events: { 'onStateChange': onPlayerStateChange }
    });
  }
  if (!kzo2Player) {
    kzo2Player = new YT.Player('kzo2-youtube-player', {
      height: '0', width: '0', videoId: currentPlaylist[4],
      playerVars: { 'autoplay': 0, 'controls': 0, 'disablekb': 1, 'enablejsapi': 1, 'fs': 0, 'loop': 0 },
      events: { 'onStateChange': onPlayerStateChange }
    });
  }
  if (!sharautPlayer) {
    sharautPlayer = new YT.Player('sharaut-youtube-player', {
      height: '0', width: '0', videoId: currentPlaylist[5],
      playerVars: { 'autoplay': 0, 'controls': 0, 'disablekb': 1, 'enablejsapi': 1, 'fs': 0, 'loop': 0 },
      events: { 'onStateChange': onPlayerStateChange }
    });
  }
  if (!shizaLivePlayer) {
    shizaLivePlayer = new YT.Player('shiza-live-youtube-player', {
      height: '0', width: '0', videoId: currentPlaylist[6],
      playerVars: { 'autoplay': 0, 'controls': 0, 'disablekb': 1, 'enablejsapi': 1, 'fs': 0, 'loop': 1, 'playlist': currentPlaylist[6] },
      events: { 'onStateChange': onLivePlayerStateChange }
    });
  }
};

function onLivePlayerStateChange(event) {}

function onPlayerStateChange(event) {
  if (event.data === 0) {
    playNextTrack();
  }
}

function playNextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
  
  if (shizaPlayer && shizaPlayer.stopVideo) shizaPlayer.stopVideo();
  if (kairatPlayer && kairatPlayer.stopVideo) kairatPlayer.stopVideo();
  if (densPlayer && densPlayer.stopVideo) densPlayer.stopVideo();
  if (kzoPlayer && kzoPlayer.stopVideo) kzoPlayer.stopVideo();
  if (kzo2Player && kzo2Player.stopVideo) kzo2Player.stopVideo();
  if (sharautPlayer && sharautPlayer.stopVideo) sharautPlayer.stopVideo();
  if (shizaLivePlayer && shizaLivePlayer.stopVideo) shizaLivePlayer.stopVideo();
  
  if (currentTrackIndex === 0 && shizaPlayer && shizaPlayer.playVideo) {
    shizaPlayer.playVideo();
    isShizaPlaying = true;
    isKairatPlaying = isDensPlaying = isKzoPlaying = isKzo2Playing = isSharautPlaying = isShizaLivePlaying = false;
  } else if (currentTrackIndex === 1 && kairatPlayer && kairatPlayer.playVideo) {
    kairatPlayer.playVideo();
    isKairatPlaying = true;
    isShizaPlaying = isDensPlaying = isKzoPlaying = isKzo2Playing = isSharautPlaying = isShizaLivePlaying = false;
  } else if (currentTrackIndex === 2 && densPlayer && densPlayer.playVideo) {
    densPlayer.playVideo();
    isDensPlaying = true;
    isShizaPlaying = isKairatPlaying = isKzoPlaying = isKzo2Playing = isSharautPlaying = isShizaLivePlaying = false;
  } else if (currentTrackIndex === 3 && kzoPlayer && kzoPlayer.playVideo) {
    kzoPlayer.playVideo();
    isKzoPlaying = true;
    isShizaPlaying = isKairatPlaying = isDensPlaying = isKzo2Playing = isSharautPlaying = isShizaLivePlaying = false;
  } else if (currentTrackIndex === 4 && kzo2Player && kzo2Player.playVideo) {
    kzo2Player.playVideo();
    isKzo2Playing = true;
    isShizaPlaying = isKairatPlaying = isDensPlaying = isKzoPlaying = isSharautPlaying = isShizaLivePlaying = false;
  } else if (currentTrackIndex === 5 && sharautPlayer && sharautPlayer.playVideo) {
    sharautPlayer.playVideo();
    isSharautPlaying = true;
    isShizaPlaying = isKairatPlaying = isDensPlaying = isKzoPlaying = isKzo2Playing = isShizaLivePlaying = false;
  } else if (currentTrackIndex === 6 && shizaLivePlayer && shizaLivePlayer.playVideo) {
    shizaLivePlayer.playVideo();
    isShizaLivePlaying = true;
    isShizaPlaying = isKairatPlaying = isDensPlaying = isKzoPlaying = isKzo2Playing = isSharautPlaying = false;
  }
  updateMusicIcons();
}

function addMusicControl() {
  if (!document.getElementById('shiza-youtube-player')) {
    const playerDiv1 = document.createElement('div');
    playerDiv1.id = 'shiza-youtube-player';
    playerDiv1.style.display = 'none';
    document.body.appendChild(playerDiv1);
  }
  if (!document.getElementById('kairat-youtube-player')) {
    const playerDiv2 = document.createElement('div');
    playerDiv2.id = 'kairat-youtube-player';
    playerDiv2.style.display = 'none';
    document.body.appendChild(playerDiv2);
  }
  if (!document.getElementById('dens-youtube-player')) {
    const playerDiv3 = document.createElement('div');
    playerDiv3.id = 'dens-youtube-player';
    playerDiv3.style.display = 'none';
    document.body.appendChild(playerDiv3);
  }
  if (!document.getElementById('kzo-youtube-player')) {
    const playerDiv4 = document.createElement('div');
    playerDiv4.id = 'kzo-youtube-player';
    playerDiv4.style.display = 'none';
    document.body.appendChild(playerDiv4);
  }
  if (!document.getElementById('kzo2-youtube-player')) {
    const playerDiv5 = document.createElement('div');
    playerDiv5.id = 'kzo2-youtube-player';
    playerDiv5.style.display = 'none';
    document.body.appendChild(playerDiv5);
  }
  if (!document.getElementById('sharaut-youtube-player')) {
    const playerDiv6 = document.createElement('div');
    playerDiv6.id = 'sharaut-youtube-player';
    playerDiv6.style.display = 'none';
    document.body.appendChild(playerDiv6);
  }
  if (!document.getElementById('shiza-live-youtube-player')) {
    const playerDiv7 = document.createElement('div');
    playerDiv7.id = 'shiza-live-youtube-player';
    playerDiv7.style.display = 'none';
    document.body.appendChild(playerDiv7);
  }
  
  if (document.getElementById('music-control')) return;
  
  const musicControl = document.createElement('div');
  musicControl.id = 'music-control';
  musicControl.innerHTML = `
    <div style="
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 9999;
      background: linear-gradient(135deg, #8A2BE2, #4B0082);
      border: 1px solid rgba(255,215,0,0.3);
      border-radius: 50px;
      padding: 8px 15px 8px 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.5);
      backdrop-filter: blur(5px);
      color: white;
      font-family: 'Nunito', sans-serif;
      cursor: pointer;
      transition: all 0.3s;
    " onclick="toggleMusic()">
      <div style="
        width: 35px;
        height: 35px;
        background: gold;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #4B0082;
        font-size: 18px;
        font-weight: bold;
      " id="music-icon">▶️</div>
      <div>
        <div style="font-weight: 700; font-size: 13px;" id="music-title">Shiza</div>
        <div style="font-size: 11px; opacity: 0.9;" id="music-subtitle">SHYM</div>
      </div>
    </div>
  `;
  document.body.appendChild(musicControl);
  loadMusicYouTubeAPI();
}

window.toggleMusic = function() {
  if (!shizaPlayer || !kairatPlayer || !densPlayer || !kzoPlayer || !kzo2Player || !sharautPlayer || !shizaLivePlayer) return;
  
  if (isShizaPlaying || isKairatPlaying || isDensPlaying || isKzoPlaying || isKzo2Playing || isSharautPlaying || isShizaLivePlaying) {
    if (shizaPlayer && shizaPlayer.pauseVideo) shizaPlayer.pauseVideo();
    if (kairatPlayer && kairatPlayer.pauseVideo) kairatPlayer.pauseVideo();
    if (densPlayer && densPlayer.pauseVideo) densPlayer.pauseVideo();
    if (kzoPlayer && kzoPlayer.pauseVideo) kzoPlayer.pauseVideo();
    if (kzo2Player && kzo2Player.pauseVideo) kzo2Player.pauseVideo();
    if (sharautPlayer && sharautPlayer.pauseVideo) sharautPlayer.pauseVideo();
    if (shizaLivePlayer && shizaLivePlayer.pauseVideo) shizaLivePlayer.pauseVideo();
    isShizaPlaying = isKairatPlaying = isDensPlaying = isKzoPlaying = isKzo2Playing = isSharautPlaying = isShizaLivePlaying = false;
    document.getElementById('music-icon').innerHTML = '▶️';
    if (playlistInterval) {
      clearInterval(playlistInterval);
      playlistInterval = null;
    }
  } else {
    if (currentTrackIndex === 0 && shizaPlayer && shizaPlayer.playVideo) {
      shizaPlayer.playVideo();
      isShizaPlaying = true;
    } else if (currentTrackIndex === 1 && kairatPlayer && kairatPlayer.playVideo) {
      kairatPlayer.playVideo();
      isKairatPlaying = true;
    } else if (currentTrackIndex === 2 && densPlayer && densPlayer.playVideo) {
      densPlayer.playVideo();
      isDensPlaying = true;
    } else if (currentTrackIndex === 3 && kzoPlayer && kzoPlayer.playVideo) {
      kzoPlayer.playVideo();
      isKzoPlaying = true;
    } else if (currentTrackIndex === 4 && kzo2Player && kzo2Player.playVideo) {
      kzo2Player.playVideo();
      isKzo2Playing = true;
    } else if (currentTrackIndex === 5 && sharautPlayer && sharautPlayer.playVideo) {
      sharautPlayer.playVideo();
      isSharautPlaying = true;
    } else if (currentTrackIndex === 6 && shizaLivePlayer && shizaLivePlayer.playVideo) {
      shizaLivePlayer.playVideo();
      isShizaLivePlaying = true;
    }
    document.getElementById('music-icon').innerHTML = '⏸️';
    if (!playlistInterval) {
      playlistInterval = setInterval(updateMusicInfo, 3000);
    }
  }
  updateMusicInfo();
};

function updateMusicInfo() {
  const titleEl = document.getElementById('music-title');
  const subtitleEl = document.getElementById('music-subtitle');
  const musicControl = document.getElementById('music-control');
  
  if (!titleEl || !subtitleEl || !musicControl) return;
  
  if (isShizaPlaying) {
    titleEl.textContent = 'Shiza';
    subtitleEl.textContent = 'SHYM (1950s Jazz)';
    musicControl.style.background = 'linear-gradient(135deg, #8A2BE2, #4B0082)';
  } else if (isKairatPlaying) {
    titleEl.textContent = 'Қайрат Нұртас';
    subtitleEl.textContent = 'Ол сен емес';
    musicControl.style.background = 'linear-gradient(135deg, #8B0000, #4A0404)';
  } else if (isDensPlaying) {
    titleEl.textContent = '9 Грамм';
    subtitleEl.textContent = 'ДЭНС';
    musicControl.style.background = 'linear-gradient(135deg, #2C3E50, #3498DB)';
  } else if (isKzoPlaying) {
    titleEl.textContent = '6ellucci';
    subtitleEl.textContent = 'KZO';
    musicControl.style.background = 'linear-gradient(135deg, #006400, #228B22)';
  } else if (isKzo2Playing) {
    titleEl.textContent = '6ELLUCCI & JUNIOR';
    subtitleEl.textContent = 'KZO II';
    musicControl.style.background = 'linear-gradient(135deg, #8B4513, #CD853F)';
  } else if (isSharautPlaying) {
    titleEl.textContent = 'Guf & BALLER';
    subtitleEl.textContent = 'Шараут';
    musicControl.style.background = 'linear-gradient(135deg, #4B0082, #9400D3)';
  } else if (isShizaLivePlaying) {
    titleEl.textContent = 'Shiza';
    subtitleEl.textContent = 'SHYM (LIVE)';
    musicControl.style.background = 'linear-gradient(135deg, #FF4500, #8B0000)';
  }
}

function updateMusicIcons() {
  const musicIcon = document.getElementById('music-icon');
  if (!musicIcon) return;
  
  if (isShizaPlaying || isKairatPlaying || isDensPlaying || isKzoPlaying || isKzo2Playing || isSharautPlaying || isShizaLivePlaying) {
    musicIcon.innerHTML = '⏸️';
  } else {
    musicIcon.innerHTML = '▶️';
  }
  updateMusicInfo();
}

window.nextTrack = function() {
  playNextTrack();
};

window.prevTrack = function() {
  currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
  
  if (shizaPlayer && shizaPlayer.stopVideo) shizaPlayer.stopVideo();
  if (kairatPlayer && kairatPlayer.stopVideo) kairatPlayer.stopVideo();
  if (densPlayer && densPlayer.stopVideo) densPlayer.stopVideo();
  if (kzoPlayer && kzoPlayer.stopVideo) kzoPlayer.stopVideo();
  if (kzo2Player && kzo2Player.stopVideo) kzo2Player.stopVideo();
  if (sharautPlayer && sharautPlayer.stopVideo) sharautPlayer.stopVideo();
  if (shizaLivePlayer && shizaLivePlayer.stopVideo) shizaLivePlayer.stopVideo();
  
  if (currentTrackIndex === 0 && shizaPlayer && shizaPlayer.playVideo) {
    shizaPlayer.playVideo();
    isShizaPlaying = true;
    isKairatPlaying = isDensPlaying = isKzoPlaying = isKzo2Playing = isSharautPlaying = isShizaLivePlaying = false;
  } else if (currentTrackIndex === 1 && kairatPlayer && kairatPlayer.playVideo) {
    kairatPlayer.playVideo();
    isKairatPlaying = true;
    isShizaPlaying = isDensPlaying = isKzoPlaying = isKzo2Playing = isSharautPlaying = isShizaLivePlaying = false;
  } else if (currentTrackIndex === 2 && densPlayer && densPlayer.playVideo) {
    densPlayer.playVideo();
    isDensPlaying = true;
    isShizaPlaying = isKairatPlaying = isKzoPlaying = isKzo2Playing = isSharautPlaying = isShizaLivePlaying = false;
  } else if (currentTrackIndex === 3 && kzoPlayer && kzoPlayer.playVideo) {
    kzoPlayer.playVideo();
    isKzoPlaying = true;
    isShizaPlaying = isKairatPlaying = isDensPlaying = isKzo2Playing = isSharautPlaying = isShizaLivePlaying = false;
  } else if (currentTrackIndex === 4 && kzo2Player && kzo2Player.playVideo) {
    kzo2Player.playVideo();
    isKzo2Playing = true;
    isShizaPlaying = isKairatPlaying = isDensPlaying = isKzoPlaying = isSharautPlaying = isShizaLivePlaying = false;
  } else if (currentTrackIndex === 5 && sharautPlayer && sharautPlayer.playVideo) {
    sharautPlayer.playVideo();
    isSharautPlaying = true;
    isShizaPlaying = isKairatPlaying = isDensPlaying = isKzoPlaying = isKzo2Playing = isShizaLivePlaying = false;
  } else if (currentTrackIndex === 6 && shizaLivePlayer && shizaLivePlayer.playVideo) {
    shizaLivePlayer.playVideo();
    isShizaLivePlaying = true;
    isShizaPlaying = isKairatPlaying = isDensPlaying = isKzoPlaying = isKzo2Playing = isSharautPlaying = false;
  }
  updateMusicIcons();
};

setTimeout(addMusicControl, 3000);