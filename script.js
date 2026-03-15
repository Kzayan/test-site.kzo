// ============ ТЕХНИКАЛЫҚ ЖҰМЫСТАР БЕТІ (жаңа қосымша) ============

// Техникалық жұмыстар бетін көрсету
function showMaintenancePage() {
  // Барлық беттерді жасыру
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  
  // Техникалық жұмыстар бетін көрсету
  let maintenancePage = document.getElementById('page-maintenance');
  
  if (!maintenancePage) {
    maintenancePage = document.createElement('div');
    maintenancePage.id = 'page-maintenance';
    maintenancePage.className = 'page active';
    maintenancePage.style.cssText = `
      display: flex !important;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #0a0f1e, #1a1f2e);
      color: white;
      font-family: 'Nunito', sans-serif;
      z-index: 10000;
      margin: 0;
      padding: 0;
      overflow: hidden;
    `;
    
    maintenancePage.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at center, rgba(255,215,0,0.05) 0%, transparent 70%);
        animation: maintenancePulse 2s infinite;
      ">
        <!-- Анимациялық фон -->
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        ">
          <div style="
            position: absolute;
            width: 800px;
            height: 800px;
            border-radius: 50%;
            background: rgba(255,215,0,0.02);
            top: -400px;
            right: -400px;
            animation: maintenanceRotate 30s linear infinite;
          "></div>
          <div style="
            position: absolute;
            width: 600px;
            height: 600px;
            border-radius: 50%;
            background: rgba(0,100,255,0.02);
            bottom: -300px;
            left: -300px;
            animation: maintenanceRotate 20s linear infinite reverse;
          "></div>
        </div>
        
        <!-- Негізгі контент -->
        <div style="
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 900px;
          padding: 50px;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(10px);
          border-radius: 70px;
          border: 1px solid rgba(255,215,0,0.2);
          box-shadow: 0 30px 60px rgba(0,0,0,0.7);
        ">
          <!-- Техникалық жұмыс иконкасы -->
          <div style="
            font-size: 140px;
            margin-bottom: 30px;
            animation: maintenanceBounce 2s infinite;
            filter: drop-shadow(0 0 20px rgba(255,215,0,0.3));
          ">🔧⚙️</div>
          
          <!-- Негізгі хабарлама -->
          <h1 style="
            font-size: 64px;
            margin-bottom: 25px;
            background: linear-gradient(135deg, #ffd700, #ffa500, #ff8c00);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 900;
            text-shadow: 0 0 30px rgba(255,215,0,0.3);
          ">Техникалық жұмыстар</h1>
          
          <!-- Уақыт көрсеткіші -->
          <div style="
            font-size: 48px;
            font-weight: 800;
            margin-bottom: 40px;
            color: #ffd700;
            font-family: 'Courier New', monospace;
            padding: 25px 40px;
            background: rgba(255,215,0,0.1);
            border-radius: 80px;
            display: inline-block;
            border: 2px solid rgba(255,215,0,0.3);
            letter-spacing: 5px;
          ">
            <span id="maintenance-time" style="text-shadow: 0 0 15px #ffd700;">22:00</span> : 00
          </div>
          
          <!-- Түсіндірме мәтін -->
          <p style="
            font-size: 24px;
            line-height: 1.7;
            margin-bottom: 35px;
            color: rgba(255,255,255,0.95);
            font-weight: 500;
          ">
            Сайтта жоспарлы техникалық жұмыстар жүргізілуде.<br>
            <strong style="color: #ffd700; font-size: 32px; display: block; margin-top: 15px;">
              ⏰ 22:00 -де автоматты түрде ашылады
            </strong>
          </p>
          
          <!-- Қазіргі уақыт -->
          <div style="
            font-size: 20px;
            margin: 30px 0;
            padding: 18px 30px;
            background: rgba(255,255,255,0.05);
            border-radius: 60px;
            display: inline-block;
            border: 1px solid rgba(255,255,255,0.1);
          ">
            Қазіргі уақыт: <span id="current-time-maintenance" style="font-weight: 700; color: #ffd700; font-size: 24px;">00:00:00</span>
          </div>
          
          <!-- Прогресс бар -->
          <div style="
            margin: 40px auto 25px;
            width: 80%;
            height: 15px;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            overflow: hidden;
            border: 1px solid rgba(255,215,0,0.2);
          ">
            <div id="maintenance-progress" style="
              width: 0%;
              height: 100%;
              background: linear-gradient(90deg, #ffd700, #ff8c00);
              transition: width 0.5s ease;
              box-shadow: 0 0 20px #ffd700;
            "></div>
          </div>
          
          <!-- Күту уақыты -->
          <div style="
            font-size: 18px;
            opacity: 0.8;
            background: rgba(0,0,0,0.3);
            padding: 15px;
            border-radius: 50px;
            margin-top: 20px;
          ">
            ⏳ Ашылуға қалған уақыт: <span id="wait-time" style="color: #ffd700; font-weight: 700;">есептелуде...</span>
          </div>
        </div>
        
        <!-- Төменгі мәлімет -->
        <div style="
          position: absolute;
          bottom: 25px;
          font-size: 14px;
          opacity: 0.5;
          text-align: center;
          width: 100%;
        ">
          © 2026 Барлық құқықтар қорғалған | Жұмыс уақыты: 07:00 - 22:00
        </div>
      </div>
      
      <style>
        @keyframes maintenancePulse {
          0% { opacity: 1; }
          50% { opacity: 0.9; }
          100% { opacity: 1; }
        }
        @keyframes maintenanceBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes maintenanceRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
    `;
    
    document.body.appendChild(maintenancePage);
  } else {
    maintenancePage.classList.add('active');
    maintenancePage.style.display = 'flex';
  }
  
  // Техникалық жұмыстар бетінде уақытты жаңарту
  updateMaintenanceTime();
  
  // Ауа райын көрсету (егер түн болса)
  updateMaintenanceWeather();
}

// Техникалық жұмыстар бетінде уақытты жаңарту
function updateMaintenanceTime() {
  const updateTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Қазіргі уақытты көрсету
    const currentTimeSpan = document.getElementById('current-time-maintenance');
    if (currentTimeSpan) {
      currentTimeSpan.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // 22:00-ге дейінгі уақытты есептеу
    const targetHour = 22;
    const targetMinute = 0;
    const targetSecond = 0;
    
    const currentTotalSeconds = hours * 3600 + minutes * 60 + seconds;
    const targetTotalSeconds = targetHour * 3600 + targetMinute * 60 + targetSecond;
    
    let secondsUntil22;
    if (currentTotalSeconds < targetTotalSeconds) {
      // 22:00-ге дейін
      secondsUntil22 = targetTotalSeconds - currentTotalSeconds;
    } else {
      // 22:00-ден кейін (келесі күнге дейін)
      secondsUntil22 = (24 * 3600 - currentTotalSeconds) + targetTotalSeconds;
    }
    
    const hoursLeft = Math.floor(secondsUntil22 / 3600);
    const minutesLeft = Math.floor((secondsUntil22 % 3600) / 60);
    const secondsLeft = secondsUntil22 % 60;
    
    // Прогресс бар (тәулік бойынша)
    const progress = ((currentTotalSeconds) / (24 * 3600)) * 100;
    const progressBar = document.getElementById('maintenance-progress');
    if (progressBar) {
      progressBar.style.width = progress + '%';
    }
    
    // Күту уақытын көрсету
    const waitTimeSpan = document.getElementById('wait-time');
    if (waitTimeSpan) {
      waitTimeSpan.textContent = `${hoursLeft} сағ ${minutesLeft} мин ${secondsLeft} сек`;
    }
    
    // Егер 22:00 болса, сайтты қайта ашу
    if (hours === 22 && minutes === 0 && seconds < 5) {
      setTimeout(() => {
        location.reload();
      }, 1000);
    }
  };
  
  // Әр секунд сайын жаңарту
  setInterval(updateTime, 1000);
  updateTime();
}

// Техникалық жұмыстар бетінде ауа райын көрсету
async function updateMaintenanceWeather() {
  const { isNight } = getTimeInfo();
  
  if (!isNight) return;
  
  const weather = await getKyzylordaWeather();
  if (!weather) return;
  
  const maintenancePage = document.getElementById('page-maintenance');
  if (!maintenancePage) return;
  
  // Ескі ауа райы элементін өшіру
  const oldWeather = maintenancePage.querySelector('.maintenance-weather');
  if (oldWeather) oldWeather.remove();
  
  const weatherDiv = document.createElement('div');
  weatherDiv.className = 'maintenance-weather';
  weatherDiv.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(10px);
    padding: 12px 25px;
    border-radius: 60px;
    display: flex;
    align-items: center;
    gap: 15px;
    z-index: 2;
    border: 1px solid rgba(255,215,0,0.3);
    box-shadow: 0 5px 20px rgba(0,0,0,0.5);
    color: white;
    font-size: 16px;
  `;
  
  weatherDiv.innerHTML = `
    <span style="font-size: 20px;">🌙</span>
    <span style="font-weight: 600;">Қызылорда</span>
    <img src="https:${weather.icon}" alt="weather" style="width: 32px; height: 32px;">
    <span style="font-size: 20px; font-weight: 700; color: #ffd700;">${weather.temp > 0 ? '+' : ''}${weather.temp}°C</span>
    <span style="opacity: 0.9;">${weather.condition}</span>
    <span style="opacity: 0.7;">🌡️ ${weather.feelslike > 0 ? '+' : ''}${weather.feelslike}°C</span>
    <span style="opacity: 0.7;">💧 ${weather.humidity}%</span>
  `;
  
  maintenancePage.appendChild(weatherDiv);
}

// БАР ОРЫНДА: checkAccess() функциясын жаңарту (тек мына бөлігін өзгертіңіз)
async function checkAccess() {
  const { isAccessAllowed, greeting, icon, currentTime, isNight } = getTimeInfo();
  
  if (!isAccessAllowed) {
    // Барлық беттерді жасыру
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
    });
    
    // Техникалық жұмыстар бетін көрсету (жаңа)
    showMaintenancePage();
    return false;
  } else {
    // Техникалық жұмыстар бетін жасыру
    const maintenancePage = document.getElementById('page-maintenance');
    if (maintenancePage) {
      maintenancePage.classList.remove('active');
      maintenancePage.style.display = 'none';
    }
    
    // Қалыпты жұмыс - логин бетін көрсету
    const loginPage = document.getElementById('page-login');
    if (loginPage) {
      loginPage.classList.add('active');
      loginPage.style.display = 'block';
    }
  }
  return true;
}

// startTimeChecker() функциясын жаңарту (тек мына бөлігін өзгертіңіз)
function startTimeChecker() {
  // Бірінші тексеру
  setTimeout(() => {
    checkAccess();
  }, 1000);
  
  // Әр минут сайын тексеру (қысқартылған)
  setInterval(() => {
    checkAccess();
  }, 60000); // 1 минут
  
  return true;
}