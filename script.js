'use strict';

// Глобалды айнымалылар
let cachedWeather = null;
let lastWeatherFetch = 0;
const WEATHER_FETCH_INTERVAL = 5 * 60 * 1000; // 5 минут

// Пайдаланушылар тізімі (localStorage-де сақталады)
let usersResults = JSON.parse(localStorage.getItem('quizUsers')) || [];

// Қызылорда ауа райын алу функциясы (кэшпен)
async function getKyzylordaWeather() {
  const now = Date.now();
  
  // Егер кэш әлі жаңа болса, соны қайтару
  if (cachedWeather && (now - lastWeatherFetch < WEATHER_FETCH_INTERVAL)) {
    console.log('Ауа райы кэштен алынды');
    return cachedWeather;
  }
  
  try {
    // Сіздің нақты API кілтіңіз
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
    return cachedWeather; // Қате болса, ескі кэшті қайтару
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
  
  // Қолжетімділікті тексеру (таңғы 7:00 - кешкі 22:00)
  if (hours >= 22 || hours < 7) {
    isAccessAllowed = false;
    isNight = true;
  }
  
  // Уақытқа байланысты хабарлама
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

// Уақыт баннерін қосу (Forte Bank стилінде)
async function addTimeBanner() {
  // Егер баннер бар болса, қайта жасамаймыз
  const oldBanner = document.getElementById('time-banner');
  if (oldBanner) return;
  
  const { greeting, icon, currentTime, isNight } = getTimeInfo();
  
  // Ауа райын уақытқа байланысты көрсету
  let weather = null;
  if (isNight) {
    weather = await getKyzylordaWeather();
  }
  
  // Жаңа баннер жасау
  const banner = document.createElement('div');
  banner.id = 'time-banner';
  
  let weatherHtml = '';
  if (isNight && weather) {
    // Түнгі ауа райы (API арқылы) - Forte Bank стилі
    weatherHtml = `
      <div style="display: flex; align-items: center; gap: 12px; background: #003057; padding: 6px 16px; color: white; font-size: 13px; font-weight: 500;">
        <span style="font-weight: 600;">🌙 Түнгі ауа райы</span>
        <span>Қызылорда</span>
        <img src="https:${weather.icon}" alt="icon" style="width: 22px; height: 22px;">
        <span style="font-weight: 700;">${weather.temp > 0 ? '+' : ''}${weather.temp}°C</span>
        <span>${weather.condition}</span>
        <span>🌡️ ${weather.feelslike > 0 ? '+' : ''}${weather.feelslike}°C</span>
        <span>💧 ${weather.humidity}%</span>
        <span>🌬️ ${weather.wind} км/сағ</span>
      </div>
    `;
  } else if (isNight && !weather) {
    weatherHtml = `
      <div style="display: flex; align-items: center; gap: 12px; background: #003057; padding: 6px 16px; color: white; font-size: 13px; font-weight: 500;">
        <span style="font-weight: 600;">🌙 Қызылорда</span>
        <span>Ауа райы жүктелуде...</span>
      </div>
    `;
  } else if (!isNight) {
    // КҮНДІЗГІ АУА РАЙЫ ВИДЖЕТІ - Forte Bank стилі
    weatherHtml = `
      <div style="display: flex; align-items: center; gap: 12px; background: #00A3E0; padding: 6px 16px; color: white; font-size: 13px; font-weight: 500;">
        <span style="font-weight: 600;">☀️ Қызылорда ауа райы</span>
        <a href="https://yandex.ru/pogoda/kk/kyzylorda" target="_blank" style="color: white; text-decoration: none; background: #003057; padding: 4px 12px; font-weight: 600; font-size: 12px;">
          Көру →
        </a>
      </div>
    `;
  }
  
  banner.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; padding: 0 24px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 18px;">${icon}</span>
        <span style="font-weight: 500; font-size: 14px;">${greeting}</span>
        <span style="opacity: 0.8; font-family: 'JetBrains Mono', monospace; font-size: 14px;" id="time-banner-display">${currentTime}</span>
      </div>
      <div id="weather-banner-content">${weatherHtml}</div>
    </div>
  `;
  
  // Баннерге стиль қосу - Forte Bank стилі
  banner.style.cssText = `
    background: #FFFFFF;
    color: #003057;
    padding: 10px 0;
    font-size: 14px;
    font-weight: 500;
    position: sticky;
    top: 0;
    z-index: 9999;
    width: 100%;
    box-shadow: 0 2px 8px rgba(0, 48, 87, 0.08);
    border-bottom: 2px solid #00A3E0;
    font-family: 'Inter', sans-serif;
  `;
  
  // Баннерді body-дің басына қосу
  if (document.body.firstChild) {
    document.body.insertBefore(banner, document.body.firstChild);
  } else {
    document.body.appendChild(banner);
  }
  
  console.log('Баннер қосылды, түн бе?', isNight, 'Уақыт:', currentTime);
}

// Уақытты жаңарту (тек сандарды)
function updateTimeInBanner() {
  const timeSpan = document.getElementById('time-banner-display');
  if (!timeSpan) return;
  
  const { currentTime } = getTimeInfo();
  timeSpan.textContent = currentTime;
}

// Ауа райын жаңарту (қажет болса)
async function updateWeatherInBanner() {
  const weatherDiv = document.getElementById('weather-banner-content');
  if (!weatherDiv) return;
  
  const { isNight } = getTimeInfo();
  
  if (!isNight) {
    // Күндізгі ауа райы сілтемесі - Forte Bank стилі
    weatherDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; background: #00A3E0; padding: 6px 16px; color: white; font-size: 13px; font-weight: 500;">
        <span style="font-weight: 600;">☀️ Қызылорда ауа райы</span>
        <a href="https://yandex.ru/pogoda/kk/kyzylorda" target="_blank" style="color: white; text-decoration: none; background: #003057; padding: 4px 12px; font-weight: 600; font-size: 12px;">
          Көру →
        </a>
      </div>
    `;
    return;
  }
  
  // Түнде ауа райын жаңарту
  const weather = await getKyzylordaWeather();
  if (weather) {
    weatherDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; background: #003057; padding: 6px 16px; color: white; font-size: 13px; font-weight: 500;">
        <span style="font-weight: 600;">🌙 Түнгі ауа райы</span>
        <span>Қызылорда</span>
        <img src="https:${weather.icon}" alt="icon" style="width: 22px; height: 22px;">
        <span style="font-weight: 700;">${weather.temp > 0 ? '+' : ''}${weather.temp}°C</span>
        <span>${weather.condition}</span>
        <span>🌡️ ${weather.feelslike > 0 ? '+' : ''}${weather.feelslike}°C</span>
        <span>💧 ${weather.humidity}%</span>
        <span>🌬️ ${weather.wind} км/сағ</span>
      </div>
    `;
  } else {
    weatherDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; background: #003057; padding: 6px 16px; color: white; font-size: 13px; font-weight: 500;">
        <span style="font-weight: 600;">🌙 Қызылорда</span>
        <span>Ауа райы жүктелуде...</span>
      </div>
    `;
  }
}

// Қолжетімділікті тексеру - Forte Bank стиліндегі қолжетімсіздік беті
async function checkAccess() {
  const { isAccessAllowed, greeting, icon, currentTime, isNight } = getTimeInfo();
  
  // Ауа райын тек түнде ғана алу
  let weather = null;
  if (isNight) {
    weather = await getKyzylordaWeather();
  }
  
  if (!isAccessAllowed) {
    // Барлық беттерді жасыру
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Қолжетімсіздік бетін көрсету
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
        background: #F5F7FA;
        padding: 20px;
        font-family: 'Inter', sans-serif;
      `;
      
      // === ҚАДІР ТҮНІ ЖӘНЕ ДҰҒАЛАР (Forte Bank стилі) ===
      const duaHtml = `
        <div style="
          margin-bottom: 30px;
          padding: 24px;
          background: #FFFFFF;
          border: 1px solid #E5E9F0;
          box-shadow: 0 8px 20px rgba(0, 48, 87, 0.08);
        ">
          <h2 style="
            font-size: 32px;
            font-weight: 700;
            color: #003057;
            margin-bottom: 20px;
            letter-spacing: -0.5px;
          ">✨ ҚАДІР ТҮНІ ✨</h2>
          
          <div style="margin: 20px 0;">
            <div style="font-size: 24px; color: #003057; margin-bottom: 8px; font-weight: 600;">اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ العَفْوَ فَاعْفُ عَنِّي</div>
            <div style="font-size: 16px; color: #00A3E0; margin-bottom: 4px;">Аллаһуммә иннәкә афууун тухиббул-афуа фағфу анни.</div>
            <div style="font-size: 14px; color: #4A5A6A;">Уа, Алла! Сен өте кешірімдісің, кешіруді жақсы көресің. Мені кешіре гөр.</div>
          </div>
          
          <div style="margin: 20px 0;">
            <div style="font-size: 24px; color: #003057; margin-bottom: 8px; font-weight: 600;">أَسْتَغْفِرُ اللّٰهَ وَأَتُوبُ إِلَيْهِ</div>
            <div style="font-size: 16px; color: #00A3E0; margin-bottom: 4px;">Астағфируллаһ уа әтубу иләйһ</div>
            <div style="font-size: 14px; color: #4A5A6A;">Алладан кешірім сұраймын және Оған тәубе етемін.</div>
          </div>
        </div>
      `;
      
      let weatherDisplay = '';
      if (isNight && weather) {
        // Түнгі ауа райы (API) - Forte Bank стилі
        weatherDisplay = `
          <div style="
            background: #FFFFFF;
            border: 1px solid #E5E9F0;
            padding: 24px;
            margin: 25px 0;
            text-align: center;
          ">
            <div style="font-size: 18px; margin-bottom: 16px; font-weight: 600; color: #003057;">🌙 Түнгі ауа райы - Қызылорда</div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap;">
              <img src="https:${weather.icon}" alt="${weather.condition}" style="width: 64px; height: 64px;">
              <div style="font-size: 36px; font-weight: 700; color: #003057;">${weather.temp > 0 ? '+' : ''}${weather.temp}°C</div>
              <div style="font-size: 16px; background: #F0F4F8; padding: 8px 20px; color: #003057;">${weather.condition}</div>
            </div>
            <div style="display: flex; justify-content: center; gap: 30px; margin-top: 20px; flex-wrap: wrap; color: #4A5A6A;">
              <div>🌡️ Сезіледі: ${weather.feelslike > 0 ? '+' : ''}${weather.feelslike}°C</div>
              <div>💧 Ылғалдылық: ${weather.humidity}%</div>
              <div>🌬️ Жел: ${weather.wind} км/сағ</div>
            </div>
          </div>
        `;
      } else if (!isNight) {
        // КҮНДІЗГІ АУА РАЙЫ ВИДЖЕТІ (сілтеме) - Forte Bank стилі
        weatherDisplay = `
          <div style="
            background: #FFFFFF;
            border: 1px solid #E5E9F0;
            padding: 24px;
            margin: 25px 0;
            text-align: center;
          ">
            <div style="font-size: 18px; margin-bottom: 16px; font-weight: 600; color: #003057;">☀️ Қызылорда ауа райы</div>
            <div style="display: flex; justify-content: center;">
              <a href="https://yandex.ru/pogoda/kk/kyzylorda" target="_blank" style="
                background: #003057;
                color: white;
                text-decoration: none;
                padding: 14px 28px;
                font-size: 16px;
                font-weight: 600;
                display: inline-block;
              ">
                Яндекс Погодада көру →
              </a>
            </div>
          </div>
        `;
      }
      
      accessDeniedPage.innerHTML = `
        <div style="
          background: #FFFFFF;
          border: 1px solid #E5E9F0;
          padding: 48px;
          max-width: 700px;
          width: 100%;
          text-align: center;
          color: #1E2A3A;
          box-shadow: 0 20px 40px rgba(0, 48, 87, 0.12);
        ">
          <div style="font-size: 72px; margin-bottom: 20px;">${icon}</div>
          <h1 style="font-size: 32px; margin-bottom: 16px; color: #003057; font-weight: 700;">Қолжетімділік шектелген</h1>
          <p style="font-size: 16px; margin-bottom: 24px; color: #4A5A6A;">Сайт таңғы 7:00-ден кешкі 22:00-ге дейін жұмыс істейді</p>
          
          <div style="
            background: #F0F4F8;
            padding: 16px;
            margin-bottom: 24px;
            font-size: 18px;
            color: #003057;
            font-weight: 600;
          " id="access-time-display">
            ${icon} ${greeting} Қазір ${currentTime}
          </div>
          
          ${duaHtml}
          
          ${weatherDisplay}
          
          <div style="
            background: #F8FAFC;
            border: 1px solid #E5E9F0;
            padding: 20px;
            margin-top: 20px;
          ">
            <div style="display: flex; align-items: center; gap: 16px; padding: 12px; background: #E8F3E9; margin-bottom: 8px;">
              <span style="font-size: 24px; color: #00A3E0;">✅</span>
              <div style="text-align: left;">
                <div style="font-weight: 600; color: #003057;">Қолжетімді</div>
                <div style="color: #4A5A6A;">07:00 - 22:00</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 16px; padding: 12px; background: #FDECEA;">
              <span style="font-size: 24px; color: #D92B2B;">❌</span>
              <div style="text-align: left;">
                <div style="font-weight: 600; color: #003057;">Қолжетімсіз</div>
                <div style="color: #4A5A6A;">22:00 - 07:00</div>
              </div>
            </div>
          </div>
          
          <p style="font-size: 18px; margin-top: 30px; color: #003057; font-weight: 600;">Қайта келіңіз! ${icon}</p>
        </div>
      `;
      
      document.body.appendChild(accessDeniedPage);
    } else {
      // Егер бет бар болса, уақыт пен ауа райын жаңарту
      const timeDiv = document.getElementById('access-time-display');
      if (timeDiv) {
        timeDiv.innerHTML = `${icon} ${greeting} Қазір ${currentTime}`;
      }
      
      const weatherDiv = accessDeniedPage.querySelector('div[style*="padding: 24px;"]');
      if (weatherDiv && isNight && weather) {
        weatherDiv.innerHTML = `
          <div style="font-size: 18px; margin-bottom: 16px; font-weight: 600; color: #003057;">🌙 Түнгі ауа райы - Қызылорда</div>
          <div style="display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap;">
            <img src="https:${weather.icon}" alt="${weather.condition}" style="width: 64px; height: 64px;">
            <div style="font-size: 36px; font-weight: 700; color: #003057;">${weather.temp > 0 ? '+' : ''}${weather.temp}°C</div>
            <div style="font-size: 16px; background: #F0F4F8; padding: 8px 20px; color: #003057;">${weather.condition}</div>
          </div>
          <div style="display: flex; justify-content: center; gap: 30px; margin-top: 20px; flex-wrap: wrap; color: #4A5A6A;">
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

// Уақытты тексеру
function startTimeChecker() {
  // Бірінші тексеру
  setTimeout(() => {
    checkAccess();
  }, 1000);
  
  // Әр секунд сайын тексеру (уақыт жаңарту)
  setInterval(async () => {
    await checkAccess();
  }, 1000);
  
  return true;
}

// ЖАҢАРТЫЛҒАН СҰРАҚТАР (ДҰРЫС ЖАУАПТАРЫ КӨРСЕТІЛГЕН)
const QUESTIONS = [
  {question:"OLTP жүйелерінің негізгі қызметі мен бағыты қандай?",options:[
    "Пайдаланушының құпия сөзін шифрлап қою",
    "Күрделі дерекке аналитика жасап отыруы",
    "Интерфейстің жұмыс жылдамдығын арттыру",
    "Базаның физикалық көшірмесін алып тұру",
    "Күнделікті транзакцияларды жылдам жазу"
  ], correct:4},
  
  {question:"Деректер қоймасындағы 'Snowflake Schema' моделі?",options:[
    "Fact кестесінде бағандардың өте көптігі",
    "Іздеу жылдамдығының барынша жоғары болуы",
    "Тек Oracle базасында қолданылу ерекшелігі",
    "Резервтік көшірме жасаудың қарапайымдылығы",
    "Өлшем кестесінің нормалану деңгейі жоғары"
  ], correct:4},
  
  {question:"PostgreSQL-дегі VACUUM командасы не үшін қажет?",options:[
    "Пайдаланушыларды жүйеге тіркеп отыру үшін",
    "Базаны бұлтты серверге жылдам көшіру үшін",
    "Сұраудың орындалу жоспарын қайта қарау үшін",
    "Кесте шеткі кілттерін жою және өңдеу үшін",
    "Өшірілген жол орнын тазалап қайтару үшін"
  ], correct:4},
  
  {question:"ACID қасиетіндегі 'Consistency' нені білдіреді?",options:[
    "Деректі визуалды түрде көрсетудің тәсілі",
    "Желілік қосылудың арнайы техникалық жолы",
    "Транзакцияның толық орындалуының шарты",
    "Сұрауды оңтайландырудың нақты бір әдісі",
    "Деректердің алдын ала қойылған ережеге сай болуы"
  ], correct:4},
  
  {question:"ETL процесіндегі 'Load' кезеңінің басты міндеті:",options:[
    "Деректерді қайнар көзден жинап алу жұмысы",
    "Деректі тазалау және нақты форматқа салу",
    "Резервтік көшірмені архивке жіберіп тұру",
    "Жаңа кестелерді автоматты түрде құрып алу",
    "Мәліметті Fact кестесіне жүктеп салу ісі"
  ], correct:4},
  
  {question:"SQL тіліндегі DCL (Data Control Language) тобы:",options:[
    "SELECT және INSERT командаларының жиыны",
    "CREATE және ALTER командаларының жиыны",
    "UPDATE және DELETE командаларының жиыны",
    "COMMIT және ROLLBACK командаларының жиыны",
    "GRANT және REVOKE командаларының жиыны"
  ], correct:4},
  
  {question:"Деректер қоймасындағы 'Fact table' нені сақтайды?",options:[
    "Тұтынушылардың аты мен мекенжайын жинау",
    "Базаға кіруге рұқсаты бар адамдар тізімі",
    "SQL сұрауларының орындалу журналын сақтау",
    "Сервердің техникалық жағдайын бақылап тұру",
    "Сандық өлшем мен шеткі кілттердің жиыны"
  ], correct:4},
  
  {question:"PRIMARY KEY шектеуінің базадағы басты қызметі?",options:[
    "Мәліметті шифрлау арқылы қорғап тұру ісі",
    "Кестені сегменттерге бөліп орналастыруы",
    "Деректі енгізудегі форматты тексеру ісі",
    "Сұраудың орындалу уақытын қысқартып беру",
    "Жазбаның бірегейлігін қамтамасыз етуі"
  ], correct:4},
  
  {question:"GROUP BY операторы SQL-де не үшін қолданылады?",options:[
    "Деректі экранға шығармас бұрын тізіп қою",
    "Пайдаланушыны топқа бөліп басқару жұмысы",
    "Кестені біріктірудегі шарттарды қою жолы",
    "Индекстің құрылымын автоматты жаңартуы",
    "Бірдей мәнді жолдарды топтап өңдеу ісі"
  ], correct:4},
  
  {question:"Индекстеу (Indexing) процесінің басты кемшілігі?",options:[
    "Деректі іздеу жылдамдығының төмендеп қалуы",
    "SQL сұрау құрылымының күрделі болып келуі",
    "Пайдаланушының базаға кіруінің кемуі ісі",
    "Деректің бүтіндігі бұзылуының жиілеп кетуі",
    "Дерек қосу (INSERT) уақытын арттырып жіберу"
  ], correct:4},
  
  {question:"Деректер қоймасындағы 'Metadata' терминінің мәні?",options:[
    "Сатылымның маңызды сандық көрсеткіші болуы",
    "Пайдаланушының құпия сөздер журналы болуы",
    "Сервердің жұмыс уақытын өлшеу жүйесі болуы",
    "Резервтік көшірменің сақталатын орны болуы",
    "Деректердің құрылымы туралы ақпарат жиыны"
  ], correct:4},
  
  {question:"TRUNCATE TABLE командасының негізгі қасиеті:",options:[
    "Кесте құрылымын базадан толық өшіріп тастау",
    "Тек шартқа сай келетін жолдарды ғана жоюы",
    "Пайдаланушы рұқсатын жойып жіберу жұмысы",
    "Деректі басқа кестеге жылдам көшіру жолы",
    "Кестені тез тазалап логты аз толтыру ісі"
  ], correct:4},
  
  {question:"Нормализация (3NF) процесінің басты мақсаты?",options:[
    "Сұраудың орындалу уақытын барынша азайтуы",
    "Деректі визуалды ыңғайлы форматқа келтіру",
    "Кестелердің жалпы санын қысқартып отыруы",
    "Резервтік көшірме жасауды жеңілдетіп беруі",
    "Дерек қайталануын жою және тұтастықты сақтау"
  ], correct:4},
  
  {question:"PostgreSQL-дегі 'Schema' (Схема) ұғымының мағынасы:",options:[
    "Мәліметтерді шифрлауға арналған алгоритмдер",
    "Базаның физикалық дискідегі нақты мекені",
    "Пайдаланушылардың желілік қосылу ережесі",
    "Сервердің техникалық жабдықтар жиынтығы",
    "Кестелер мен нысандардың логикалық тобы"
  ], correct:4},
  
  {question:"GRANT SELECT ON users TO 'admin'; мағынасы:",options:[
    "Админге кестені өшіруге рұқсат беріп қою",
    "Админнен дерек көру құқығын алып тастау",
    "Кестеге жаңа баған қосу құқығын беріп қою",
    "Пайдаланушы паролін автоматты жаңартып тұру",
    "Админге деректі көруге рұқсат беріп қою"
  ], correct:4},
  
  {question:"Деректер қоймасындағы 'OLAP Cube' түсінігінің мәні:",options:[
    "Мәліметтерді тек екі өлшемде сақтау тәсілі",
    "Пайдаланушының базаға кіруін бақылау жолы",
    "SQL сұрауларын автоматты түрде жазу жүйесі",
    "Резервтік көшірменің арнайы сақталу пішімі",
    "Көпөлшемді деректерді жылдам талдау моделі"
  ], correct:4},
  
  {question:"INSERT INTO ... SELECT ... командасы не үшін қажет?",options:[
    "Пайдаланушының құқықтарын басқа кестеге алу",
    "Кестенің құрылымын автоматты түрде жаңарту",
    "Деректерді физикалық дискіде оңтайландыру",
    "SQL сұрауының нәтижесін экранға шығарып қою",
    "Бір кестеден екіншіге деректі жылдам көшіру"
  ], correct:4},
  
  {question:"'Data Mart' және 'Data Warehouse' айырмашылығы:",options:[
    "Қолданылатын серверлік жабдықтың қуатында",
    "Мәліметтерді шифрлаудың техникалық жолында",
    "SQL сұрауларының орындалу жылдамдығында",
    "Пайдаланушы интерфейсінің дизайнындағы айырма",
    "Қамтитын пәндік аймағы мен дерек көлемінде"
  ], correct:4},
  
  {question:"CHECK (salary > 0) шектеуінің (Constraint) рөлі:",options:[
    "Жалақы өзгергенде әкімшіге хабарлау жұмысы",
    "Жалақыны автоматты түрде есептеп шығаруы",
    "Пайдаланушының жалақысын құпия сақтап тұру",
    "Деректерді сыртқы файлға экспорттап отыруы",
    "Бағанға тек оң сандардың жазылуын қадағалау"
  ], correct:4},
  
  {question:"ETL процесіндегі 'Data Scrubbing' дегеніміз не?",options:[
    "Деректерді бір серверден екіншіге өткізу",
    "Мәліметті шифрлап қауіпсіздік деңгейін қою",
    "Деректі архивке салып жадтан өшіріп тастау",
    "Жаңа бағандарды автоматты түрде қосып қою",
    "Қате немесе қайталанған деректі тазалауы"
  ], correct:4},
  
  {question:"'Denormalization' процесі қай кезде қолданылады?",options:[
    "Деректердің қайталануын барынша азайту үшін",
    "Кесте санын көбейтіп байланысты орнату үшін",
    "Деректердің бүтіндігін қатаң сақтап тұру үшін",
    "Пайдаланушыларға рұқсат беруді жеңілдету үшін",
    "Оқу сұрауларының өнімділігін арттыру үшін"
  ], correct:4},
  
  {question:"MySQL-дегі EXPLAIN ANALYZE командасының міндеті:",options:[
    "Кесте диаграммасын графикалық түрде сызуы",
    "Пайдаланушының іс-әрекетін қадағалап отыру",
    "Деректер базасындағы қателерді тез түзету",
    "Резервтік көшірменің сапасын тексеріп беру",
    "Сұраудың нақты орындалу уақытын көрсетуі"
  ], correct:4},
  
  {question:"'Slowly Changing Dimensions' (SCD Type 1) әдісі:",options:[
    "Тарихты сақтау үшін жаңа жол қосып отыруы",
    "Өзгерген деректі бөлек кестеге көшіріп қою",
    "Мәліметті өшірмей тек бұғаттап қою жұмысы",
    "Деректерді автоматты түрде шифрлап сақтауы",
    "Ескі мәнді жаңа мәнмен толық ауыстырып жазу"
  ], correct:4},
  
  {question:"Деректер қоймасындағы 'Surrogate Key' дегеніміз:",options:[
    "Пайдаланушының жүйеге кіруге арналған кілті",
    "Басқа кестелермен байланыс орнататын шеткі кілт",
    "Деректерді шифрлауға арналған арнайы крипто-кілт",
    "Сұрауларды оңтайландыруға арналған индекс түрі",
    "Жүйелік мақсаттағы жасанды бірегей кілт болуы"
  ], correct:4},
  
  {question:"COALESCE(bonus, 0) функциясының техникалық мәні:",options:[
    "Барлық бонустарды бір-біріне қосып шығару",
    "Бонус мөлшерін автоматты түрде есептеп беру",
    "Тек бірегей бонус мәндерін іріктеп көрсету",
    "Бонус бағанының атын басқа атқа ауыстырып қою",
    "NULL мәнін көрсетілген басқа мәнге алмастыру"
  ], correct:4},
  
  {question:"SELECT ... FROM ... WHERE ... FOR UPDATE не істейді?",options:[
    "Деректерді автоматты түрде жаңартып отыруы",
    "Пайдаланушыға жазу құқығын біржола беріп қою",
    "Кестедегі барлық жазбаларды өшіруге дайындау",
    "Сұрау нәтижесін жаңа кестеге жазып сақтап қою",
    "Таңдалған жолдарды транзакция соңына дейін бұғаттау"
  ], correct:4},
  
  {question:"'Data Warehouse' архитектурасындағы 'Staging Area':",options:[
    "Дайын есептер сақталатын арнайы виртуалды бет",
    "Пайдаланушылардың базамен жұмыс істейтін орны",
    "Резервтік көшірмелер тұратын қауіпсіз сервер",
    "Индекстерді сақтауға арналған жедел жад бөлігі",
    "Деректі өңдеуге арналған уақытша сақтау орны"
  ], correct:4},
  
  {question:"ALTER TABLE students ADD COLUMN age INT; қызметі?",options:[
    "Студенттер кестесін дерекқордан толықтай өшіру",
    "Барлық студенттердің жасын автоматты есептеу",
    "Пайдаланушының жасына шектеулер қойып отыру",
    "Деректер базасының құрылымын файлға жазып алу",
    "Кестеге 'age' атты жаңа бағанды қосып орнату"
  ], correct:4},
  
  {question:"SQL-дегі 'Self Join' операциясы дегеніміз не?",options:[
    "Екі түрлі базадағы кестелерді қосу жұмысы",
    "Тек PRIMARY KEY арқылы кестелерді біріктіру",
    "Пайдаланушының өзіне ғана рұқсат беріп қою",
    "Деректерді біріктіру кезінде қатені тексеру",
    "Кестенің өзін-өзіне біріктіріп дерек алуы"
  ], correct:4},
  
  {question:"Деректер қоймасындағы 'Grain' түсінігі нені білдіреді?",options:[
    "Резервтік көшірменің дискіде алатын нақты көлемі",
    "Пайдаланушының жүйеге кіру жиілігінің көрсеткіші",
    "SQL сұрауларын орындаудың максималды уақыт шегі",
    "Деректерді шифрлауға арналған кілттің ұзындығы",
    "Факт кестесіндегі деректің егжей-тегжейлі деңгейі"
  ], correct:4},
  
  {question:"UNION мен UNION ALL операторларының айырмашылығы:",options:[
    "UNION тек сандарды, UNION ALL мәтінді қосады",
    "UNION ALL сұрауды әлдеқайда баяу орындап шығу",
    "Олардың арасында ешқандай техникалық айырма жоқ",
    "UNION тек Oracle базасында ғана жұмыс істеп тұру",
    "UNION қайталауды жояды, UNION ALL бәрін алады"
  ], correct:4},
  
  {question:"DROP және TRUNCATE командаларының айырмашылығы:",options:[
    "TRUNCATE кестені жояды, DROP тек ішін тазалауы",
    "Екі команда да кестенің құрылымын сақтап қалуы",
    "DROP тек индекстерді өшіруге арналған тәсіл болу",
    "TRUNCATE пайдаланушы рұқсатын жойып жіберу ісі",
    "DROP кестені жояды, TRUNCATE тек ішін тазалайды"
  ], correct:4},
  
  {question:"'Factless Fact Table' (Дерексіз факт кестесі) мақсаты:",options:[
    "Тек сандық мәндерді сақтау үшін қолданылу жолы",
    "Базадағы барлық бос кестелерді біріктіру жұмысы",
    "Резервтік көшірме жасауды жылдамдатудың тәсілі",
    "Пайдаланушылардың іс-әрекетін жасырын бақылау",
    "Белгілі бір оқиғалардың орын алғанын тіркеуі"
  ], correct:4},
  
  {question:"PostgreSQL-дегі SERIAL деректер типінің қызметі:",options:[
    "Мәтіндік деректерді серия бойынша реттеп тізу",
    "Деректерді шифрланған түрде сақтап отыру жолы",
    "Тек уақыт пен күнді сақтауға арналған формат",
    "Пайдаланушының жеке идентификаторын жасыруы",
    "Автоматты түрде өсетін бүтін сандық мән беру"
  ], correct:4},
  
  {question:"HAVING операторын қай жағдайда қолдану міндетті?",options:[
    "Кестелерді INNER JOIN арқылы қосқан уақытта",
    "Деректерді өсу ретімен сұрыптау қажет болса",
    "Пайдаланушыға жаңа рұқсаттар берген кездегі іс",
    "Индекстерді қолмен жаңарту қажет болған кезде",
    "Агрегаттық функция нәтижесіне шарт қою үшін"
  ], correct:4},
  
  {question:"'ETL' орнына 'ELT' қолданудың басты себебі неде?",options:[
    "Деректер базасының қауіпсіздік деңгейін арттыру",
    "Пайдаланушы интерфейсін барынша оңтайландыру",
    "Резервтік көшірме жасау процесін баяулату үшін",
    "SQL сұрауларын жазуды барынша жеңілдетіп алу",
    "Заманауи бұлтты қоймалардың қуатын пайдалану"
  ], correct:4},
  
  {question:"RECURSIVE CTE (Common Table Expressions) не үшін қажет?",options:[
    "Кестелерді автоматты түрде өшіріп қайта құруы",
    "Пайдаланушының рұқсаттарын циклмен тексеріп тұру",
    "Деректерді бірнеше серверге қатар жазып отыруы",
    "Сұрау нәтижесін диаграмма түрінде көрсетіп беру",
    "Иерархиялық құрылымдағы деректермен жұмыс істеу"
  ], correct:4},
  
  {question:"'Star Schema' моделіндегі 'Join' операцияларының саны:",options:[
    "Snowflake моделіне қарағанда әлдеқайда көп болуы",
    "Деректер базасындағы кестелердің жалпы санына тең",
    "Пайдаланушылардың санына қарай өзгеріп отыруы",
    "Сұраудың күрделілігіне қарай автоматты есептелу",
    "Snowflake моделіне қарағанда әлдеқайда аз болуы"
  ], correct:4},
  
  {question:"COMMIT және ROLLBACK командаларының басты мақсаты:",options:[
    "Деректер базасының құрылымын толықтай өзгерту",
    "Пайдаланушының базаға кіруін бақылау және шектеу",
    "SQL сұрауларын орындаудың жоспарын жасап алуы",
    "Резервтік көшірмелерді автоматты түрде жаңарту",
    "Транзакция нәтижесін сақтау немесе кері қайтару"
  ], correct:4},
  
  {question:"'Bitmap Index' қай жағдайда тиімдірек болып саналады?",options:[
    "Бағандағы мәндердің барлығы бірегей болған кезде",
    "Деректер үнемі өзгеріп және жаңарып тұрған сәтте",
    "Тек үлкен мәтіндік файлдарды іздеу қажет болса",
    "Пайдаланушылардың саны өте көп болған жағдайда",
    "Мәндер саны аз (кардиналдығы төмен) бағандарда"
  ], correct:4},
  
  {question:"Деректер базасындағы 'Deadlock' дегеніміз не?",options:[
    "Пайдаланушының базаға кіре алмай қалуы",
    "Кестенің физикалық деңгейде зақымдануы",
    "Сұраудың шексіз циклге түсіп кетуі ісі",
    "Базадағы барлық жазбалардың өшірілуі",
    "Екі транзакцияның бірін-бірі бұғаттауы"
  ], correct:4},
  
  {question:"GRANT командасының DCL құрамындағы рөлі:",options:[
    "Кесте ішіндегі жазбаларды жаңартуы",
    "Деректер базасының нысанын құруы",
    "Транзакцияның нәтижесін сақтап қалуы",
    "SQL сұрауының орындалуын жоспарлауы",
    "Пайдаланушыға арнайы құқық беруі"
  ], correct:4},
  
  {question:"'Fact table' мен 'Dimension' байланысы:",options:[
    "Тек кесте бағандарының аттары арқылы",
    "Пайдаланушының арнайы парольдары арқылы",
    "Тек алфавиттік тәртіп бойынша сұрыптау",
    "Базаның физикалық мекенжайы арқылы іске асады",
    "Шеткі кілт (Foreign Key) қатынасы арқылы"
  ], correct:4},
  
  {question:"COUNT(column_name) функциясының ерекшелігі:",options:[
    "Кестедегі барлық жолдарды есептеп шығу",
    "Бос (NULL) мәндерді де есептеп жазуы",
    "Қайталанатын мәндерді алып тастауы",
    "Арифметикалық орташаны есептеп беруі",
    "Бос емес (NOT NULL) жолдарды санауы"
  ], correct:4},
  
  {question:"SQL-дегі HAVING операторы қай жерде тұрады?",options:[
    "FROM командасының алдында ғана",
    "WHERE операторының ішіне кіріп",
    "SELECT сөзінен бұрын жазылып",
    "ORDER BY командасының соңында",
    "GROUP BY операторынан кейін"
  ], correct:4},
  
  {question:"UPDATE командасы кезіндегі WHERE шарты:",options:[
    "Кестенің құрылымын өзгертіп жазуы",
    "Пайдаланушының жаңа рұқсатын алуы",
    "Деректерді басқа файлға экспорттау",
    "Индекстің жылдамдығын арттырып беру",
    "Тек сәйкес жолдарды өзгерту үшін"
  ], correct:4},
  
  {question:"Деректерді 'Partitioning' (бөлімдеу) мақсаты:",options:[
    "Пайдаланушының құпиясын сақтап тұру",
    "Тек сандық мәндерді сақтауға арналу",
    "Резервтік көшірменің сапасын арттыру",
    "SQL сұрауын жазуды жеңілдетіп беру",
    "Үлкен кестелерді жылдам іздеу үшін"
  ], correct:4},
  
  {question:"PostgreSQL-де NULL мәні нені білдіреді?",options:[
    "Мәннің 0-ге тең екендігінің дәлелі",
    "Деректің өшірілгенінің белгісі ісі",
    "Пайдаланушының рұқсатсыз қалғаны",
    "Кестедегі қателіктердің санының бары",
    "Мәннің белгісіз екендігінің көрсеткіші"
  ], correct:4},
  
  {question:"'Data Warehouse' ішіндегі 'Granularity':",options:[
    "Мәліметтің шифрлану деңгейінің мәні",
    "Кестенің дискдегі нақты көлемдік орны",
    "Пайдаланушының жүйедегі жасырын аты",
    "SQL сұрауының ең төменгі күрделілігі",
    "Деректің ең егжей-тегжейлі деңгейі"
  ], correct:4},
  
  {question:"DELETE және TRUNCATE арасындағы айырма:",options:[
    "TRUNCATE логикалық, DELETE физикалық",
    "DELETE тек кестені өшіріп тастауы ісі",
    "TRUNCATE тек сандарды өшіріп жазуы",
    "Екеуі де бірдей жұмыс істейтін тәсіл",
    "DELETE транзакциялық, TRUNCATE емес"
  ], correct:4},
  
  {question:"Индекстердің 'B-Tree' түрінің басты міндеті:",options:[
    "Деректерді физикалық дискіден өшіру",
    "Пайдаланушының рұқсатын бақылау жолы",
    "Тек мәтіндік ақпаратты сұрыптап тұру",
    "Сұраудың нәтижесін графикалық құруы",
    "Мәндерді ретті түрде іздеу мен жинау"
  ], correct:4},
  
  {question:"Деректер базасындағы 'Locking' (бұғаттау):",options:[
    "Пайдаланушының паролін жасыру әдісі",
    "Кестенің құрылымын өзгертіп жазу жолы",
    "Резервтік көшірменің сапасын тексеру",
    "Деректі жылдам өшіруге арналған тәсіл",
    "Деректің бүтіндігін сақтау механизмі"
  ], correct:4},
  
  {question:"WHERE col LIKE 'A%' сұрауының нәтижесі:",options:[
    "А әрпі бар барлық жолдарды алуы",
    "А әрпімен аяқталатын сөздерді табу",
    "А әрпі жоқ барлық деректерді іріктеу",
    "А әрпі бар бағанды жойып тастауы",
    "А әрпінен басталатын сөздерді алуы"
  ], correct:4},
  
  {question:"DISTINCT операторының негізгі қызметі:",options:[
    "Барлық мәндерді рет-ретімен тізу",
    "Тек сандық мәндерді іріктеп көрсету",
    "Бос (NULL) мәндерді жасырып қоюы",
    "Кестедегі барлық жолдарды санау ісі",
    "Қайталанатын деректерді алып тастау"
  ], correct:4},
  
  {question:"Деректерді 'Backup' жасаудың мақсаты:",options:[
    "Сұраудың жылдамдығын барынша арттыру",
    "Пайдаланушының базаға кіруін тексеру",
    "Кесте құрылымын графикалық сипаттау",
    "Деректер базасын жаңа серверге қосу",
    "Апаттық жағдайда қалпына келтіру ісі"
  ], correct:4},
  
  {question:"'Logical Database Design' кезеңінің мақсаты:",options:[
    "Сервердің дискіден алатын нақты орны",
    "Базаның желідегі жұмыс істеу жылдамдығы",
    "Пайдаланушылардың жүйеге кіру паролі",
    "Деректерді шифрлаудың қауіпсіздік жолы",
    "Кесте мен байланыстардың моделі болуы"
  ], correct:4},
  
  {question:"AVG агрегаттық функциясы не істейді?",options:[
    "Бағандағы барлық мәндердің қосындысы",
    "Ең үлкен мәні бар жазбаны тауып беруі",
    "Кестедегі барлық жолдарды санап шығу",
    "Тек оң мәндерді іріктеп алып көрсету",
    "Берілген мәндердің орташасын есептеу"
  ], correct:4},
  
  {question:"Деректер қоймасындағы 'Dimension' кестелері:",options:[
    "Тек сандық ақпаратты сақтауға арналады",
    "Резервтік көшірмені бақылауға арналған",
    "SQL сұрауын орындауды жеделдетіп тұру",
    "Сервердің жұмыс істеу уақытын бақылау",
    "Бизнес процестің сипаттамасын сақтау"
  ], correct:4},
  
  {question:"DROP USER 'name'; командасының қызметі:",options:[
    "Пайдаланушының құқығын алып тастауы",
    "Пайдаланушының құпия сөзін жаңартуы",
    "Пайдаланушының істеген ісін тексеру ісі",
    "Пайдаланушының рөлін өзгертіп жазуы",
    "Пайдаланушыны базадан өшіріп тастау"
  ], correct:4},
  
  {question:"MIN функциясы кестеде не істейді?",options:[
    "Бағандағы ең үлкен мәнді іздеу жолы",
    "Бағандағы барлық санды қосып шығу ісі",
    "Қайталанатын жазбаларды жойып тастау",
    "Кестедегі барлық жолдарды санап қою",
    "Бағандағы ең кіші мәнді тауып беруі"
  ], correct:4},
  
  {question:"SQL-дегі CASE операторының атқаратын ісі:",options:[
    "Кестелерді автоматты түрде біріктіруі",
    "Пайдаланушыға рұқсат беріп тұру ісі",
    "Резервтік көшірмені тексеруге арналу",
    "Индекстерді жаңартып тұруға қолдану",
    "Шартты логикалық сұрауларды құруы"
  ], correct:4},
  
  {question:"Кесте құру кезіндегі DEFAULT мәнінің рөлі:",options:[
    "Жазбаны автоматты түрде өшіріп қою",
    "Мәні болмаған кездегі қателік шығару",
    "Бағанды тек сандық мәнге шектеп қою",
    "Пайдаланушының атын жазып қою жолы",
    "Мәні жоқ болса автоматты мән қоюы"
  ], correct:4},
  
  {question:"'Star Schema' моделінің негізгі кемшілігі:",options:[
    "Іздеу сұрауларының өте баяу орындалуы",
    "Пайдаланушының рұқсатын басқару қиындығы",
    "Резервтік көшірмесін жасаудың өте қиындығы",
    "Тек MySQL жүйесінде ғана қолданылуы",
    "Кестелердің арасындағы артық мән саны"
  ], correct:4},
  
  {question:"EXISTS операторының жұмыс істеу жолы:",options:[
    "Бағандағы барлық мәндерді тексеріп шығу",
    "Кестенің бар екенін тексеруге арналып",
    "Пайдаланушының құқығын бақылап тұруы",
    "Деректерді басқа серверге көшіріп тұру",
    "Ішкі сұрауда жазбаның барлығын тексеру"
  ], correct:4},
  
  {question:"'Database Schema' мен 'Database' айырмасы:",options:[
    "База - логикалық топ, схема - контейнер",
    "Олардың ешқандай айырмашылығы болмайды",
    "Схема тек индекстерді сақтауға арналған",
    "База тек кестелерді сақтауға арналған",
    "Схема - логикалық топ, база – контейнер"
  ], correct:4},
  
  {question:"Деректерді 'Import' етудің негізгі мақсаты:",options:[
    "Кестелердің құрылымын өзгертіп жазуы",
    "Пайдаланушы рұқсатын алып тастап тұру",
    "Резервтік көшірме жасаудың тәсілі болу",
    "SQL сұрауын жазуды жеңілдету ісі болу",
    "Сыртқы деректі базаға көшіріп қоюы"
  ], correct:4},
  
  {question:"SELECT * сұрауының басты қаупі:",options:[
    "Сервердің жұмысын автоматты тоқтатуы",
    "Пайдаланушы рұқсатын алып тастап тұру",
    "Резервтік көшірме жасауды баяулату ісі",
    "Кестедегі деректерді өшіріп тастауы",
    "Кестеден артық деректерді алып шығу"
  ], correct:4},
  
  {question:"SUM агрегаттық функциясы қайда қолданылады?",options:[
    "Мәтіндік бағандарды алфавиттеу үшін",
    "Кестедегі барлық жолдарды санау үшін",
    "Ең үлкен мәнді іздеп табуға арналып",
    "Кестелерді біріктіруге арналған тәсіл",
    "Сандық бағандардың қосындысы үшін"
  ], correct:4},
  
  {question:"SQL-дегі NULL мәнін қалай тексереді?",options:[
    "WHERE col = NULL арқылы жазылып",
    "WHERE col == NULL арқылы жазылып",
    "WHERE col IS NOT NULL деп қана",
    "WHERE col LIKE NULL деп жазылады",
    "WHERE col IS NULL деп жазылады"
  ], correct:4},
  
  {question:"'Factless Fact' кестесіне мысал ретінде:",options:[
    "Сату сомасы сақталған кесте түрі",
    "Пайдаланушының паролі тұрған кесте",
    "Резервтік көшірмелер тізімі кестесі",
    "Индекстер сақталған жүйелік кесте",
    "Студенттің сабаққа қатысу кестесі"
  ], correct:4},
  
  {question:"Деректерді тазалау (Data Cleansing) ісі:",options:[
    "SQL сұрауларын жазудың тәсілі болу",
    "Кестедегі барлық жолды өшіріп тастау",
    "Пайдаланушылардың рөлін бөліп шығу",
    "Деректер базасын жаңалауға арналу",
    "Қателікті деректерді жою немесе түзеу"
  ], correct:4},
  
  {question:"DESCRIBE table_name; командасы не істейді?",options:[
    "Кесте ішіндегі бар деректі оқып шығу",
    "Кестедегі барлық жолдарды санап қою",
    "Кестенің резервтік көшірмесін жасау",
    "Кестедегі индекстерді тексеріп шығу",
    "Кесте құрылымын сипаттап көрсетуі"
  ], correct:4},
  
  {question:"JOIN түріндегі 'Cross Join' қасиеті:",options:[
    "Тек ортақ мәндері бар жолды алып қою",
    "Сол жақ кестенің бар мәндерін алып алу",
    "Оң жақ кестенің бар мәндерін алып алу",
    "Тек Primary Key бойынша біріктіру ісі",
    "Екі кестенің толық комбинациясын алу"
  ], correct:4},
  
  {question:"'View' қолданудың басты артықшылығы:",options:[
    "Деректер базасын жылдам өшіру жолы",
    "Пайдаланушының құпия сөзін тексеру",
    "Резервтік көшірме жасауды жеңілдету",
    "Кестелерді біріктіру жылдамдығын арттыру",
    "Күрделі сұрауды жасырып көрсетуі"
  ], correct:4},
  
  {question:"Деректер базасындағы 'Trigger' қызметі:",options:[
    "SQL сұрауын автоматты жазып отыру",
    "Пайдаланушының құқығын бақылау ісі",
    "Резервтік көшірмені тексеріп тұруы",
    "Индекстерді жаңартып тұруға арналу",
    "Оқиға бойынша автоматты іске қосылу"
  ], correct:4},
  
  {question:"LIKE '%а' сұрауының нақты мағынасы:",options:[
    "А әрпі бар барлық жолдарды алып шығу",
    "А әрпінен басталатын сөздерді алып алу",
    "А әрпі жоқ барлық жазбаларды іріктеу",
    "А әрпі бар бағанды жойып тастау ісі",
    "А әрпімен аяқталатын сөздерді табу"
  ], correct:4},
  
  {question:"Деректерді топтау (Grouping) не үшін керек?",options:[
    "Мәліметті алфавит бойынша тізіп қою",
    "Кестені бірнеше файлға бөліп тастау",
    "Пайдаланушыларды бөлектеуге арналу",
    "Резервтік көшірмені жасауға арналу",
    "Топтар бойынша есептеулер жасау ісі"
  ], correct:4},
  
  {question:"'Dimension' кестелерінің негізгі ролі:",options:[
    "Сатылым сомасын есептеп шығарып беру",
    "SQL сұрауын орындау жылдамдығын алу",
    "Пайдаланушының жүйеге кіруін тексеру",
    "Резервтік көшірмені сақтауға арналу",
    "Деректерді контекстпен толықтыру ісі"
  ], correct:4},
  
  {question:"SQL-де NULL мәнін қалай есептейді?",options:[
    "Ол мән автоматты түрде 0 болып келеді",
    "Ол мән автоматты түрде 1 болып келеді",
    "Ол мән автоматты түрде теріс болады",
    "Ол мән қателік беріп жүйені тоқтатады",
    "Ол ешқандай есептеуге қатыспайды"
  ], correct:4},
  
  {question:"MAX агрегаттық функциясының атқаратын ісі:",options:[
    "Бағандағы ең кіші мәнді тауып беруі",
    "Бағандағы барлық санды қосып шығу ісі",
    "Қайталанатын жазбаларды жойып тастау",
    "Кестедегі барлық жолдарды санап қою",
    "Бағандағы ең үлкен мәнді іздеу жолы"
  ], correct:4},
  
  {question:"'Relational Online Analytical Processing' (ROLAP):",options:[
    "Деректерді тек жедел жадта (In-memory) өңдеуі",
    "Пайдаланушының сұрауларын графикалық бейнелеу",
    "Резервтік көшірмені желі арқылы автоматты алу",
    "SQL сұрауларын орындау алдында логқа жазуы",
    "Аналитика үшін реляциялық базаны қолдануы"
  ], correct:4},
  
  {question:"EXISTS бен IN операторларының басты айырмашылығы:",options:[
    "IN операторы әлдеқайда жылдам жұмыс істеп тұруы",
    "EXISTS тек сандық деректермен жұмыс істей алуы",
    "Олардың арасында ешқандай техникалық айырма жоқ",
    "IN тек Oracle базасында ғана қолданылу ерекшелігі",
    "EXISTS жазба табылғанда іздеуді бірден тоқтату"
  ], correct:4},
  
  {question:"'Data Warehouse Bus Architecture' (Kimball) мәні:",options:[
    "Деректерді бір орталықтан ғана басқару жүйесі",
    "Пайдаланушыларды автобус арқылы тасымалдау ісі",
    "Резервтік көшірме жасаудың желілік протоколы",
    "SQL сұрауларын тізбекті түрде орындап отыруы",
    "Ортақ өлшемдер (Conformed Dimensions) қолдану"
  ], correct:4},
  
  {question:"CREATE VIEW ... AS SELECT ... командасы не істейді?",options:[
    "Деректер базасының физикалық көшірмесін жасау",
    "Пайдаланушыға жаңа кесте құруға рұқсат беруі",
    "Кестенің құрылымын файлға сақтап қою жұмысы",
    "Сұрау нәтижесін автоматты түрде басып шығару",
    "SQL сұрауына негізделген виртуалды кесте құру"
  ], correct:4},
  
  {question:"'Multidimensional OLAP' (MOLAP) басты ерекшелігі:",options:[
    "Тек реляциялық кестелерді пайдалану артықшылығы",
    "Пайдаланушылардың санын шектеп отыру мүмкіндігі",
    "Резервтік көшірменің көлемін барынша азайтуы",
    "SQL сұрауларын жазудың қажет еместігінде болу",
    "Деректерді арнайы көпөлшемді кубтарда сақтауы"
  ], correct:4},
  
  {question:"DELETE пен DROP командаларының басты айырмашылығы:",options:[
    "DROP тек жолдарды, DELETE бүкіл кестені жояды",
    "Екі команда да кестенің құрылымын сақтап қалуы",
    "DELETE тек индекстерді өшіруге арналған тәсіл",
    "DROP командасы транзакцияны автоматты бастауы",
    "DELETE тек жолдарды, DROP бүкіл кестені жояды"
  ], correct:4},
  
  {question:"'Metadata Repository' деректер қоймасында не үшін керек?",options:[
    "Пайдаланушылардың жеке құпия сөздерін сақтау",
    "Сатылымдардың барлық сандық мәндерін жинау",
    "Резервтік көшірмелерді архивке жіберіп отыруы",
    "SQL сұрауларының орындалу уақытын бақылап тұру",
    "Метадеректерді орталықтандырып сақтау және басқару"
  ], correct:4},
  
  {question:"SELECT ... FROM ... WHERE id BETWEEN 1 AND 10; мағынасы:",options:[
    "Идентификаторы тек 1 немесе 10-ға тең жазбалар",
    "Идентификаторы 1-ден кіші барлық жазбаны табу",
    "Идентификаторы 10-нан үлкен жазбаларды іріктеу",
    "Идентификаторы жоқ барлық жазбаларды базадан жою",
    "Идентификаторы 1-ден 10-ға дейінгі жазбаларды алу"
  ], correct:4},
  
  {question:"'Functional Dependency' (Функционалды тәуелділік) мәні:",options:[
    "Бағандардың бір-біріне физикалық қосылып тұруы",
    "Пайдаланушының базадағы функцияларын басқаруы",
    "SQL сұрауындағы функциялардың орындалу реті",
    "Резервтік көшірме жасау функциясының іске қосылуы",
    "Бір атрибуттың мәні арқылы басқасын анықтау"
  ], correct:4},
  
  {question:"GRANT ALL PRIVILEGES ON database TO 'user'; мағынасы:",options:[
    "Пайдаланушыны деректер базасынан біржола өшіру",
    "Пайдаланушыға тек деректерді көруге рұқсат беру",
    "Пайдаланушының паролін автоматты түрде жаңарту",
    "Базаның атауын пайдаланушы атына ауыстырып қою",
    "Пайдаланушыға барлық құқықтарды толықтай беру"
  ], correct:4},
  
  {question:"'Data Cube' технологиясындағы 'Pivot' операциясы:",options:[
    "Деректерді егжей-тегжейлі күйден жалпылауға өткізу",
    "Резервтік көшірменің сақталу бағытын өзгертіп қою",
    "SQL сұрауларының синтаксисін автоматты тексеру",
    "Пайдаланушы рұқсаттарын басқа пайдаланушыға беру",
    "Деректерді көрудің осьтерін (бұрышын) ауыстыру"
  ], correct:4},
  
  {question:"CREATE UNIQUE INDEX ... командасының басты мақсаты:",options:[
    "Кестедегі деректерді автоматты түрде шифрлап қою",
    "Жазбаларды қосу жылдамдығын барынша арттырып беру",
    "Резервтік көшірменің бірегей нөмірін жасап шығару",
    "Пайдаланушының базаға тек бір рет кіруін қамтамасыз",
    "Бағанда қайталанатын мәндердің болмауын қадағалау"
  ], correct:4},
  
  {question:"'Surrogate Key' неге бизнес-кілттерден (мысалы, ЖСН) жақсы?",options:[
    "Ол пайдаланушыға түсініктірек форматта болады",
    "Оны қолмен өзгерту әлдеқайда оңай және жылдам",
    "Ол деректер базасында әлдеқайда көп орын алады",
    "Ол SQL сұрауларын жазуды күрделендіре түсуі үшін",
    "Ол бизнес-процестердің өзгеруіне тәуелсіз болады"
  ], correct:4},
  
  {question:"SELECT NOW(); функциясы SQL-де нені қайтарады?",options:[
    "Пайдаланушының жүйеге кірген нақты уақытын",
    "Деректер базасының құрылған күні мен сағатын",
    "SQL сұрауының орындалуына кеткен уақыт мөлшерін",
    "Резервтік көшірме жасалатын келесі уақыт мерзімін",
    "Сервердің ағымдағы күні мен нақты уақытын"
  ], correct:4},
  
  {question:"'Fact Table' ішіндегі 'Additive Measures' (Қосылатын өлшемдер):",options:[
    "Тек қана мәтіндік сипаттамаларды білдіретін мәндер",
    "Пайдаланушылардың санын есептейтін арнайы индекстер",
    "Резервтік көшірмеге қосымша қосылатын файлдар жиыны",
    "SQL сұрауына қосылатын жаңа логикалық шарттар тобы",
    "Барлық өлшемдер бойынша қосуға болатын сандық мән"
  ], correct:4},
  
  {question:"ROLLBACK TO SAVEPOINT sp1; командасы не істейді?",options:[
    "Бүкіл транзакцияны басынан бастап толық кері қайтару",
    "Пайдаланушының базадан шығуын тоқтатып, сақтап қалу",
    "Деректер базасын кешегі күнгі қалпына келтіріп беру",
    "Резервтік көшірмені 'sp1' файлына жазып сақтап қою",
    "Транзакцияны тек 'sp1' белгісіне дейін кері қайтару"
  ], correct:4},
  
  {question:"'Data Governance' саясатының дерекқордағы рөлі:",options:[
    "Серверлік жабдықтарды сатып алуды жоспарлау жұмысы",
    "Пайдаланушы интерфейсінің дизайнын бекіту және бақылау",
    "Резервтік көшірмелерді физикалық дискілерге таратуы",
    "SQL сұрауларының орындалу кезегін басқару және шектеу",
    "Деректерді басқарудың ережелері мен стандартын орнату"
  ], correct:4},
  
  {question:"ALTER TABLE ... MODIFY COLUMN ... (немесе ALTER TYPE) мақсаты:",options:[
    "Бағандағы барлық деректерді біржола өшіріп тастау",
    "Пайдаланушының бағанды көру құқығын уақытша бұғаттау",
    "Бағанның атауын басқа атауға автоматты түрде ауыстыру",
    "Бағанға жаңа индекс құруды жүйеден талап етіп сұрау",
    "Бағанның деректер типін немесе ұзындығын өзгерту"
  ], correct:4},
  
  {question:"'Heuristic Query Optimization' дегеніміз не?",options:[
    "Пайдаланушының сұрауын кездейсоқ таңдап орындау ісі",
    "Деректерді шифрлаудың ең күрделі математикалық жолы",
    "Резервтік көшірме жасаудың ең тиімді уақытын таңдауы",
    "SQL сұрауындағы қателерді өздігінен тауып түзеу жолы",
    "Сұрауды орындау үшін дайын ережелерді қолдану тәсілі"
  ], correct:4},
  
  {question:"'ALTER TABLE ... RENAME TO ... командасы не істейді?",options:[
    "Кестедегі бағанның атын басқа атқа ауыстыруы",
    "Пайдаланушының есімін базада автоматты жаңарту",
    "Деректер базасының атауын толықтай басқаруы",
    "Индекстің атауын жүйелік деңгейде қайта жазуы",
    "Кестенің атауын жаңа атауға ауыстырып өзгерту"
  ], correct:4}
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
  document.getElementById(pageId).classList.add('active');
}

// Пайдаланушы атын енгізу бетін көрсету
function showNameInput() {
  document.getElementById('name-err').classList.add('hidden');
  document.getElementById('name-input').value = '';
  showPage('page-name-input');
}

// Пайдаланушы атын сақтау және тесті бастау
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
  
  // Пайдаланушыны тізімге қосу (әзірше нәтижесіз)
  const existingUser = usersResults.find(u => u.name === name);
  if (!existingUser) {
    usersResults.push({ name: name, score: 0, total: 0, date: new Date().toLocaleString() });
    localStorage.setItem('quizUsers', JSON.stringify(usersResults));
  }
  
  // Тесті бастау
  startTest();
}

// Парольді тексеру (өзгертілді)
function checkPw() {
  const input = document.getElementById('pw-in');
  const value = input.value.trim();
  
  if (value === '7777') {
    document.getElementById('pw-err').classList.add('hidden');
    // Атын енгізу бетіне өту
    showNameInput();
    input.value = '';
  } else {
    document.getElementById('pw-err').classList.remove('hidden');
    document.getElementById('pw-wrap').classList.add('shake');
    setTimeout(() => document.getElementById('pw-wrap').classList.remove('shake'), 400);
    input.value = '';
    input.focus();
  }
}

// Тесті бастау
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
      document.getElementById('eye-banner').classList.remove('hidden');
    }
  }, 20 * 60 * 1000);
}

