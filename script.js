// ============ САЙТТЫ УАҚЫТША ЖАБУ (ТЕХНИКАЛЫҚ ЖҰМЫС) ============
// Бұл бөлім сайтты бүгін жауып, ертең ашады

// Техникалық жұмыс параметрлері
const MAINTENANCE_CONFIG = {
  // Бүгінгі жабу уақыты (сағат, минут)
  startHour: 22,  // кешкі 22:00
  startMinute: 0,
  
  // Ертеңгі ашылу уақыты (сағат, минут)
  endHour: 7,     // таңғы 07:00
  endMinute: 0,
  
  // Уақыт белдеуі (Қазақстан)
  timezone: 'Asia/Almaty'
};

// Техникалық жұмыс бетін көрсету
function showMaintenancePage() {
  // Барлық беттерді жасыру
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  
  // Техникалық жұмыс бетін көрсету
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
      background: linear-gradient(135deg, #0b1a2e, #1a2f3f);
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
        background: radial-gradient(circle at center, rgba(0,100,200,0.1) 0%, transparent 70%);
      ">
        <!-- Фондық анимация -->
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
            background: rgba(0,150,255,0.02);
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
          max-width: 800px;
          padding: 50px;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
          border-radius: 50px;
          border: 1px solid rgba(255,215,0,0.2);
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        ">
          <!-- Иконка -->
          <div style="
            font-size: 100px;
            margin-bottom: 30px;
            animation: maintenancePulse 2s infinite;
          ">🔧⚙️</div>
          
          <!-- Хабарлама -->
          <h1 style="
            font-size: 48px;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #ffd700, #ff8c00);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 800;
          ">Техникалық жұмыстар</h1>
          
          <!-- Уақыт көрсеткіші -->
          <div style="
            font-size: 32px;
            font-weight: 700;
            margin: 30px 0;
            color: #ffd700;
            font-family: 'Courier New', monospace;
            padding: 20px;
            background: rgba(255,215,0,0.1);
            border-radius: 60px;
            border: 2px solid rgba(255,215,0,0.3);
          ">
            <span id="maintenance-countdown">есептелуде...</span>
          </div>
          
          <!-- Түсіндірме -->
          <p style="
            font-size: 24px;
            line-height: 1.6;
            margin-bottom: 30px;
          ">
            Сайтта техникалық жұмыстар жүргізілуде.<br>
            <strong style="color: #ffd700; font-size: 28px;">${MAINTENANCE_CONFIG.endHour}:00</strong> -де ашылады
          </p>
          
          <!-- Қазіргі уақыт -->
          <div style="
            font-size: 18px;
            margin: 20px 0;
            padding: 15px;
            background: rgba(255,255,255,0.05);
            border-radius: 50px;
          ">
            Қазір: <span id="maintenance-current-time" style="font-weight: 600; color: #ffd700;">00:00:00</span>
          </div>
          
          <!-- Прогресс бар -->
          <div style="
            margin-top: 30px;
            width: 100%;
            height: 10px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            overflow: hidden;
          ">
            <div id="maintenance-progress" style="
              width: 0%;
              height: 100%;
              background: linear-gradient(90deg, #ffd700, #ff8c00);
              transition: width 0.5s;
            "></div>
          </div>
          
          <!-- Қалған уақыт -->
          <div style="
            margin-top: 20px;
            font-size: 16px;
            opacity: 0.8;
          ">
            Ашылуға қалған: <span id="maintenance-remaining">есептелуде...</span>
          </div>
        </div>
        
        <!-- Төменгі мәлімет -->
        <div style="
          position: absolute;
          bottom: 20px;
          font-size: 14px;
          opacity: 0.5;
        ">
          © 2026 Барлық құқықтар қорғалған
        </div>
      </div>
      
      <style>
        @keyframes maintenancePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
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
  
  // Уақытты жаңартуды бастау
  updateMaintenanceTimer();
  
  // Ауа райын көрсету (түн болса)
  showMaintenanceWeather();
}

// Техникалық жұмыс таймерін жаңарту
function updateMaintenanceTimer() {
  const updateTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // Қазіргі уақытты көрсету
    const currentTimeSpan = document.getElementById('maintenance-current-time');
    if (currentTimeSpan) {
      currentTimeSpan.textContent = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:${currentSecond.toString().padStart(2, '0')}`;
    }
    
    // Ертеңгі ашылу уақытын есептеу
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(MAINTENANCE_CONFIG.endHour, MAINTENANCE_CONFIG.endMinute, 0, 0);
    
    // Ағымдағы уақыт пен ертеңгі ашылу арасындағы айырма (миллисекунд)
    const timeDiff = tomorrow - now;
    
    if (timeDiff > 0) {
      // Сайт әлі жабық
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      // Countdown көрсету
      const countdownSpan = document.getElementById('maintenance-countdown');
      if (countdownSpan) {
        countdownSpan.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      
      // Қалған уақытты көрсету
      const remainingSpan = document.getElementById('maintenance-remaining');
      if (remainingSpan) {
        remainingSpan.textContent = `${hours} сағ ${minutes} мин ${seconds} сек`;
      }
      
      // Прогресс бар (тәулік бойынша)
      const totalDayMs = 24 * 60 * 60 * 1000;
      const progress = ((now - new Date(now.setHours(0,0,0,0))) / totalDayMs) * 100;
      const progressBar = document.getElementById('maintenance-progress');
      if (progressBar) {
        progressBar.style.width = progress + '%';
      }
    } else {
      // Ашылу уақыты келді - бетті қайта жүктеу
      location.reload();
    }
  };
  
  // Әр секунд сайын жаңарту
  setInterval(updateTime, 1000);
  updateTime();
}

// Техникалық жұмыс бетінде ауа райын көрсету
async function showMaintenanceWeather() {
  const { isNight } = getTimeInfo();
  
  if (!isNight) return;
  
  const weather = await getKyzylordaWeather();
  if (!weather) return;
  
  const maintenancePage = document.getElementById('page-maintenance');
  if (!maintenancePage) return;
  
  const weatherDiv = document.createElement('div');
  weatherDiv.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(10px);
    padding: 10px 20px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 15px;
    z-index: 2;
    border: 1px solid rgba(255,215,0,0.3);
    color: white;
  `;
  
  weatherDiv.innerHTML = `
    <span>🌙 Қызылорда</span>
    <img src="https:${weather.icon}" alt="weather" style="width: 24px; height: 24px;">
    <span style="font-weight: 700;">${weather.temp > 0 ? '+' : ''}${weather.temp}°C</span>
    <span style="opacity: 0.8;">${weather.condition}</span>
  `;
  
  maintenancePage.appendChild(weatherDiv);
}

// checkAccess функциясын уақытша жабу (егер техникалық жұмыс болса)
const originalCheckAccess = checkAccess;
checkAccess = async function() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Техникалық жұмыс уақытын тексеру (22:00 - 07:00)
  const isMaintenanceTime = currentHour >= MAINTENANCE_CONFIG.startHour || currentHour < MAINTENANCE_CONFIG.endHour;
  
  if (isMaintenanceTime) {
    // Техникалық жұмыс бетін көрсету
    showMaintenancePage();
    return false;
  } else {
    // Қалыпты жұмыс
    return await originalCheckAccess();
  }
};

// startTimeChecker функциясын жаңарту
const originalStartTimeChecker = startTimeChecker;
startTimeChecker = function() {
  // Бірінші тексеру
  setTimeout(() => {
    checkAccess();
  }, 1000);
  
  // Әр минут сайын тексеру
  setInterval(() => {
    checkAccess();
  }, 60000); // 1 минут
  
  return true;
};

// Бет жүктелгенде техникалық жұмыс уақытын тексеру
document.addEventListener('DOMContentLoaded', function() {
  // Бастапқы тексеру
  setTimeout(() => {
    checkAccess();
  }, 500);
});