function renderQuestion() {
  if (!shuffled.length || curIdx >= shuffled.length) return;
  
  const question = shuffled[curIdx];
  const total = shuffled.length;
  const letters = ['A', 'B', 'C', 'D', 'E'];
  
  document.getElementById('q-num').textContent = `${curIdx + 1} / ${total}`;
  document.getElementById('score-live').textContent = `✅ ${score}`;
  document.getElementById('q-lbl').textContent = `Сұрақ ${curIdx + 1}`;
  document.getElementById('q-text').textContent = question.question;
  
  const progressPercent = (answeredCount / total) * 100;
  document.getElementById('prog-bar').style.width = progressPercent + '%';
  
  const indices = shuffleArray([0, 1, 2, 3, 4]);
  const container = document.getElementById('q-opts');
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
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = '';
}

function handleAnswer(btn, selectedIdx, correctIdx) {
  const allOptions = document.querySelectorAll('.opt');
  allOptions.forEach(opt => opt.classList.add('locked'));
  
  const isCorrect = selectedIdx === correctIdx;
  
  if (isCorrect) {
    btn.classList.add('correct');
    score++;
    document.getElementById('score-live').textContent = `✅ ${score}`;
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
  
  timerEl.textContent = `⏱ ${minutes}:${seconds}`;
  if (timeLeft <= 120) {
    timerEl.classList.add('danger');
  } else {
    timerEl.classList.remove('danger');
  }
}

// Нәтижені сақтау
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
  
  // Тізімді ұпай бойынша сұрыптау (ең жоғарыдан төменге)
  usersResults.sort((a, b) => b.score - a.score);
  
  localStorage.setItem('quizUsers', JSON.stringify(usersResults));
}

// Топ тізімін көрсету - Forte Bank стилінде
function showLeaderboard() {
  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.innerHTML = '';
  
  if (usersResults.length === 0) {
    leaderboardList.innerHTML = '<div style="text-align: center; padding: 40px; color: #8A9AAC; font-size: 16px;">Әлі ешкім тест тапсырған жоқ</div>';
  } else {
    usersResults.forEach((user, index) => {
      const row = document.createElement('div');
      row.className = 'leaderboard-item';
      
      let medal = '';
      if (index === 0) medal = '🥇';
      else if (index === 1) medal = '🥈';
      else if (index === 2) medal = '🥉';
      else medal = `${index + 1}.`;
      
      const percentage = user.total > 0 ? Math.round((user.score / user.total) * 100) : 0;
      
      row.innerHTML = `
        <div class="leaderboard-rank">${medal}</div>
        <div class="leaderboard-info">
          <span class="leaderboard-name">${user.name}</span>
          <span class="leaderboard-score">${user.score}/${user.total}</span>
          <span class="leaderboard-percent" style="background: ${percentage >= 70 ? '#00A3E0' : '#D92B2B'};">${percentage}%</span>
          <span class="leaderboard-date">${user.date || ''}</span>
        </div>
      `;
      
      leaderboardList.appendChild(row);
    });
  }
  
  showPage('page-leaderboard');
}

function finishTest(timeout) {
  clearInterval(timerID);
  clearTimeout(eyeTimer);
  
  const total = shuffled.length;
  const wrong = total - score;
  const percentage = Math.round((score / total) * 100);
  
  // Нәтижені сақтау
  saveResult(score, total);
  
  document.getElementById('rs-c').textContent = score;
  document.getElementById('rs-w').textContent = wrong;
  document.getElementById('rs-t').textContent = total;
  document.getElementById('res-big').textContent = `${score} / ${total}`;
  document.getElementById('res-pct').textContent = `${percentage}%`;
  document.getElementById('res-title').textContent = timeout ? 'Уақыт бітті!' : getResultTitle(percentage);
  document.getElementById('res-emoji').textContent = getResultEmoji(percentage, timeout);
  
  showPage('page-result');
  
  setTimeout(() => {
    document.getElementById('res-prog').style.width = percentage + '%';
  }, 100);
}

function getResultTitle(percentage) {
  if (percentage >= 90) return 'Тамаша нәтиже!';
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
  showNameInput(); // Атын қайта сұрау
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
  // Уақыт баннерін қосу (Forte Bank стилі)
  addTimeBanner();
  
  // Әр секунд сайын уақытты жаңарту
  setInterval(updateTimeInBanner, 1000);
  
  // Ауа райын әр 5 минут сайын жаңарту
  setInterval(() => {
    updateWeatherInBanner();
  }, WEATHER_FETCH_INTERVAL);
  
  // Қолжетімділікті тексеру
  setTimeout(() => {
    checkAccess();
  }, 1000);
  
  // Қолжетімділікті әр секунд сайын тексеру
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
  
  // Атын енгізу өрісіне Enter басқанда
  const nameInput = document.getElementById('name-input');
  if (nameInput) {
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveUserNameAndStart();
    });
  }
  
  lockContent();
});

window.checkPw = checkPw;
window.saveUserNameAndStart = saveUserNameAndStart;
window.showLeaderboard = showLeaderboard;
window.toggleDark = toggleDark;
window.toggleWarm = toggleWarm;
window.toggleFont = toggleFont;
window.retakeTest = retakeTest;
window.goHome = goHome;

// ============ ЖЕТІ МУЗЫКА (соңында Shiza - SHYM тікелей эфир) ============
let kairatPlayer = null;
let densPlayer = null;
let shizaPlayer = null;        // 1950's Jazz нұсқасы
let shizaLivePlayer = null;    // Тікелей эфир нұсқасы (жаңа)
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
    'XYIYpFZ59wU',      // 1. Shiza – SHYM (1950'S Jazz & Soul Version)
    'uZy0-fQOBj8',      // 2. Қайрат Нұртас – Ол сен емес
    '5KDZD86MWYU',      // 3. 9 Грамм – ДЭНС
    'XwImCmmEDgA',      // 4. 6ellucci – KZO
    'AH9zEI9Hx-0',      // 5. 6ELLUCCI & JUNIOR - KZO II
    'FNKFpuoM1OY',      // 6. Guf & BALLER feat. V $ X V PRiNCE – Шараут
    'cSxNzTebJyY'       // 7. Shiza – SHYM (ТІКЕЛЕЙ ЭФИР) - ЕҢ СОҢЫНДА
];
let currentTrackIndex = 0;
let playlistInterval = null;

// YouTube API жүктеу
function loadMusicYouTubeAPI() {
  if (document.getElementById('music-youtube-api')) return;
  
  const tag = document.createElement('script');
  tag.id = 'music-youtube-api';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.body.appendChild(tag);
}

// YouTube API дайын болғанда
window.onYouTubeIframeAPIReady = function() {
  // 1. Shiza (1950's Jazz) плеері
  if (!shizaPlayer) {
    shizaPlayer = new YT.Player('shiza-youtube-player', {
      height: '0',
      width: '0',
      videoId: currentPlaylist[0],
      playerVars: {
        'autoplay': 0,
        'controls': 0,
        'disablekb': 1,
        'enablejsapi': 1,
        'fs': 0,
        'loop': 0
      },
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
  }
  
  // 2. Қайрат плеері
  if (!kairatPlayer) {
    kairatPlayer = new YT.Player('kairat-youtube-player', {
      height: '0',
      width: '0',
      videoId: currentPlaylist[1],
      playerVars: {
        'autoplay': 0,
        'controls': 0,
        'disablekb': 1,
        'enablejsapi': 1,
        'fs': 0,
        'loop': 0
      },
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
  }
  
  // 3. 9 Грамм плеері
  if (!densPlayer) {
    densPlayer = new YT.Player('dens-youtube-player', {
      height: '0',
      width: '0',
      videoId: currentPlaylist[2],
      playerVars: {
        'autoplay': 0,
        'controls': 0,
        'disablekb': 1,
        'enablejsapi': 1,
        'fs': 0,
        'loop': 0
      },
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
  }
  
  // 4. KZO плеері
  if (!kzoPlayer) {
    kzoPlayer = new YT.Player('kzo-youtube-player', {
      height: '0',
      width: '0',
      videoId: currentPlaylist[3],
      playerVars: {
        'autoplay': 0,
        'controls': 0,
        'disablekb': 1,
        'enablejsapi': 1,
        'fs': 0,
        'loop': 0
      },
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
  }
  
  // 5. KZO II плеері
  if (!kzo2Player) {
    kzo2Player = new YT.Player('kzo2-youtube-player', {
      height: '0',
      width: '0',
      videoId: currentPlaylist[4],
      playerVars: {
        'autoplay': 0,
        'controls': 0,
        'disablekb': 1,
        'enablejsapi': 1,
        'fs': 0,
        'loop': 0
      },
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
  }
  
  // 6. Шараут плеері
  if (!sharautPlayer) {
    sharautPlayer = new YT.Player('sharaut-youtube-player', {
      height: '0',
      width: '0',
      videoId: currentPlaylist[5],
      playerVars: {
        'autoplay': 0,
        'controls': 0,
        'disablekb': 1,
        'enablejsapi': 1,
        'fs': 0,
        'loop': 0
      },
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
  }
  
  // 7. Shiza Live (тікелей эфир) плеері
  if (!shizaLivePlayer) {
    shizaLivePlayer = new YT.Player('shiza-live-youtube-player', {
      height: '0',
      width: '0',
      videoId: currentPlaylist[6],
      playerVars: {
        'autoplay': 0,
        'controls': 0,
        'disablekb': 1,
        'enablejsapi': 1,
        'fs': 0,
        'loop': 1,        // Тікелей эфирді қайталау
        'playlist': currentPlaylist[6]
      },
      events: {
        'onStateChange': onLivePlayerStateChange
      }
    });
  }
};

// Тікелей эфир плеерінің күйі өзгергенде
function onLivePlayerStateChange(event) {
  // Тікелей эфир үшін аяқталу оқиғасын өшіреміз
  // Ол шексіз ойналады
}

// Плеер күйі өзгергенде (қарапайым бейнелер үшін)
function onPlayerStateChange(event) {
  // Егер видео аяқталса (state = 0)
  if (event.data === 0) {
    // Келесі трекке өту
    playNextTrack();
  }
}

// Келесі тректі ойнату
function playNextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
  
  // Барлық плеерлерді тоқтату
  if (shizaPlayer && shizaPlayer.stopVideo) shizaPlayer.stopVideo();
  if (kairatPlayer && kairatPlayer.stopVideo) kairatPlayer.stopVideo();
  if (densPlayer && densPlayer.stopVideo) densPlayer.stopVideo();
  if (kzoPlayer && kzoPlayer.stopVideo) kzoPlayer.stopVideo();
  if (kzo2Player && kzo2Player.stopVideo) kzo2Player.stopVideo();
  if (sharautPlayer && sharautPlayer.stopVideo) sharautPlayer.stopVideo();
  if (shizaLivePlayer && shizaLivePlayer.stopVideo) shizaLivePlayer.stopVideo();
  
  // Жаңа тректі ойнату
  if (currentTrackIndex === 0) {
    if (shizaPlayer && shizaPlayer.playVideo) {
      shizaPlayer.playVideo();
      isShizaPlaying = true;
      isKairatPlaying = false;
      isDensPlaying = false;
      isKzoPlaying = false;
      isKzo2Playing = false;
      isSharautPlaying = false;
      isShizaLivePlaying = false;
      updateMusicIcons();
    }
  } else if (currentTrackIndex === 1) {
    if (kairatPlayer && kairatPlayer.playVideo) {
      kairatPlayer.playVideo();
      isKairatPlaying = true;
      isShizaPlaying = false;
      isDensPlaying = false;
      isKzoPlaying = false;
      isKzo2Playing = false;
      isSharautPlaying = false;
      isShizaLivePlaying = false;
      updateMusicIcons();
    }
  } else if (currentTrackIndex === 2) {
    if (densPlayer && densPlayer.playVideo) {
      densPlayer.playVideo();
      isDensPlaying = true;
      isShizaPlaying = false;
      isKairatPlaying = false;
      isKzoPlaying = false;
      isKzo2Playing = false;
      isSharautPlaying = false;
      isShizaLivePlaying = false;
      updateMusicIcons();
    }
  } else if (currentTrackIndex === 3) {
    if (kzoPlayer && kzoPlayer.playVideo) {
      kzoPlayer.playVideo();
      isKzoPlaying = true;
      isShizaPlaying = false;
      isKairatPlaying = false;
      isDensPlaying = false;
      isKzo2Playing = false;
      isSharautPlaying = false;
      isShizaLivePlaying = false;
      updateMusicIcons();
    }
  } else if (currentTrackIndex === 4) {
    if (kzo2Player && kzo2Player.playVideo) {
      kzo2Player.playVideo();
      isKzo2Playing = true;
      isShizaPlaying = false;
      isKairatPlaying = false;
      isDensPlaying = false;
      isKzoPlaying = false;
      isSharautPlaying = false;
      isShizaLivePlaying = false;
      updateMusicIcons();
    }
  } else if (currentTrackIndex === 5) {
    if (sharautPlayer && sharautPlayer.playVideo) {
      sharautPlayer.playVideo();
      isSharautPlaying = true;
      isShizaPlaying = false;
      isKairatPlaying = false;
      isDensPlaying = false;
      isKzoPlaying = false;
      isKzo2Playing = false;
      isShizaLivePlaying = false;
      updateMusicIcons();
    }
  } else if (currentTrackIndex === 6) {
    if (shizaLivePlayer && shizaLivePlayer.playVideo) {
      shizaLivePlayer.playVideo();
      isShizaLivePlaying = true;
      isShizaPlaying = false;
      isKairatPlaying = false;
      isDensPlaying = false;
      isKzoPlaying = false;
      isKzo2Playing = false;
      isSharautPlaying = false;
      updateMusicIcons();
    }
  }
}

// Музыка контроллерін қосу - Forte Bank стилі
function addMusicControl() {
  // Жасырын плеерлер қосу
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
  
  // Контроллер бар ма?
  if (document.getElementById('music-control')) return;
  
  const musicControl = document.createElement('div');
  musicControl.id = 'music-control';
  musicControl.innerHTML = `
    <div style="
      position: fixed;
      bottom: 80px;
      right: 24px;
      z-index: 9999;
      background: #003057;
      border: none;
      padding: 10px 20px 10px 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0, 48, 87, 0.2);
      color: white;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.3s;
    " onclick="toggleMusic()">
      <div style="
        width: 36px;
        height: 36px;
        background: #00A3E0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        font-weight: bold;
      " id="music-icon">▶️</div>
      <div>
        <div style="font-weight: 600; font-size: 13px;" id="music-title">Shiza</div>
        <div style="font-size: 11px; opacity: 0.8;" id="music-subtitle">SHYM</div>
      </div>
    </div>
  `;
  document.body.appendChild(musicControl);
  
  loadMusicYouTubeAPI();
}

// Музыканы басқару
window.toggleMusic = function() {
  if (!shizaPlayer || !kairatPlayer || !densPlayer || !kzoPlayer || !kzo2Player || !sharautPlayer || !shizaLivePlayer) return;
  
  if (isShizaPlaying || isKairatPlaying || isDensPlaying || isKzoPlaying || isKzo2Playing || isSharautPlaying || isShizaLivePlaying) {
    // Тоқтату
    if (shizaPlayer && shizaPlayer.pauseVideo) shizaPlayer.pauseVideo();
    if (kairatPlayer && kairatPlayer.pauseVideo) kairatPlayer.pauseVideo();
    if (densPlayer && densPlayer.pauseVideo) densPlayer.pauseVideo();
    if (kzoPlayer && kzoPlayer.pauseVideo) kzoPlayer.pauseVideo();
    if (kzo2Player && kzo2Player.pauseVideo) kzo2Player.pauseVideo();
    if (sharautPlayer && sharautPlayer.pauseVideo) sharautPlayer.pauseVideo();
    if (shizaLivePlayer && shizaLivePlayer.pauseVideo) shizaLivePlayer.pauseVideo();
    isShizaPlaying = false;
    isKairatPlaying = false;
    isDensPlaying = false;
    isKzoPlaying = false;
    isKzo2Playing = false;
    isSharautPlaying = false;
    isShizaLivePlaying = false;
    document.getElementById('music-icon').innerHTML = '▶️';
    
    // Интервалды тазалау
    if (playlistInterval) {
      clearInterval(playlistInterval);
      playlistInterval = null;
    }
  } else {
    // Бастау - қай трек ойнап тұрғанын тексеру
    if (currentTrackIndex === 0) {
      shizaPlayer.playVideo();
      isShizaPlaying = true;
    } else if (currentTrackIndex === 1) {
      kairatPlayer.playVideo();
      isKairatPlaying = true;
    } else if (currentTrackIndex === 2) {
      densPlayer.playVideo();
      isDensPlaying = true;
    } else if (currentTrackIndex === 3) {
      kzoPlayer.playVideo();
      isKzoPlaying = true;
    } else if (currentTrackIndex === 4) {
      kzo2Player.playVideo();
      isKzo2Playing = true;
    } else if (currentTrackIndex === 5) {
      sharautPlayer.playVideo();
      isSharautPlaying = true;
    } else if (currentTrackIndex === 6) {
      shizaLivePlayer.playVideo();
      isShizaLivePlaying = true;
    }
    document.getElementById('music-icon').innerHTML = '⏸️';
    
    // Әр 3 секунд сайын трек атауын жаңарту
    if (!playlistInterval) {
      playlistInterval = setInterval(updateMusicInfo, 3000);
    }
  }
};

// Музыка ақпаратын жаңарту
function updateMusicInfo() {
  const titleEl = document.getElementById('music-title');
  const subtitleEl = document.getElementById('music-subtitle');
  
  if (isShizaPlaying) {
    titleEl.textContent = 'Shiza';
    subtitleEl.textContent = 'SHYM (1950s Jazz)';
    document.getElementById('music-control').querySelector('div[style*="position: fixed"]').style.background = '#003057';
  } else if (isKairatPlaying) {
    titleEl.textContent = 'Қайрат Нұртас';
    subtitleEl.textContent = 'Ол сен емес';
    document.getElementById('music-control').querySelector('div[style*="position: fixed"]').style.background = '#8B0000';
  } else if (isDensPlaying) {
    titleEl.textContent = '9 Грамм';
    subtitleEl.textContent = 'ДЭНС';
    document.getElementById('music-control').querySelector('div[style*="position: fixed"]').style.background = '#2C3E50';
  } else if (isKzoPlaying) {
    titleEl.textContent = '6ellucci';
    subtitleEl.textContent = 'KZO';
    document.getElementById('music-control').querySelector('div[style*="position: fixed"]').style.background = '#006400';
  } else if (isKzo2Playing) {
    titleEl.textContent = '6ELLUCCI & JUNIOR';
    subtitleEl.textContent = 'KZO II';
    document.getElementById('music-control').querySelector('div[style*="position: fixed"]').style.background = '#8B4513';
  } else if (isSharautPlaying) {
    titleEl.textContent = 'Guf & BALLER';
    subtitleEl.textContent = 'Шараут';
    document.getElementById('music-control').querySelector('div[style*="position: fixed"]').style.background = '#4B0082';
  } else if (isShizaLivePlaying) {
    titleEl.textContent = 'Shiza';
    subtitleEl.textContent = 'SHYM (LIVE)';
    document.getElementById('music-control').querySelector('div[style*="position: fixed"]').style.background = '#FF4500';
  }
}

// Иконкаларды жаңарту
function updateMusicIcons() {
  if (isShizaPlaying || isKairatPlaying || isDensPlaying || isKzoPlaying || isKzo2Playing || isSharautPlaying || isShizaLivePlaying) {
    document.getElementById('music-icon').innerHTML = '⏸️';
  } else {
    document.getElementById('music-icon').innerHTML = '▶️';
  }
  updateMusicInfo();
}

// Келесі трекке қолмен өту
window.nextTrack = function() {
  playNextTrack();
};

// Алдыңғы трекке қолмен өту
window.prevTrack = function() {
  currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
  
  // Барлық плеерлерді тоқтату
  if (shizaPlayer && shizaPlayer.stopVideo) shizaPlayer.stopVideo();
  if (kairatPlayer && kairatPlayer.stopVideo) kairatPlayer.stopVideo();
  if (densPlayer && densPlayer.stopVideo) densPlayer.stopVideo();
  if (kzoPlayer && kzoPlayer.stopVideo) kzoPlayer.stopVideo();
  if (kzo2Player && kzo2Player.stopVideo) kzo2Player.stopVideo();
  if (sharautPlayer && sharautPlayer.stopVideo) sharautPlayer.stopVideo();
  if (shizaLivePlayer && shizaLivePlayer.stopVideo) shizaLivePlayer.stopVideo();
  
  // Жаңа тректі ойнату
  if (currentTrackIndex === 0) {
    if (shizaPlayer && shizaPlayer.playVideo) {
      shizaPlayer.playVideo();
      isShizaPlaying = true;
      isKairatPlaying = false;
      isDensPlaying = false;
      isKzoPlaying = false;
      isKzo2Playing = false;
      isSharautPlaying = false;
      isShizaLivePlaying = false;
      updateMusicIcons();
    }
  } else if (currentTrackIndex === 1) {
    if (kairatPlayer && kairatPlayer.playVideo) {
      kairatPlayer.playVideo();
      isKairatPlaying = true;
      isShizaPlaying = false;
      isKairatPlaying = false;
      isDensPlaying = false;
      isKzoPlaying = false;
      isKzo2Playing = false;
      isSharautPlaying = false;
      isShizaLivePlaying = false;
      updateMusicIcons();
    }
  } else if (currentTrackIndex === 2) {
    if (densPlayer && densPlayer.playVideo) {
      densPlayer.playVideo();
      isDensPlaying = true;
      isShizaPlaying = false;
      isKairatPlaying = false;
      isKzoPlaying = false;
      isKzo2Playing = false;
      isSharautPlaying = false;
      isShizaLivePlaying = false;
      updateMusicIcons();
    }
  } else if (currentTrackIndex === 3) {
    if (kzoPlayer && kzoPlayer.playVideo) {
      kzoPlayer.playVideo();
      isKzoPlaying = true;
      isShizaPlaying = false;
      isKairatPlaying = false;
      isDensPlaying = false;
      isKzo2Playing = false;
      isSharautPlaying = false;
      isShizaLivePlaying = false;
      updateMusicIcons();
    }
  } else if (currentTrackIndex === 4) {
    if (kzo2Player && kzo2Player.playVideo) {
      kzo2Player.playVideo();
      isKzo2Playing = true;
      isShizaPlaying = false;
      isKairatPlaying = false;
      isDensPlaying = false;
      isKzoPlaying = false;
      isSharautPlaying = false;
      isShizaLivePlaying = false;
      updateMusicIcons();
    }
  } else if (currentTrackIndex === 5) {
    if (sharautPlayer && sharautPlayer.playVideo) {
      sharautPlayer.playVideo();
      isSharautPlaying = true;
      isShizaPlaying = false;
      isKairatPlaying = false;
      isDensPlaying = false;
      isKzoPlaying = false;
      isKzo2Playing = false;
      isShizaLivePlaying = false;
      updateMusicIcons();
    }
  } else if (currentTrackIndex === 6) {
    if (shizaLivePlayer && shizaLivePlayer.playVideo) {
      shizaLivePlayer.playVideo();
      isShizaLivePlaying = true;
      isShizaPlaying = false;
      isKairatPlaying = false;
      isDensPlaying = false;
      isKzoPlaying = false;
      isKzo2Playing = false;
      isSharautPlaying = false;
      updateMusicIcons();
    }
  }
};

// Бет жүктелгеннен кейін 3 секундтан соң қосу
setTimeout(addMusicControl, 3000);