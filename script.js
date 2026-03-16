'use strict';

// Глобалды айнымалылар
let cachedWeather = null;
let lastWeatherFetch = 0;
const WEATHER_FETCH_INTERVAL = 5 * 60 * 1000; // 5 минут

// Қызылорда ауа райын алу функциясы (кэшпен)
async function getKyzylordaWeather() {
  const now = Date.now();
  
  if (cachedWeather && (now - lastWeatherFetch < WEATHER_FETCH_INTERVAL)) {
    return cachedWeather;
  }
  
  try {
    const API_KEY = '4c249f5920cb4d78b1d183152261403';
    
    const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=Kyzylorda&lang=kk&aqi=no`);
    
    if (!response.ok) {
      throw new Error('Ауа райын алу мүмкін болмады');
    }
    
    const data = await response.json();
    
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

// Уақыт баннерін жаңарту
async function updateTimeBanner() {
  const { greeting, icon, currentTime, isNight } = getTimeInfo();
  
  let weather = null;
  if (isNight) {
    weather = await getKyzylordaWeather();
  }
  
  const banner = document.getElementById('time-banner');
  if (!banner) return;
  
  const greetingSpan = banner.querySelector('.greeting-text');
  const timeSpan = banner.querySelector('.time-text');
  const weatherDiv = banner.querySelector('.weather-info');
  
  if (greetingSpan) {
    greetingSpan.innerHTML = `${icon} ${greeting}`;
  }
  
  if (timeSpan) {
    timeSpan.textContent = currentTime;
  }
  
  if (weatherDiv && isNight && weather) {
    weatherDiv.innerHTML = `
      <span style="font-weight: 600;">🌙 Түнгі ауа райы</span>
      <span>Қызылорда</span>
      <img src="https:${weather.icon}" alt="icon" style="width: 24px; height: 24px;">
      <span style="font-weight: 700;">${weather.temp > 0 ? '+' : ''}${weather.temp}°C</span>
      <span style="opacity: 0.9;">${weather.condition}</span>
      <span>🌡️ ${weather.feelslike > 0 ? '+' : ''}${weather.feelslike}°C</span>
      <span>💧 ${weather.humidity}%</span>
      <span>🌬️ ${weather.wind} км/сағ</span>
    `;
  } else if (weatherDiv && !isNight) {
    weatherDiv.innerHTML = `
      <span style="font-weight: 600;">☀️ Қызылорда ауа райы</span>
      <a href="https://yandex.ru/pogoda/kk/kyzylorda" target="_blank" style="color: white; text-decoration: none; background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 30px; font-weight: 600;">
        Көру →
      </a>
    `;
  }
}

// Уақыт баннерін қосу
async function addTimeBanner() {
  const { greeting, icon, currentTime, isNight } = getTimeInfo();
  
  let weather = null;
  if (isNight) {
    weather = await getKyzylordaWeather();
  }
  
  const oldBanner = document.getElementById('time-banner');
  if (oldBanner) oldBanner.remove();
  
  const banner = document.createElement('div');
  banner.id = 'time-banner';
  
  let weatherHtml = '';
  if (isNight && weather) {
    weatherHtml = `
      <div class="weather-info" style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.15); padding: 5px 12px; border-radius: 50px;">
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
      <div class="weather-info" style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.15); padding: 5px 12px; border-radius: 50px;">
        <span style="font-weight: 600;">🌙 Қызылорда</span>
        <span>Ауа райы жүктелуде...</span>
      </div>
    `;
  } else if (!isNight) {
    weatherHtml = `
      <div class="weather-info" style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.15); padding: 5px 15px; border-radius: 50px;">
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
        <span class="greeting-text">${greeting}</span>
        <span class="time-text" style="opacity: 0.8; font-family: monospace;">${currentTime}</span>
      </div>
      ${weatherHtml}
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
}

// Уақытты автоматты түрде жаңарту
function startRealTimeClock() {
  addTimeBanner();
  setInterval(updateTimeBanner, 1000);
}

// Қолжетімділікті тексеру және бетті жаңарту
async function checkAccessAndUpdate() {
  const { isAccessAllowed, greeting, icon, currentTime, isNight } = getTimeInfo();
  
  let weather = null;
  if (isNight) {
    weather = await getKyzylordaWeather();
  }
  
  const accessDeniedPage = document.getElementById('page-access-denied');
  
  if (!isAccessAllowed) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    if (!accessDeniedPage) {
      const newPage = document.createElement('div');
      newPage.id = 'page-access-denied';
      newPage.className = 'page active';
      newPage.style.cssText = `
        display: flex !important;
        min-height: 100vh;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #0b1a2e, #1a2f3f);
        padding: 20px;
        font-family: 'Nunito', sans-serif;
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
      
      newPage.innerHTML = `
        <div style="
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 30px;
          padding: 40px;
          max-width: 550px;
          width: 100%;
          text-align: center;
          color: white;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        ">
          <div style="font-size: 80px; margin-bottom: 20px;" id="access-icon">${icon}</div>
          <h1 style="font-size: 32px; margin-bottom: 15px;">Қолжетімділік шектелген</h1>
          <p style="font-size: 16px; margin-bottom: 20px; opacity: 0.9;">Сайт таңғы 7:00-ден кешкі 22:00-ге дейін жұмыс істейді</p>
          
          <div style="
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 15px;
            margin-bottom: 20px;
            font-size: 20px;
          " id="access-time">
            ${icon} ${greeting} Қазір ${currentTime}
          </div>
          
          <div id="access-weather">${weatherDisplay}</div>
          
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
          
          <p style="font-size: 18px; margin-top: 25px; opacity: 0.8;" id="access-footer">Қайта келіңіз! ${icon}</p>
        </div>
      `;
      
      document.body.appendChild(newPage);
    } else {
      accessDeniedPage.classList.add('active');
      accessDeniedPage.style.display = 'flex';
      
      const iconEl = document.getElementById('access-icon');
      const timeEl = document.getElementById('access-time');
      const weatherEl = document.getElementById('access-weather');
      const footerEl = document.getElementById('access-footer');
      
      if (iconEl) iconEl.textContent = icon;
      if (timeEl) timeEl.innerHTML = `${icon} ${greeting} Қазір ${currentTime}`;
      if (footerEl) footerEl.innerHTML = `Қайта келіңіз! ${icon}`;
      
      if (weatherEl && isNight && weather) {
        weatherEl.innerHTML = `
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
      }
    }
    return false;
  }
  
  return true;
}

// Уақытты тексеру
function startTimeChecker() {
  checkAccessAndUpdate();
  setInterval(checkAccessAndUpdate, 1000);
}

// ============ БІРІНШІ ТЕСТІ: Қателерді анықтау (75 сұрақ) ============
const QUESTIONS = [
  {question:"Кодтағы қателерді анықтау процесі қалай аталады?",options:["Компиляция","Дебаггинг","Тестілеу","Орындау","Инсталляция"],correct:1},
  {question:"Синтаксистік қате дегеніміз не?",options:["Логикалық қате","Бағдарлама баяу жұмыс істеуі","Жазылу ережесінің бұзылуы","Дерекқор қатесі","Дизайн қатесі"],correct:2},
  {question:"Логикалық қате кезінде:",options:["Бағдарлама мүлде ашылмайды","Қате нәтиже береді","Компьютер өшеді","Файл жойылады","Желі үзіледі"],correct:1},
  {question:"Runtime error қашан пайда болады?",options:["Код жазу кезінде","Компиляция кезінде","Орындау кезінде","Жобалау кезінде","Орнату кезінде"],correct:2},
  {question:"Debugger не үшін керек?",options:["Код жазу","Қате іздеу","Сурет салу","Файл сақтау","Интернетке шығу"],correct:2},
  {question:"print() функциясы не үшін қолданылады?",options:["Қате жою","Мәлімет шығару","Файл ашу","Желіге қосылу","Код жою"],correct:1},
  {question:"try-except блогы не үшін керек?",options:["Цикл құру","Шарт жазу","Қателерді өңдеу","Айнымалы құру","Файл жою"],correct:2},
  {question:"IDE дегеніміз:",options:["Операциялық жүйе","Бағдарламалау ортасы","Вирус","Драйвер","Сервер"],correct:1},
  {question:"Infinite loop дегеніміз:",options:["Бір рет орындалатын цикл","Шексіз цикл","Қате код","Айнымалы","Функция"],correct:1},
  {question:"Null мәні дегеніміз:",options:["0 саны","Бос мән","1 саны","Теріс сан","Символ"],correct:1},
  {question:"Логикалық қатені табудың ең тиімді жолы:",options:["Компьютерді өшіру","Кодты қайта көшіру","Қадамдап орындау (step-by-step)","Интернетті тексеру","Принтер қосу"],correct:2},
  {question:"Синтаксистік қате табылғанда:",options:["Бағдарлама дұрыс жұмыс істейді","Компиляция тоқтайды","Нәтиже баяу шығады","Файл ашылады","Желі үзіледі"],correct:1},
  {question:"Айнымалы анықталмаса қандай қате шығады?",options:["Type error","Name error","Index error","Logic error","Value error"],correct:1},
  {question:"Массив шегінен тыс элементке жүгінсек:",options:["Name error","Type error","Index error","Syntax error","Key error"],correct:2},
  {question:"Type error қашан болады?",options:["Қате атау жазылса","Түрлер сәйкес келмесе","Индекс дұрыс болмаса","Цикл тоқтаса","Файл жабылса"],correct:1},
  {question:"Қатені қайталамау үшін не істеу керек?",options:["Кодты тестілеу","Өшіру","Компьютер ауыстыру","Интернет қосу","Бағдарламаны жасыру"],correct:0},
  {question:"assert командасы не үшін қолданылады?",options:["Файл ашу","Мәлімет басу","Шартты тексеру","Цикл жасау","Айнымалы жою"],correct:2},
  {question:"Лог-файл не үшін керек?",options:["Музыка сақтау","Қате жазбаларын сақтау","Видео көру","Сурет салу","Интернетке қосылу"],correct:1},
  {question:"Refactoring дегеніміз:",options:["Кодты жою","Код құрылымын жақсарту","Қате қосу","Файл форматтау","Компьютер тазалау"],correct:1},
  {question:"Unit тестілеу не тексереді?",options:["Бүкіл жүйені","Бір модульді","Серверді","Интернетті","Дизайнды"],correct:1},
  {question:"ValueError қашан пайда болады?",options:["Айнымалы жоқ болса","Мәлімет түрі сәйкес келмесе","Дұрыс емес мән енгізілсе","Индекс артық болса","Файл табылмаса"],correct:2},
  {question:"FileNotFoundError қашан шығады?",options:["Айнымалы жоқ болса","Файл табылмаса","Түр сәйкес келмесе","Шарт қате болса","Цикл тоқтаса"],correct:1},
  {question:"except блогы қай кезде орындалады?",options:["Қате болмаса","Қате пайда болса","Әрқашан","Цикл ішінде ғана","Функция алдында"],correct:1},
  {question:"finally блогы:",options:["Ешқашан орындалмайды","Қате болса ғана орындалады","Әрқашан орындалады","Цикл жасайды","Айнымалы құрады"],correct:2},
  {question:"Логикалық қателерді табу үшін:",options:["Кодты талдау керек","Компьютер ауыстыру керек","Файлды жою керек","Интернетті өшіру керек","Принтер қосу керек"],correct:1},
  {question:"Breakpoint дегеніміз:",options:["Қате түрі","Бағдарламаны тоқтату нүктесі","Айнымалы","Цикл","Файл"],correct:1},
  {question:"Stack trace нені көрсетеді?",options:["Дизайнды","Қате шыққан жолды","Интернет жылдамдығын","Файл өлшемін","Процессор түрін"],correct:1},
  {question:"Тестілеудің мақсаты:",options:["Қате табу","Кодты жасыру","Компьютерді өшіру","Желі қосу","Файлды көшіру"],correct:0},
  {question:"Қай қате бағдарлама тоқтауына әкелуі мүмкін?",options:["Логикалық","Runtime error","Комментарий қатесі","Дизайн қатесі","Стиль қатесі"],correct:1},
  {question:"Debugging процесінің соңғы мақсаты:",options:["Кодты жою","Қатені түзету","Файлды жабу","Компьютерді өшіру","Интернетке қосылу"],correct:1},
  {question:"SyntaxError қай кезде шығады?",options:["Орындау кезінде","Компиляция кезінде","Интернет жоқ кезде","Файл жабылғанда","Цикл тоқтағанда"],correct:0},
  {question:"ZeroDivisionError қашан пайда болады?",options:["0-ге бөлгенде","Айнымалы жоқ болса","Түр сәйкес келмесе","Индекс артық болса","Файл ашылмаса"],correct:0},
  {question:"Кодтағы комментарий не үшін керек?",options:["Қате шығару","Түсіндіру жазу","Файл жою","Айнымалы құру","Цикл жасау"],correct:1},
  {question:"Қате табылғаннан кейін бірінші қадам:",options:["Кодты өшіру","Себебін анықтау","Компьютерді өшіру","Жаңа файл ашу","Интернет қосу"],correct:0},
  {question:"while циклі тоқтамаса, бұл:",options:["Syntax error","Логикалық қате","Type error","Name error","Value error"],correct:0},
  {question:"Функция дұрыс нәтиже бермесе:",options:["Логикалық қате бар","Компьютер бұзылған","Интернет жоқ","Файл ашылмаған","Драйвер жоқ"],correct:0},
  {question:"IDE-де қызыл сызық нені білдіреді?",options:["Дұрыс код","Синтаксистік қате","Интернет бар","Файл сақталған","Принтер қосылған"],correct:1},
  {question:"Exception дегеніміз:",options:["Айнымалы","Қате жағдай","Цикл","Функция","Сервер"],correct:1},
  {question:"Кодты кішкене бөліктермен тексеру:",options:["Инсталляция","Модульдік тексеру","Форматтау","Архивтеу","Дизайн"],correct:0},
  {question:"Қай әдіс қателерді азайтады?",options:["Тестілеу","Көшіру","Өшіру","Форматтамау","Компьютер ауыстыру"],correct:0},
  {question:"KeyError қашан пайда болады?",options:["Айнымалы жоқ болса","Сөздікте (dict) жоқ кілт қолданылса","0-ге бөлгенде","Түр сәйкес келмесе","Файл ашылмаса"],correct:1},
  {question:"ImportError дегеніміз:",options:["Айнымалы қатесі","Модуль жүктелмесе","Индекс қатесі","Логикалық қате","Шарт қатесі"],correct:1},
  {question:"Кодты қайта қарау (code review) мақсаты:",options:["Қате табу","Файл жою","Интернет қосу","Компьютер өшіру","Дизайн өзгерту"],correct:0},
  {question:"Traceback нені көрсетеді?",options:["Файл көлемін","Қате шыққан жолдар тізбегін","Интернет жылдамдығын","Компьютер жадын","Экран өлшемін"],correct:1},
  {question:"Бағдарламаны тест мәліметтермен тексеру:",options:["Архивтеу","Тестілеу","Орнату","Форматтау","Көшіру"],correct:1},
  {question:"Қай жағдайда try блогы орындалады?",options:["Қате болса ғана","Әрқашан бірінші орындалады","Ешқашан","Цикл ішінде ғана","Файл жабылғанда"],correct:1},
  {question:"except бірнешеу болуы мүмкін бе?",options:["Жоқ","Иә","Тек біреу","Тек циклде","Тек функцияда"],correct:1},
  {question:"Debugging құралдарының бірі:",options:["Paint","Debugger","Word","Excel","Browser"],correct:1},
  {question:"Кодтағы артық жолдарды жою:",options:["Refactoring","Компиляция","Инсталляция","Архивтеу","Көшіру"],correct:0},
  {question:"Қате табылған соң не істеу керек?",options:["Елемеу","Түзету","Жою","Компьютер өшіру","Файл жабу"],correct:1},
  {question:"AttributeError қашан шығады?",options:["0-ге бөлгенде","Объектіде жоқ қасиет шақырылса","Индекс артық болса","Файл табылмаса","Айнымалы жоқ болса"],correct:1},
  {question:"Memory error себебі:",options:["Жад жетіспеуі","Интернет жоқ","Синтаксис қате","Индекс үлкен","Файл жабық"],correct:0},
  {question:"Қай әдіс қатені тез табуға көмектеседі?",options:["Кодты форматтау","Қадамдап орындау","Файл көшіру","Өшіру","Архивтеу"],correct:1},
  {question:"Тест кейс дегеніміз:",options:["Қате түрі","Тексеру сценарийі","Айнымалы","Файл","Сервер"],correct:1},
  {question:"Boundary value testing не тексереді?",options:["Орта мәндерді","Шектік мәндерді","Тек мәтінді","Дизайнды","Интернетті"],correct:1},
  {question:"Infinite recursion себебі:",options:["Шарт жоқ","Файл жоқ","Интернет жоқ","Индекс артық","Түр сәйкес емес"],correct:0},
  {question:"raise командасы:",options:["Қате тастау","Цикл құру","Айнымалы жою","Файл ашу","Мәлімет шығару"],correct:0},
  {question:"Қате туралы хабарлама не үшін маңызды?",options:["Уақыт өткізу","Себебін түсіну","Дизайн көру","Файл өлшеу","Интернет тексеру"],correct:1},
  {question:"Regression testing мақсаты:",options:["Жаңа қате қосу","Бұрынғы қателер қайталанбауын тексеру","Файл жою","Компьютер жаңарту","Дизайн өзгерту"],correct:1},
  {question:"Кодты жиі сақтау не үшін керек?",options:["Қате көбейту","Мәлімет жоғалтпау","Интернет қосу","Форматтау","Архивтеу"],correct:1},
  {question:"Логикалық қате табудың бір жолы:",options:["Нәтижені күтілген мәнмен салыстыру","Компьютер өшіру","Файл жою","Интернет қосу","Архивтеу"],correct:0},
  {question:"Exception handling мақсаты:",options:["Бағдарламаны тоқтату","Қатені басқару","Файл ашу","Айнымалы жою","Дизайн жасау"],correct:0},
  {question:"Кодтың оқылуын жақсарту:",options:["Түсінікті атаулар қолдану","Барлығын бір жолға жазу","Комментарийсіз жазу","Форматтамау","Қысқарту"],correct:0},
  {question:"Unit test қашан жазылады?",options:["Кодтан кейін","Кодпен бірге","Ешқашан","Орнатқанда","Архивтегенде"],correct:1},
  {question:"Bug дегеніміз:",options:["Дұрыс код","Қате","Сервер","Айнымалы","Файл"],correct:1},
  {question:"Debugging мақсаты:",options:["Қате қосу","Қате табу және түзету","Файл жою","Интернет өшіру","Компьютер ауыстыру"],correct:0},
  {question:"try блогында не жазылады?",options:["Қауіпті код","Комментарий","Айнымалы аты","Файл аты","Дизайн"],correct:4},
  {question:"finally көбіне не үшін қолданылады?",options:["Файл жабу","Қате шығару","Цикл құру","Айнымалы жою","Дизайн жасау"],correct:0},
  {question:"Кодты тексерудің автоматты түрі:",options:["Manual testing","Automated testing","Архивтеу","Форматтау","Көшіру"],correct:0},
  {question:"Stack overflow себебі:",options:["Терең рекурсия","Интернет жоқ","Файл жоқ","Индекс үлкен","Түр сәйкес емес"],correct:0},
  {question:"Input тексеру не үшін қажет?",options:["Қате болдырмау","Интернет қосу","Файл жою","Дизайн өзгерту","Архивтеу"],correct:0},
  {question:"Қате шыққан жолды табу үшін:",options:["Traceback қарау","Компьютер өшіру","Файл жабу","Интернет тексеру","Архивтеу"],correct:1},
  {question:"Version control не үшін керек?",options:["Код нұсқаларын сақтау","Файл жою","Интернет қосу","Дизайн өзгерту","Компьютер өшіру"],correct:0},
  {question:"Git дегеніміз:",options:["Операциялық жүйе","Нұсқа бақылау жүйесі","Сервер","Айнымалы","Қате түрі"],correct:1},
  {question:"Merge conflict қашан болады?",options:["Бір файлды екі адам өзгерткенде","Интернет жоқ кезде","Файл жойылғанда","Компьютер өшкенде","Индекс үлкенде"],correct:0},
  {question:"Test coverage нені көрсетеді?",options:["Код көлемін","Тестпен қамтылған пайызды","Интернет жылдамдығын","Файл өлшемін","Дизайн сапасын"],correct:1},
  {question:"Кодты форматтау құралы:",options:["Linter","Printer","Scanner","Monitor","Router"],correct:0},
  {question:"Static analysis қашан жасалады?",options:["Орындаусыз","Орындау кезінде","Интернетпен","Серверде","Принтерде"],correct:0},
  {question:"Dynamic testing қашан жасалады?",options:["Орындау кезінде","Код жазғанда","Форматтағанда","Архивтегенде","Дизайнда"],correct:0},
  {question:"Code smell дегеніміз:",options:["Жақсы код","Жаман құрылым белгісі","Қате хабарлама","Айнымалы","Файл"],correct:0},
  {question:"Refactoring кезінде:",options:["Функционал өзгермейді","Жаңа қате қосылады","Код жойылады","Интернет қосылады","Компьютер өшеді"],correct:0},
  {question:"Қай тест жүйені толық тексереді?",options:["Unit test","Integration test","System test","Static test","Manual test"],correct:2},
  {question:"Integration test не тексереді?",options:["Бір функцияны","Модульдердің байланысын","Дизайнды","Интернетті","Файлды"],correct:1},
  {question:"Manual testing дегеніміз:",options:["Қолмен тексеру","Автоматты тексеру","Архивтеу","Форматтау","Орнату"],correct:0},
  {question:"Automated testing артықшылығы:",options:["Жылдамдық","Қате көбейту","Файл жою","Интернет өшіру","Дизайн бұзу"],correct:0},
  {question:"Қате қайталанса:",options:["Себебін терең талдау керек","Елемеу керек","Файл жою керек","Компьютер ауыстыру керек","Интернет қосу керек"],correct:0},
  {question:"Clean code мақсаты:",options:["Оқылуы жеңіл код","Ұзын код","Қате код","Форматсыз код","Архивтелген код"],correct:0},
  {question:"DRY принципі:",options:["Қайталауды азайту","Қате қосу","Файл жою","Интернет қосу","Дизайн өзгерту"],correct:0},
  {question:"SOLID принциптері:",options:["Дизайн қағидалары","Қате түрлері","Файл атауы","Интернет түрі","Айнымалы атауы"],correct:0},
  {question:"Код сапасын арттыру үшін:",options:["Тестілеу жүргізу","Комментарийсіз жазу","Барлығын қысқарту","Форматтамау","Тексермеу"],correct:0},
  {question:"Exception түрін нақты көрсету:",options:["Жақсы тәжірибе","Қате","Міндет емес","Интернетке байланысты","Файлға байланысты"],correct:0},
  {question:"Логикалық қате көбіне:",options:["Есептеуде болады","Интернетте болады","Файлда болады","Серверде болады","Принтерде болады"],correct:0},
  {question:"Кодты қайта пайдалану:",options:["Қайта қолдану","Жою","Архивтеу","Форматтау","Өшіру"],correct:3},
  {question:"CI/CD мақсаты:",options:["Автоматты құрастыру және тексеру","Файл жою","Интернет өшіру","Дизайн өзгерту","Компьютер өшіру"],correct:0},
  {question:"Bug report құрамына кіреді:",options:["Қате сипаттамасы","Музыка","Видео","Сурет салу","Архив"],correct:0},
  {question:"Қате табылған орта:",options:["Production","Test","Dev","Барлығы мүмкін","Ешқайсысы"],correct:3},
  {question:"Code review кім жасайды?",options:["Басқа бағдарламашы","Клиент","Дизайнер","Қолданушы","Принтер"],correct:3},
  {question:"Тестілеу кезеңі:",options:["Жобалау алдында","Әзірлеу кезінде және кейін","Орнатудан кейін ғана","Архивтегенде","Форматтағанда"],correct:1},
  {question:"Қатені түзеткен соң:",options:["Қайта тестілеу керек","Елемеу керек","Файл жою керек","Интернет өшіру керек","Компьютер ауыстыру керек"],correct:0},
  {question:"Бағдарламалық код сапасының негізгі көрсеткіші:",options:["Қатесіз жұмыс","Ұзындығы","Түсі","Форматы","Архив көлемі"],correct:0}
];

// ============ ЕКІНШІ ТЕСТІ: Микропроцессор (80+ сұрақ) ============
const MICRO_QUESTIONS = [
  {question:"Микропроцессор дегеніміз:",options:["Мәліметтерді ұзақ сақтайтын құрылғы","Ақпаратты енгізу құрылғысы","Бағдарламаны орындайтын орталық есептеу құрылғысы","Шығару құрылғысы","Қуат көзі"],correct:2},
  {question:"Микропроцессордың негізгі бөлігі:",options:["Монитор","Пернетақта","Арифметикалық-логикалық құрылғы","Принтер","Сканер"],correct:2},
  {question:"Тактілік жиілік нені анықтайды?",options:["Жад көлемін","Командалардың орындалу жылдамдығын","Порт санын","Қуат көзін","Экран өлшемін"],correct:1},
  {question:"Разрядтылық дегеніміз:",options:["Бір уақытта өңделетін бит саны","Жад түрі","Порт саны","Қуат мөлшері","Температура"],correct:0},
  {question:"Кэш-жадтың қызметі:",options:["Мәліметтерді басып шығару","Уақытша сақтау және жылдам қолжеткізу","Қуатты арттыру","Интернетке қосу","Дыбыс өңдеу"],correct:1},
  {question:"Басқару құрылғысы:",options:["Командаларды үйлестіреді","Дыбыс шығарады","Графика өңдейді","Қуат береді","Мәлімет сақтайды"],correct:0},
  {question:"ALU орындайды:",options:["Дыбыс жазу","Арифметикалық және логикалық операциялар","Интернет қосу","Қуат бөлу","Сурет салу"],correct:1},
  {question:"Көпядролы процессор артықшылығы:",options:["Бағасы төмен","Бірнеше процесті қатар орындау","Түсі жақсы","Салмағы аз","Корпусы кіші"],correct:1},
  {question:"Техпроцесс анықтайды:",options:["Транзистор өлшемін","Экран сапасын","Перне санын","Монитор көлемін","Қуат кабелін"],correct:0},
  {question:"Регистрлер қызметі:",options:["Уақытша мәлімет сақтау","Сурет шығару","Қуат беру","Дыбыс жазу","Интернет қосу"],correct:0},
  {question:"Шина (Bus) дегеніміз:",options:["Мәлімет алмасу жолы","Қуат көзі","Корпус бөлігі","Салқындатқыш","Экран"],correct:0},
  {question:"Адрестік шина қызметі:",options:["Мәлімет сақтау","Жад адресін беру","Дыбыс беру","Қуат тарату","Графика шығару"],correct:1},
  {question:"Деректер шинасы:",options:["Қуат береді","Мәлімет тасымалдайды","Температура өлшейді","Салқындатады","Интернет қосады"],correct:1},
  {question:"Басқару шинасы:",options:["Сигналдарды басқарады","Мәлімет сақтайды","Қуат береді","Сурет шығарады","Дыбыс шығарады"],correct:0},
  {question:"CISC архитектурасы сипатталады:",options:["Қарапайым командалар","Күрделі командалар жиыны","Жадсыз","Портсыз","Қуатсыз"],correct:1},
  {question:"RISC архитектурасы ерекшелігі:",options:["Ұзақ командалар","Қарапайым және жылдам командалар","Портсыз","Қуатсыз","Жадсыз"],correct:1},
  {question:"Interrupt дегеніміз:",options:["Қайта жүктеу","Процесті уақытша тоқтату сигналы","Қуат өшіру","Салқындату","Монитор қосу"],correct:1},
  {question:"Конвейерлеу дегеніміз:",options:["Командаларды кезең-кезеңмен орындау","Қуатты арттыру","Сурет өңдеу","Дыбыс жазу","Интернет қосу"],correct:0},
  {question:"Кэштің деңгейлері:",options:["L1, L2, L3","A, B, C","1,2","X,Y","I,O"],correct:0},
  {question:"SoC дегеніміз:",options:["Бір чиптегі жүйе","Қуат көзі","Монитор","Пернетақта","Салқындатқыш"],correct:0},
  {question:"Талаптарды анықтаудың бірінші кезеңі:",options:["Бағдарлама жазу","Мәселені талдау","Монтаж","Сату","Қаптау"],correct:1},
  {question:"Функционалдық талап:",options:["Орындайтын операциялар","Түс","Салмақ","Қорап","Баға"],correct:0},
  {question:"Функционалдық емес талап:",options:["Жылдамдық","Қосу","Азайту","Көбейту","Бөлу"],correct:0},
  {question:"Сенімділік көрсеткіші:",options:["Қате ықтималдығы","Түс","Қаптама","Кабель","Перне"],correct:0},
  {question:"Энергия тиімділігі:",options:["Қуатты аз тұтыну","Түс","Монитор","Қорап","Салмақ"],correct:0},
  {question:"Нақты уақыт жүйесінде маңызды:",options:["Дизайн","Уақытында жауап беру","Түс","Салмақ","Баға"],correct:1},
  {question:"Верификация дегеніміз:",options:["Талапқа сәйкестікті тексеру","Сату","Қаптау","Монтаж","Түсті өзгерту"],correct:0},
  {question:"Валидация дегеніміз:",options:["Пайдаланушы талабына сәйкестік","Монтаж","Қаптау","Сату","Түс"],correct:0},
  {question:"Масштабталу:",options:["Кеңейту мүмкіндігі","Түс","Қорап","Кабель","Салмақ"],correct:0},
  {question:"Интерфейс талабы:",options:["Қосылу порттары","Түс","Қаптама","Баға","Монтаж"],correct:0},
  {question:"Стандартқа сәйкестік:",options:["ISO талаптары","Түс","Салмақ","Қаптама","Монтаж"],correct:0},
  {question:"Қауіпсіздік талабы:",options:["Қорғаныс механизмі","Түс","Салмақ","Қорап","Кабель"],correct:0},
  {question:"Қуат шектеулі жүйе:",options:["Смартфон","Сервер","Суперкомпьютер","Жұмыс станциясы","ДК"],correct:0},
  {question:"Микроконтроллер қолданылуы:",options:["Автоматика","Монитор","Принтер","Кабель","Қорап"],correct:0},
  {question:"Тестілеу мақсаты:",options:["Қателерді табу","Сату","Қаптау","Түс","Монтаж"],correct:0},
  {question:"Құжаттандыру:",options:["Бақылау үшін қажет","Түс үшін","Салмақ үшін","Қорап үшін","Кабель үшін"],correct:0},
  {question:"Өнімділік көрсеткіші:",options:["Жиілік","Түс","Қорап","Кабель","Монитор"],correct:0},
  {question:"Температуралық режим:",options:["Жұмыс тұрақтылығы үшін","Түс үшін","Салмақ үшін","Қаптама","Кабель"],correct:0},
  {question:"Жылу тарату жүйесі қажет:",options:["Температураны тұрақтандыру","Түс","Монитор","Перне","Қаптама"],correct:0},
  {question:"Өнім сапасы анықталады:",options:["Талаптарға сәйкестікпен","Түспен","Салмақпен","Қаптамамен","Монтажбен"],correct:0},
  {question:"Алгоритм дегеніміз:",options:["Командалар тізбегі","Түс","Қорап","Кабель","Монитор"],correct:0},
  {question:"Алгоритм қасиеті:",options:["Анықтылық","Түс","Салмақ","Қаптама","Монитор"],correct:0},
  {question:"Сызықтық алгоритм:",options:["Командалар ретімен орындалады","Түс арқылы","Кабель арқылы","Қорап арқылы","Монитор арқылы"],correct:0},
  {question:"Тармақталған алгоритм:",options:["Шарт арқылы","Түс арқылы","Салмақ арқылы","Қаптама","Монитор"],correct:0},
  {question:"Циклдік алгоритм:",options:["Қайталау","Түс","Салмақ","Қаптама","Монитор"],correct:0},
  {question:"if операторы:",options:["Шарт тексеру","Шығару","Енгізу","Тоқтату","Бастау"],correct:0},
  {question:"for операторы:",options:["Қайталау","Тоқтату","Шығару","Енгізу","Бастау"],correct:0},
  {question:"Блок-схемада ромб:",options:["Шарт","Бастау","Соңы","Мәлімет","Процесс"],correct:0},
  {question:"Псевдокод:",options:["Алгоритмнің қарапайым жазбасы","Түс","Салмақ","Қаптама","Монитор"],correct:0},
  {question:"FSM дегеніміз:",options:["Ақырлы автомат","Қорап","Кабель","Монитор","Түс"],correct:0},
  {question:"Таймер қолдану:",options:["Уақытты бақылау","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Watchdog таймер:",options:["Жүйені қайта іске қосу","Дыбыс шығару","Сурет салу","Қуат беру","Мәлімет сақтау"],correct:0},
  {question:"Приоритет:",options:["Маңыздылық деңгейі","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Scheduler:",options:["Процестерді жоспарлаушы","Түс","Қорап","Кабель","Монитор"],correct:0},
  {question:"Semaphore:",options:["Синхронизация құралы","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Deadlock:",options:["Өзара бұғатталу","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Multithreading:",options:["Көп ағынды орындау","Түс","Қорап","Кабель","Монитор"],correct:0},
  {question:"DMA:",options:["Жадқа тікелей қолжеткізу","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Bootloader:",options:["Бастапқы жүктеу бағдарламасы","Түс","Қорап","Кабель","Монитор"],correct:0},
  {question:"Firmware:",options:["Құрылғының ішкі бағдарламасы","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"ARM архитектурасы жатады:",options:["RISC","CISC","GPU","DSP","FPGA"],correct:0},
  {question:"x86 архитектурасы:",options:["CISC","RISC","GPU","ASIC","SoC"],correct:0},
  {question:"Overclocking:",options:["Жиілікті арттыру","Түс өзгерту","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Throttling:",options:["Қызғанда жиілікті азайту","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"ECC жад:",options:["Қателерді түзету","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"GPIO:",options:["Жалпы мақсаттағы енгізу/шығару","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"UART:",options:["Тізбекті байланыс","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"SPI:",options:["Синхронды интерфейс","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"I2C:",options:["Екі сымды интерфейс","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"RTOS:",options:["Нақты уақыт ОЖ","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Latency:",options:["Кідіріс уақыты","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Throughput:",options:["Өткізу қабілеті","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Benchmark:",options:["Өнімділік сынағы","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Cache miss:",options:["Кэштен табылмау","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Branch prediction:",options:["Тармақты болжау","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Virtualization:",options:["Виртуалды машинаны қолдау","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Hyper-threading:",options:["Логикалық ядро технологиясы","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Power management:",options:["Қуатты басқару","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Sleep mode:",options:["Энергия үнемдеу режимі","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Reset сигналы:",options:["Қайта іске қосу","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Clock generator:",options:["Такт генераторы","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Embedded system:",options:["Енгізілген жүйе","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"ASIC:",options:["Арнайы мақсаттағы микросхема","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"FPGA:",options:["Бағдарламаланатын логикалық матрица","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Конвейердің артықшылығы:",options:["Өнімділікті арттыру","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Жүйелік сағат:",options:["Такт сигналы","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Адрес кеңістігі:",options:["Қолжетімді жад көлемі","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Жүктеу процесі:",options:["Инициализация","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Қауіпсіз жүктеу (Secure boot):",options:["Қорғалған іске қосу","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Жүйелік үзіліс:",options:["Interrupt","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Драйвер:",options:["Құрылғыны басқару бағдарламасы","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Процесс:",options:["Орындаудағы бағдарлама","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Жіп (Thread):",options:["Процестің бөлігі","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Жүйелік қате:",options:["Fault","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Қалпына келтіру механизмі:",options:["Reset","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Оптимизация:",options:["Тиімділікті арттыру","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Порт:",options:["Қосылу интерфейсі","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Сигнал:",options:["Басқару импульсі","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Деректер типі:",options:["Мәлімет форматы","Түс","Қаптама","Салмақ","Монитор"],correct:0},
  {question:"Жүйелік талдау мақсаты:",options:["Талаптарды дұрыс анықтау","Түс таңдау","Қаптама жасау","Салмақ өлшеу","Монитор таңдау"],correct:0}
];

// ============ ҮШІНШІ ТЕСТІ: 3 тест (80+ сұрақ) ============
const TEST3_QUESTIONS = [
  {question:"OLTP жүйелерінің негізгі қызметі мен бағыты қандай?",options:["Күнделікті транзакцияларды жылдам жазу","Пайдаланушының құпия сөзін шифрлап қою","Күрделі дерекке аналитика жасап отыруы","Интерфейстің жұмыс жылдамдығын арттыру","Базаның физикалық көшірмесін алып тұру"],correct:0},
  {question:"Деректер қоймасындағы 'Snowflake Schema' моделі?",options:["Fact кестесінде бағандардың өте көптігі","Өлшем кестесінің нормалану деңгейі жоғары","Іздеу жылдамдығының барынша жоғары болуы","Тек Oracle базасында қолданылу ерекшелігі","Резервтік көшірме жасаудың қарапайымдылығы"],correct:1},
  {question:"PostgreSQL-дегі VACUUM командасы не үшін қажет?",options:["Пайдаланушыларды жүйеге тіркеп отыру үшін","Базаны бұлтты серверге жылдам көшіру үшін","Сұраудың орындалу жоспарын қайта қарау үшін","Өшірілген жол орнын тазалап қайтару үшін","Кесте шеткі кілттерін жою және өңдеу үшін"],correct:3},
  {question:"ACID қасиетіндегі 'Consistency' нені білдіреді?",options:["Деректі визуалды түрде көрсетудің тәсілі","Желілік қосылудың арнайы техникалық жолы","Транзакцияның толық орындалуының шарты","Сұрауды оңтайландырудың нақты бір әдісі","Деректердің алдын ала қойылған ережеге сай болуы"],correct:4},
  {question:"ETL процесіндегі 'Load' кезеңінің басты міндеті:",options:["Деректерді қайнар көзден жинап алу жұмысы","Мәліметті Fact кестесіне жүктеп салу ісі","Деректі тазалау және нақты форматқа салу","Резервтік көшірмені архивке жіберіп тұру","Жаңа кестелерді автоматты түрде құрып алу"],correct:1},
  {question:"SQL тіліндегі DCL (Data Control Language) тобы:",options:["SELECT және INSERT командаларының жиыны","CREATE және ALTER командаларының жиыны","UPDATE және DELETE командаларының жиыны","GRANT және REVOKE командаларының жиыны","COMMIT және ROLLBACK командаларының жиыны"],correct:3},
  {question:"Деректер қоймасындағы 'Fact table' нені сақтайды?",options:["Тұтынушылардың аты мен мекенжайын жинау","Базаға кіруге рұқсаты бар адамдар тізімі","Сандық өлшем мен шеткі кілттердің жиыны","SQL сұрауларының орындалу журналын сақтау","Сервердің техникалық жағдайын бақылап тұру"],correct:2},
  {question:"PRIMARY KEY шектеуінің базадағы басты қызметі?",options:["Мәліметті шифрлау арқылы қорғап тұру ісі","Кестені сегменттерге бөліп орналастыруы","Жазбаның бірегейлігін қамтамасыз етуі","Деректі енгізудегі форматты тексеру ісі","Сұраудың орындалу уақытын қысқартып беру"],correct:2},
  {question:"GROUP BY операторы SQL-де не үшін қолданылады?",options:["Деректі экранға шығармас бұрын тізіп қою","Пайдаланушыны топқа бөліп басқару жұмысы","Бірдей мәнді жолдарды топтап өңдеу ісі","Кестені біріктірудегі шарттарды қою жолы","Индекстің құрылымын автоматты жаңартуы"],correct:2},
  {question:"Индекстеу (Indexing) процесінің басты кемшілігі?",options:["Деректі іздеу жылдамдығының төмендеп қалуы","SQL сұрау құрылымының күрделі болып келуі","Пайдаланушының базаға кіруінің кемуі ісі","Дерек қосу (INSERT) уақытын арттырып жіберу","Деректің бүтіндігі бұзылуының жиілеп кетуі"],correct:3},
  {question:"Деректер қоймасындағы 'Metadata' терминінің мәні?",options:["Сатылымның маңызды сандық көрсеткіші болуы","Пайдаланушының құпия сөздер журналы болуы","Деректердің құрылымы туралы ақпарат жиыны","Сервердің жұмыс уақытын өлшеу жүйесі болуы","Резервтік көшірменің сақталатын орны болуы"],correct:2},
  {question:"TRUNCATE TABLE командасының негізгі қасиеті:",options:["Кесте құрылымын базадан толық өшіріп тастау","Тек шартқа сай келетін жолдарды ғана жоюы","Кестені тез тазалап логты аз толтыру ісі","Пайдаланушы рұқсатын жойып жіберу жұмысы","Деректі басқа кестеге жылдам көшіру жолы"],correct:2},
  {question:"Нормализация (3NF) процесінің басты мақсаты?",options:["Сұраудың орындалу уақытын барынша азайтуы","Деректі визуалды ыңғайлы форматқа келтіру","Дерек қайталануын жою және тұтастықты сақтау","Кестелердің жалпы санын қысқартып отыруы","Резервтік көшірме жасауды жеңілдетіп беруі"],correct:2},
  {question:"PostgreSQL-дегі 'Schema' (Схема) ұғымының мағынасы:",options:["Мәліметтерді шифрлауға арналған алгоритмдер","Кестелер мен нысандардың логикалық тобы","Базаның физикалық дискідегі нақты мекені","Пайдаланушылардың желілік қосылу ережесі","Сервердің техникалық жабдықтар жиынтығы"],correct:1},
  {question:"GRANT SELECT ON users TO 'admin'; мағынасы:",options:["Админге кестені өшіруге рұқсат беріп қою","Админнен дерек көру құқығын алып тастау","Админге деректі көруге рұқсат беріп қою","Кестеге жаңа баған қосу құқығын беріп қою","Пайдаланушы паролін автоматты жаңартып тұру"],correct:2},
  {question:"Деректер қоймасындағы 'OLAP Cube' түсінігінің мәні:",options:["Мәліметтерді тек екі өлшемде сақтау тәсілі","Пайдаланушының базаға кіруін бақылау жолы","SQL сұрауларын автоматты түрде жазу жүйесі","Көпөлшемді деректерді жылдам талдау моделі","Резервтік көшірменің арнайы сақталу пішімі"],correct:3},
  {question:"INSERT INTO ... SELECT ... командасы не үшін қажет?",options:["Бір кестеден екіншіге деректі жылдам көшіру","Пайдаланушының құқықтарын басқа кестеге алу","Кестенің құрылымын автоматты түрде жаңарту","Деректерді физикалық дискіде оңтайландыру","SQL сұрауының нәтижесін экранға шығарып қою"],correct:0},
  {question:"'Data Mart' және 'Data Warehouse' айырмашылығы:",options:["Қолданылатын серверлік жабдықтың қуатында","Мәліметтерді шифрлаудың техникалық жолында","SQL сұрауларының орындалу жылдамдығында","Қамтитын пәндік аймағы мен дерек көлемінде","Пайдаланушы интерфейсінің дизайнындағы айырма"],correct:3},
  {question:"CHECK (salary > 0) шектеуінің (Constraint) рөлі:",options:["Жалақы өзгергенде әкімшіге хабарлау жұмысы","Жалақыны автоматты түрде есептеп шығаруы","Пайдаланушының жалақысын құпия сақтап тұру","Бағанға тек оң сандардың жазылуын қадағалау","Деректерді сыртқы файлға экспорттап отыруы"],correct:3},
  {question:"ETL процесіндегі 'Data Scrubbing' дегеніміз не?",options:["Деректерді бір серверден екіншіге өткізу","Қате немесе қайталанған деректі тазалауы","Мәліметті шифрлап қауіпсіздік деңгейін қою","Деректі архивке салып жадтан өшіріп тастау","Жаңа бағандарды автоматты түрде қосып қою"],correct:1},
  {question:"'Denormalization' процесі қай кезде қолданылады?",options:["Деректердің қайталануын барынша азайту үшін","Оқу сұрауларының өнімділігін арттыру үшін","Кесте санын көбейтіп байланысты орнату үшін","Деректердің бүтіндігін қатаң сақтап тұру үшін","Пайдаланушыларға рұқсат беруді жеңілдету үшін"],correct:1},
  {question:"MySQL-дегі EXPLAIN ANALYZE командасының міндеті:",options:["Кесте диаграммасын графикалық түрде сызуы","Пайдаланушының іс-әрекетін қадағалап отыру","Сұраудың нақты орындалу уақытын көрсетуі","Деректер базасындағы қателерді тез түзету","Резервтік көшірменің сапасын тексеріп беру"],correct:2},
  {question:"'Slowly Changing Dimensions' (SCD Type 1) әдісі:",options:["Ескі мәнді жаңа мәнмен толық ауыстырып жазу","Тарихты сақтау үшін жаңа жол қосып отыруы","Өзгерген деректі бөлек кестеге көшіріп қою","Мәліметті өшірмей тек бұғаттап қою жұмысы","Деректерді автоматты түрде шифрлап сақтауы"],correct:0},
  {question:"Деректер қоймасындағы 'Surrogate Key' дегеніміз:",options:["Пайдаланушының жүйеге кіруге арналған кілті","Басқа кестелермен байланыс орнататын шеткі кілт","Жүйелік мақсаттағы жасанды бірегей кілт болуы","Деректерді шифрлауға арналған арнайы крипто-кілт","Сұрауларды оңтайландыруға арналған индекс түрі"],correct:2},
  {question:"COALESCE(bonus, 0) функциясының техникалық мәні:",options:["Барлық бонустарды бір-біріне қосып шығару","NULL мәнін көрсетілген басқа мәнге алмастыру","Бонус мөлшерін автоматты түрде есептеп беру","Тек бірегей бонус мәндерін іріктеп көрсету","Бонус бағанының атын басқа атқа ауыстырып қою"],correct:1},
  {question:"SELECT ... FROM ... WHERE ... FOR UPDATE не істейді?",options:["Деректерді автоматты түрде жаңартып отыруы","Пайдаланушыға жазу құқығын біржола беріп қою","Кестедегі барлық жазбаларды өшіруге дайындау","Таңдалған жолдарды транзакция соңына дейін бұғаттау","Сұрау нәтижесін жаңа кестеге жазып сақтап қою"],correct:3},
  {question:"'Data Warehouse' архитектурасындағы 'Staging Area':",options:["Дайын есептер сақталатын арнайы виртуалды бет","Пайдаланушылардың базамен жұмыс істейтін орны","Деректі өңдеуге арналған уақытша сақтау орны","Резервтік көшірмелер тұратын қауіпсіз сервер","Индекстерді сақтауға арналған жедел жад бөлігі"],correct:2},
  {question:"ALTER TABLE students ADD COLUMN age INT; қызметі?",options:["Студенттер кестесін дерекқордан толықтай өшіру","Кестеге 'age' атты жаңа бағанды қосып орнату","Барлық студенттердің жасын автоматты есептеу","Пайдаланушының жасына шектеулер қойып отыру","Деректер базасының құрылымын файлға жазып алу"],correct:1},
  {question:"SQL-дегі 'Self Join' операциясы дегеніміз не?",options:["Кестенің өзін-өзіне біріктіріп дерек алуы","Екі түрлі базадағы кестелерді қосу жұмысы","Тек PRIMARY KEY арқылы кестелерді біріктіру","Пайдаланушының өзіне ғана рұқсат беріп қою","Деректерді біріктіру кезінде қатені тексеру"],correct:0},
  {question:"Деректер қоймасындағы 'Grain' түсінігі нені білдіреді?",options:["Резервтік көшірменің дискіде алатын нақты көлемі","Пайдаланушының жүйеге кіру жиілігінің көрсеткіші","Факт кестесіндегі деректің егжей-тегжейлі деңгейі","SQL сұрауларын орындаудың максималды уақыт шегі","Деректерді шифрлауға арналған кілттің ұзындығы"],correct:2},
  {question:"UNION мен UNION ALL операторларының айырмашылығы:",options:["UNION тек сандарды, UNION ALL мәтінді қосады","UNION қайталауды жояды, UNION ALL бәрін алады","UNION ALL сұрауды әлдеқайда баяу орындап шығу","Олардың арасында ешқандай техникалық айырма жоқ","UNION тек Oracle базасында ғана жұмыс істеп тұру"],correct:1},
  {question:"DROP және TRUNCATE командаларының айырмашылығы:",options:["DROP кестені жояды, TRUNCATE тек ішін тазалайды","TRUNCATE кестені жояды, DROP тек ішін тазалауы","Екі команда да кестенің құрылымын сақтап қалуы","DROP тек индекстерді өшіруге арналған тәсіл болу","TRUNCATE пайдаланушы рұқсатын жойып жіберу ісі"],correct:0},
  {question:"'Factless Fact Table' (Дерексіз факт кестесі) мақсаты:",options:["Тек сандық мәндерді сақтау үшін қолданылу жолы","Базадағы барлық бос кестелерді біріктіру жұмысы","Белгілі бір оқиғалардың орын алғанын тіркеуі","Резервтік көшірме жасауды жылдамдатудың тәсілі","Пайдаланушылардың іс-әрекетін жасырын бақылау"],correct:2},
  {question:"PostgreSQL-дегі SERIAL деректер типінің қызметі:",options:["Мәтіндік деректерді серия бойынша реттеп тізу","Автоматты түрде өсетін бүтін сандық мән беру","Деректерді шифрланған түрде сақтап отыру жолы","Тек уақыт пен күнді сақтауға арналған формат","Пайдаланушының жеке идентификаторын жасыруы"],correct:1},
  {question:"HAVING операторын қай жағдайда қолдану міндетті?",options:["Кестелерді INNER JOIN арқылы қосқан уақытта","Деректерді өсу ретімен сұрыптау қажет болса","Пайдаланушыға жаңа рұқсаттар берген кездегі іс","Агрегаттық функция нәтижесіне шарт қою үшін","Индекстерді қолмен жаңарту қажет болған кезде"],correct:3},
  {question:"'ETL' орнына 'ELT' қолданудың басты себебі неде?",options:["Деректер базасының қауіпсіздік деңгейін арттыру","Пайдаланушы интерфейсін барынша оңтайландыру","Заманауи бұлтты қоймалардың қуатын пайдалану","Резервтік көшірме жасау процесін баяулату үшін","SQL сұрауларын жазуды барынша жеңілдетіп алу"],correct:2},
  {question:"RECURSIVE CTE (Common Table Expressions) не үшін қажет?",options:["Иерархиялық құрылымдағы деректермен жұмыс істеу","Кестелерді автоматты түрде өшіріп қайта құруы","Пайдаланушының рұқсаттарын циклмен тексеріп тұру","Деректерді бірнеше серверге қатар жазып отыруы","Сұрау нәтижесін диаграмма түрінде көрсетіп беру"],correct:0},
  {question:"'Star Schema' моделіндегі 'Join' операцияларының саны:",options:["Snowflake моделіне қарағанда әлдеқайда көп болуы","Деректер базасындағы кестелердің жалпы санына тең","Пайдаланушылардың санына қарай өзгеріп отыруы","Snowflake моделіне қарағанда әлдеқайда аз болуы","Сұраудың күрделілігіне қарай автоматты есептелу"],correct:3},
  {question:"COMMIT және ROLLBACK командаларының басты мақсаты:",options:["Деректер базасының құрылымын толықтай өзгерту","Пайдаланушының базаға кіруін бақылау және шектеу","Транзакция нәтижесін сақтау немесе кері қайтару","SQL сұрауларын орындаудың жоспарын жасап алуы","Резервтік көшірмелерді автоматты түрде жаңарту"],correct:2},
  {question:"'Bitmap Index' қай жағдайда тиімдірек болып саналады?",options:["Бағандағы мәндердің барлығы бірегей болған кезде","Деректер үнемі өзгеріп және жаңарып тұрған сәтте","Мәндер саны аз (кардиналдығы төмен) бағандарда","Тек үлкен мәтіндік файлдарды іздеу қажет болса","Пайдаланушылардың саны өте көп болған жағдайда"],correct:2},
  {question:"Деректер базасындағы 'Deadlock' дегеніміз не?",options:["Пайдаланушының базаға кіре алмай қалуы","Кестенің физикалық деңгейде зақымдануы","Сұраудың шексіз циклге түсіп кетуі ісі","Базадағы барлық жазбалардың өшірілуі","Екі транзакцияның бірін-бірі бұғаттауы"],correct:4},
  {question:"GRANT командасының DCL құрамындағы рөлі:",options:["Кесте ішіндегі жазбаларды жаңартуы","Деректер базасының нысанын құруы","Транзакцияның нәтижесін сақтап қалуы","Пайдаланушыға арнайы құқық беруі","SQL сұрауының орындалуын жоспарлауы"],correct:3},
  {question:"'Fact table' мен 'Dimension' байланысы:",options:["Тек кесте бағандарының аттары арқылы","Пайдаланушының арнайы парольдары арқылы","Шеткі кілт (Foreign Key) қатынасы арқылы","Тек алфавиттік тәртіп бойынша сұрыптау","Базаның физикалық мекенжайы арқылы іске асады"],correct:2},
  {question:"COUNT(column_name) функциясының ерекшелігі:",options:["Кестедегі барлық жолдарды есептеп шығу","Бос (NULL) мәндерді де есептеп жазуы","Бос емес (NOT NULL) жолдарды санауы","Қайталанатын мәндерді алып тастауы","Арифметикалық орташаны есептеп беруі"],correct:2},
  {question:"SQL-дегі HAVING операторы қай жерде тұрады?",options:["FROM командасының алдында ғана","WHERE операторының ішіне кіріп","GROUP BY операторынан кейін","SELECT сөзінен бұрын жазылып","ORDER BY командасының соңында"],correct:2},
  {question:"UPDATE командасы кезіндегі WHERE шарты:",options:["Кестенің құрылымын өзгертіп жазуы","Пайдаланушының жаңа рұқсатын алуы","Деректерді басқа файлға экспорттау","Индекстің жылдамдығын арттырып беру","Тек сәйкес жолдарды өзгерту үшін"],correct:4},
  {question:"Деректерді 'Partitioning' (бөлімдеу) мақсаты:",options:["Үлкен кестелерді жылдам іздеу үшін","Пайдаланушының құпиясын сақтап тұру","Тек сандық мәндерді сақтауға арналу","Резервтік көшірменің сапасын арттыру","SQL сұрауын жазуды жеңілдетіп беру"],correct:0},
  {question:"PostgreSQL-де NULL мәні нені білдіреді?",options:["Мәннің 0-ге тең екендігінің дәлелі","Деректің өшірілгенінің белгісі ісі","Пайдаланушының рұқсатсыз қалғаны","Мәннің белгісіз екендігінің көрсеткіші","Кестедегі қателіктердің санының бары"],correct:3},
  {question:"'Data Warehouse' ішіндегі 'Granularity':",options:["Мәліметтің шифрлану деңгейінің мәні","Кестенің дискдегі нақты көлемдік орны","Пайдаланушының жүйедегі жасырын аты","SQL сұрауының ең төменгі күрделілігі","Деректің ең егжей-тегжейлі деңгейі"],correct:4},
  {question:"DELETE және TRUNCATE арасындағы айырма:",options:["TRUNCATE логикалық, DELETE физикалық","DELETE тек кестені өшіріп тастауы ісі","TRUNCATE тек сандарды өшіріп жазуы","DELETE транзакциялық, TRUNCATE емес","Екеуі де бірдей жұмыс істейтін тәсіл"],correct:3},
  {question:"Индекстердің 'B-Tree' түрінің басты міндеті:",options:["Мәндерді ретті түрде іздеу мен жинау","Деректерді физикалық дискіден өшіру","Пайдаланушының рұқсатын бақылау жолы","Тек мәтіндік ақпаратты сұрыптап тұру","Сұраудың нәтижесін графикалық құруы"],correct:0},
  {question:"Деректер базасындағы 'Locking' (бұғаттау):",options:["Пайдаланушының паролін жасыру әдісі","Деректің бүтіндігін сақтау механизмі","Кестенің құрылымын өзгертіп жазу жолы","Резервтік көшірменің сапасын тексеру","Деректі жылдам өшіруге арналған тәсіл"],correct:1},
  {question:"WHERE col LIKE 'A%' сұрауының нәтижесі:",options:["А әрпі бар барлық жолдарды алуы","А әрпінен басталатын сөздерді алуы","А әрпімен аяқталатын сөздерді табу","А әрпі жоқ барлық деректерді іріктеу","А әрпі бар бағанды жойып тастауы"],correct:1},
  {question:"DISTINCT операторының негізгі қызметі:",options:["Барлық мәндерді рет-ретімен тізу","Тек сандық мәндерді іріктеп көрсету","Бос (NULL) мәндерді жасырып қоюы","Қайталанатын деректерді алып тастау","Кестедегі барлық жолдарды санау ісі"],correct:3},
  {question:"Деректерді 'Backup' жасаудың мақсаты:",options:["Сұраудың жылдамдығын барынша арттыру","Пайдаланушының базаға кіруін тексеру","Кесте құрылымын графикалық сипаттау","Апаттық жағдайда қалпына келтіру ісі","Деректер базасын жаңа серверге қосу"],correct:3},
  {question:"'Logical Database Design' кезеңінің мақсаты:",options:["Сервердің дискіден алатын нақты орны","Базаның желідегі жұмыс істеу жылдамдығы","Кесте мен байланыстардың моделі болуы","Пайдаланушылардың жүйеге кіру паролі","Деректерді шифрлаудың қауіпсіздік жолы"],correct:2},
  {question:"AVG агрегаттық функциясы не істейді?",options:["Бағандағы барлық мәндердің қосындысы","Ең үлкен мәні бар жазбаны тауып беруі","Берілген мәндердің орташасын есептеу","Кестедегі барлық жолдарды санап шығу","Тек оң мәндерді іріктеп алып көрсету"],correct:2},
  {question:"Деректер қоймасындағы 'Dimension' кестелері:",options:["Тек сандық ақпаратты сақтауға арналады","Бизнес процестің сипаттамасын сақтау","Резервтік көшірмені бақылауға арналған","SQL сұрауын орындауды жеделдетіп тұру","Сервердің жұмыс істеу уақытын бақылау"],correct:1},
  {question:"DROP USER 'name'; командасының қызметі:",options:["Пайдаланушының құқығын алып тастауы","Пайдаланушыны базадан өшіріп тастау","Пайдаланушының құпия сөзін жаңартуы","Пайдаланушының істеген ісін тексеру ісі","Пайдаланушының рөлін өзгертіп жазуы"],correct:1},
  {question:"MIN функциясы кестеде не істейді?",options:["Бағандағы ең үлкен мәнді іздеу жолы","Бағандағы барлық санды қосып шығу ісі","Бағандағы ең кіші мәнді тауып беруі","Қайталанатын жазбаларды жойып тастау","Кестедегі барлық жолдарды санап қою"],correct:2},
  {question:"SQL-дегі CASE операторының атқаратын ісі:",options:["Кестелерді автоматты түрде біріктіруі","Пайдаланушыға рұқсат беріп тұру ісі","Шартты логикалық сұрауларды құруы","Резервтік көшірмені тексеруге арналу","Индекстерді жаңартып тұруға қолдану"],correct:2},
  {question:"Кесте құру кезіндегі DEFAULT мәнінің рөлі:",options:["Жазбаны автоматты түрде өшіріп қою","Мәні болмаған кездегі қателік шығару","Мәні жоқ болса автоматты мән қоюы","Бағанды тек сандық мәнге шектеп қою","Пайдаланушының атын жазып қою жолы"],correct:2},
  {question:"'Star Schema' моделінің негізгі кемшілігі:",options:["Іздеу сұрауларының өте баяу орындалуы","Пайдаланушының рұқсатын басқару қиындығы","Кестелердің арасындағы артық мән саны","Резервтік көшірмесін жасаудың өте қиындығы","Тек MySQL жүйесінде ғана қолданылуы"],correct:2},
  {question:"EXISTS операторының жұмыс істеу жолы:",options:["Бағандағы барлық мәндерді тексеріп шығу","Кестенің бар екенін тексеруге арналып","Ішкі сұрауда жазбаның барлығын тексеру","Пайдаланушының құқығын бақылап тұруы","Деректерді басқа серверге көшіріп тұру"],correct:2},
  {question:"'Database Schema' мен 'Database' айырмасы:",options:["Схема - логикалық топ, база – контейнер","База - логикалық топ, схема - контейнер","Олардың ешқандай айырмашылығы болмайды","Схема тек индекстерді сақтауға арналған","База тек кестелерді сақтауға арналған"],correct:0},
  {question:"Деректерді 'Import' етудің негізгі мақсаты:",options:["Кестелердің құрылымын өзгертіп жазуы","Пайдаланушы рұқсатын алып тастап тұру","Резервтік көшірме жасаудың тәсілі болу","Сыртқы деректі базаға көшіріп қоюы","SQL сұрауын жазуды жеңілдету ісі болу"],correct:3},
  {question:"SELECT * сұрауының басты қаупі:",options:["Сервердің жұмысын автоматты тоқтатуы","Пайдаланушы рұқсатын алып тастап тұру","Резервтік көшірме жасауды баяулату ісі","Кестеден артық деректерді алып шығу","Кестедегі деректерді өшіріп тастауы"],correct:3},
  {question:"SUM агрегаттық функциясы қайда қолданылады?",options:["Мәтіндік бағандарды алфавиттеу үшін","Сандық бағандардың қосындысы үшін","Кестедегі барлық жолдарды санау үшін","Ең үлкен мәнді іздеп табуға арналып","Кестелерді біріктіруге арналған тәсіл"],correct:1},
  {question:"SQL-дегі NULL мәнін қалай тексереді?",options:["WHERE col = NULL арқылы жазылып","WHERE col == NULL арқылы жазылып","WHERE col IS NOT NULL деп қана","WHERE col IS NULL деп жазылады","WHERE col LIKE NULL деп жазылады"],correct:3},
  {question:"'Factless Fact' кестесіне мысал ретінде:",options:["Сату сомасы сақталған кесте түрі","Пайдаланушының паролі тұрған кесте","Студенттің сабаққа қатысу кестесі","Резервтік көшірмелер тізімі кестесі","Индекстер сақталған жүйелік кесте"],correct:2},
  {question:"Деректерді тазалау (Data Cleansing) ісі:",options:["SQL сұрауларын жазудың тәсілі болу","Қателікті деректерді жою немесе түзеу","Кестедегі барлық жолды өшіріп тастау","Пайдаланушылардың рөлін бөліп шығу","Деректер базасын жаңалауға арналу"],correct:1},
  {question:"DESCRIBE table_name; командасы не істейді?",options:["Кесте ішіндегі бар деректі оқып шығу","Кестедегі барлық жолдарды санап қою","Кесте құрылымын сипаттап көрсетуі","Кестенің резервтік көшірмесін жасау","Кестедегі индекстерді тексеріп шығу"],correct:2},
  {question:"JOIN түріндегі 'Cross Join' қасиеті:",options:["Екі кестенің толық комбинациясын алу","Тек ортақ мәндері бар жолды алып қою","Сол жақ кестенің бар мәндерін алып алу","Оң жақ кестенің бар мәндерін алып алу","Тек Primary Key бойынша біріктіру ісі"],correct:0},
  {question:"'View' қолданудың басты артықшылығы:",options:["Деректер базасын жылдам өшіру жолы","Күрделі сұрауды жасырып көрсетуі","Пайдаланушының құпия сөзін тексеру","Резервтік көшірме жасауды жеңілдету","Кестелерді біріктіру жылдамдығын арттыру"],correct:1},
  {question:"Деректер базасындағы 'Trigger' қызметі:",options:["SQL сұрауын автоматты жазып отыру","Пайдаланушының құқығын бақылау ісі","Оқиға бойынша автоматты іске қосылу","Резервтік көшірмені тексеріп тұруы","Индекстерді жаңартып тұруға арналу"],correct:2},
  {question:"LIKE '%а' сұрауының нақты мағынасы:",options:["А әрпі бар барлық жолдарды алып шығу","А әрпінен басталатын сөздерді алып алу","А әрпімен аяқталатын сөздерді табу","А әрпі жоқ барлық жазбаларды іріктеу","А әрпі бар бағанды жойып тастау ісі"],correct:2},
  {question:"Деректерді топтау (Grouping) не үшін керек?",options:["Мәліметті алфавит бойынша тізіп қою","Кестені бірнеше файлға бөліп тастау","Топтар бойынша есептеулер жасау ісі","Пайдаланушыларды бөлектеуге арналу","Резервтік көшірмені жасауға арналу"],correct:2},
  {question:"'Dimension' кестелерінің негізгі ролі:",options:["Сатылым сомасын есептеп шығарып беру","SQL сұрауын орындау жылдамдығын алу","Деректерді контекстпен толықтыру ісі","Пайдаланушының жүйеге кіруін тексеру","Резервтік көшірмені сақтауға арналу"],correct:2},
  {question:"SQL-де NULL мәнін қалай есептейді?",options:["Ол мән автоматты түрде 0 болып келеді","Ол мән автоматты түрде 1 болып келеді","Ол ешқандай есептеуге қатыспайды","Ол мән автоматты түрде теріс болады","Ол мән қателік беріп жүйені тоқтатады"],correct:2},
  {question:"MAX агрегаттық функциясының атқаратын ісі:",options:["Бағандағы ең кіші мәнді тауып беруі","Бағандағы барлық санды қосып шығу ісі","Бағандағы ең үлкен мәнді іздеу жолы","Қайталанатын жазбаларды жойып тастау","Кестедегі барлық жолдарды санап қою"],correct:2},
  {question:"'Relational Online Analytical Processing' (ROLAP):",options:["Деректерді тек жедел жадта (In-memory) өңдеуі","Пайдаланушының сұрауларын графикалық бейнелеу","Аналитика үшін реляциялық базаны қолдануы","Резервтік көшірмені желі арқылы автоматты алу","SQL сұрауларын орындау алдында логқа жазуы"],correct:2},
  {question:"EXISTS бен IN операторларының басты айырмашылығы:",options:["IN операторы әлдеқайда жылдам жұмыс істеп тұруы","EXISTS тек сандық деректермен жұмыс істей алуы","EXISTS жазба табылғанда іздеуді бірден тоқтату","Олардың арасында ешқандай техникалық айырма жоқ","IN тек Oracle базасында ғана қолданылу ерекшелігі"],correct:2},
  {question:"'Data Warehouse Bus Architecture' (Kimball) мәні:",options:["Деректерді бір орталықтан ғана басқару жүйесі","Ортақ өлшемдер (Conformed Dimensions) қолдану","Пайдаланушыларды автобус арқылы тасымалдау ісі","Резервтік көшірме жасаудың желілік протоколы","SQL сұрауларын тізбекті түрде орындап отыруы"],correct:1},
  {question:"CREATE VIEW ... AS SELECT ... командасы не істейді?",options:["Деректер базасының физикалық көшірмесін жасау","Пайдаланушыға жаңа кесте құруға рұқсат беруі","SQL сұрауына негізделген виртуалды кесте құру","Кестенің құрылымын файлға сақтап қою жұмысы","Сұрау нәтижесін автоматты түрде басып шығару"],correct:2},
  {question:"'Multidimensional OLAP' (MOLAP) басты ерекшелігі:",options:["Деректерді арнайы көпөлшемді кубтарда сақтауы","Тек реляциялық кестелерді пайдалану артықшылығы","Пайдаланушылардың санын шектеп отыру мүмкіндігі","Резервтік көшірменің көлемін барынша азайтуы","SQL сұрауларын жазудың қажет еместігінде болу"],correct:0},
  {question:"DELETE пен DROP командаларының басты айырмашылығы:",options:["DROP тек жолдарды, DELETE бүкіл кестені жояды","DELETE тек жолдарды, DROP бүкіл кестені жояды","Екі команда да кестенің құрылымын сақтап қалуы","DELETE тек индекстерді өшіруге арналған тәсіл","DROP командасы транзакцияны автоматты бастауы"],correct:1},
  {question:"'Metadata Repository' деректер қоймасында не үшін керек?",options:["Пайдаланушылардың жеке құпия сөздерін сақтау","Сатылымдардың барлық сандық мәндерін жинау","Метадеректерді орталықтандырып сақтау және басқару","Резервтік көшірмелерді архивке жіберіп отыруы","SQL сұрауларының орындалу уақытын бақылап тұру"],correct:2},
  {question:"SELECT ... FROM ... WHERE id BETWEEN 1 AND 10; мағынасы:",options:["Идентификаторы тек 1 немесе 10-ға тең жазбалар","Идентификаторы 1-ден кіші барлық жазбаны табу","Идентификаторы 1-ден 10-ға дейінгі жазбаларды алу","Идентификаторы 10-нан үлкен жазбаларды іріктеу","Идентификаторы жоқ барлық жазбаларды базадан жою"],correct:2},
  {question:"'Functional Dependency' (Функционалды тәуелділік) мәні:",options:["Бағандардың бір-біріне физикалық қосылып тұруы","Бір атрибуттың мәні арқылы басқасын анықтау","Пайдаланушының базадағы функцияларын басқаруы","SQL сұрауындағы функциялардың орындалу реті","Резервтік көшірме жасау функциясының іске қосылуы"],correct:1},
  {question:"GRANT ALL PRIVILEGES ON database TO 'user'; мағынасы:",options:["Пайдаланушыны деректер базасынан біржола өшіру","Пайдаланушыға тек деректерді көруге рұқсат беру","Пайдаланушыға барлық құқықтарды толықтай беру","Пайдаланушының паролін автоматты түрде жаңарту","Базаның атауын пайдаланушы атына ауыстырып қою"],correct:2},
  {question:"'Data Cube' технологиясындағы 'Pivot' операциясы:",options:["Деректерді егжей-тегжейлі күйден жалпылауға өткізу","Резервтік көшірменің сақталу бағытын өзгертіп қою","Деректерді көрудің осьтерін (бұрышын) ауыстыру","SQL сұрауларының синтаксисін автоматты тексеру","Пайдаланушы рұқсаттарын басқа пайдаланушыға беру"],correct:2},
  {question:"CREATE UNIQUE INDEX ... командасының басты мақсаты:",options:["Кестедегі деректерді автоматты түрде шифрлап қою","Жазбаларды қосу жылдамдығын барынша арттырып беру","Бағанда қайталанатын мәндердің болмауын қадағалау","Резервтік көшірменің бірегей нөмірін жасап шығару","Пайдаланушының базаға тек бір рет кіруін қамтамасыз"],correct:2},
  {question:"'Surrogate Key' неге бизнес-кілттерден (мысалы, ЖСН) жақсы?",options:["Ол пайдаланушыға түсініктірек форматта болады","Оны қолмен өзгерту әлдеқайда оңай және жылдам","Ол бизнес-процестердің өзгеруіне тәуелсіз болады","Ол деректер базасында әлдеқайда көп орын алады","Ол SQL сұрауларын жазуды күрделендіре түсуі үшін"],correct:2},
  {question:"SELECT NOW(); функциясы SQL-де нені қайтарады?",options:["Пайдаланушының жүйеге кірген нақты уақытын","Деректер базасының құрылған күні мен сағатын","Сервердің ағымдағы күні мен нақты уақытын","SQL сұрауының орындалуына кеткен уақыт мөлшерін","Резервтік көшірме жасалатын келесі уақыт мерзімін"],correct:2},
  {question:"'Fact Table' ішіндегі 'Additive Measures' (Қосылатын өлшемдер):",options:["Тек қана мәтіндік сипаттамаларды білдіретін мәндер","Пайдаланушылардың санын есептейтін арнайы индекстер","Барлық өлшемдер бойынша қосуға болатын сандық мән","Резервтік көшірмеге қосымша қосылатын файлдар жиыны","SQL сұрауына қосылатын жаңа логикалық шарттар тобы"],correct:2},
  {question:"ROLLBACK TO SAVEPOINT sp1; командасы не істейді?",options:["Бүкіл транзакцияны басынан бастап толық кері қайтару","Пайдаланушының базадан шығуын тоқтатып, сақтап қалу","Транзакцияны тек 'sp1' белгісіне дейін кері қайтару","Деректер базасын кешегі күнгі қалпына келтіріп беру","Резервтік көшірмені 'sp1' файлына жазып сақтап қою"],correct:2},
  {question:"'Data Governance' саясатының дерекқордағы рөлі:",options:["Серверлік жабдықтарды сатып алуды жоспарлау жұмысы","Пайдаланушы интерфейсінің дизайнын бекіту және бақылау","Деректерді басқарудың ережелері мен стандартын орнату","Резервтік көшірмелерді физикалық дискілерге таратуы","SQL сұрауларының орындалу кезегін басқару және шектеу"],correct:2},
  {question:"ALTER TABLE ... MODIFY COLUMN ... (немесе ALTER TYPE) мақсаты:",options:["Бағандағы барлық деректерді біржола өшіріп тастау","Пайдаланушының бағанды көру құқығын уақытша бұғаттау","Бағанның деректер типін немесе ұзындығын өзгерту","Бағанның атауын басқа атауға автоматты түрде ауыстыру","Бағанға жаңа индекс құруды жүйеден талап етіп сұрау"],correct:2},
  {question:"'Heuristic Query Optimization' дегеніміз не?",options:["Сұрауды орындау үшін дайын ережелерді қолдану тәсілі","Пайдаланушының сұрауын кездейсоқ таңдап орындау ісі","Деректерді шифрлаудың ең күрделі математикалық жолы","Резервтік көшірме жасаудың ең тиімді уақытын таңдауы","SQL сұрауындағы қателерді өздігінен тауып түзеу жолы"],correct:0},
  {question:"'ALTER TABLE ... RENAME TO ... командасы не істейді?",options:["Кестедегі бағанның атын басқа атқа ауыстыруы","Пайдаланушының есімін базада автоматты жаңарту","Кестенің атауын жаңа атауға ауыстырып өзгерту","Деректер базасының атауын толықтай басқаруы","Индекстің атауын жүйелік деңгейде қайта жазуы"],correct:2}
];

// ============ ТЕСТІЛЕРГЕ ОРТАҚ ФУНКЦИЯЛАР ============
let currentTestType = 'errors'; // 'errors', 'micro', 'test3'
let shuffledErrors = [];
let shuffledMicro = [];
let shuffledTest3 = [];
let curIdx = 0;
let score = 0;
let timerID = null;
let timeLeft = 1800; // 30 минут
let eyeTimer = null;
let isDark = false;
let isWarm = false;
let isLarge = false;
let toastT = null;
let answeredCount = 0;

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

function checkPw() {
  const input = document.getElementById('pw-in');
  const value = input.value.trim();
  
  if (value === '7777') {
    document.getElementById('pw-err').classList.add('hidden');
    showPage('page-home');
    input.value = '';
  } else {
    document.getElementById('pw-err').classList.remove('hidden');
    document.getElementById('pw-wrap').classList.add('shake');
    setTimeout(() => document.getElementById('pw-wrap').classList.remove('shake'), 400);
    input.value = '';
    input.focus();
  }
}

function startErrorsTest() {
  currentTestType = 'errors';
  shuffledErrors = shuffleArray([...QUESTIONS]);
  curIdx = 0;
  score = 0;
  answeredCount = 0;
  timeLeft = 1800;
  
  document.getElementById('test-title').textContent = 'Қателерді анықтау тесті';
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

function startMicroTest() {
  currentTestType = 'micro';
  shuffledMicro = shuffleArray([...MICRO_QUESTIONS]);
  curIdx = 0;
  score = 0;
  answeredCount = 0;
  timeLeft = 1800;
  
  document.getElementById('test-title').textContent = 'Микропроцессор тесті';
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

function startTest3() {
  currentTestType = 'test3';
  shuffledTest3 = shuffleArray([...TEST3_QUESTIONS]);
  curIdx = 0;
  score = 0;
  answeredCount = 0;
  timeLeft = 1800;
  
  document.getElementById('test-title').textContent = '3 тест';
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
  let questions = [];
  if (currentTestType === 'errors') questions = shuffledErrors;
  else if (currentTestType === 'micro') questions = shuffledMicro;
  else questions = shuffledTest3;
  
  if (!questions.length || curIdx >= questions.length) return;
  
  const question = questions[curIdx];
  const total = questions.length;
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
    let questions = [];
    if (currentTestType === 'errors') questions = shuffledErrors;
    else if (currentTestType === 'micro') questions = shuffledMicro;
    else questions = shuffledTest3;
    
    if (curIdx >= questions.length) {
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

function finishTest(timeout) {
  clearInterval(timerID);
  clearTimeout(eyeTimer);
  
  let questions = [];
  if (currentTestType === 'errors') questions = shuffledErrors;
  else if (currentTestType === 'micro') questions = shuffledMicro;
  else questions = shuffledTest3;
  
  const total = questions.length;
  const wrong = total - score;
  const percentage = Math.round((score / total) * 100);
  
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
  if (currentTestType === 'errors') {
    startErrorsTest();
  } else if (currentTestType === 'micro') {
    startMicroTest();
  } else {
    startTest3();
  }
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
  
  setTimeout(() => {
    checkAccessAndUpdate();
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
  
  lockContent();
  startTimeChecker();
  startRealTimeClock();
});

window.checkPw = checkPw;
window.startErrorsTest = startErrorsTest;
window.startMicroTest = startMicroTest;
window.startTest3 = startTest3;
window.toggleDark = toggleDark;
window.toggleWarm = toggleWarm;
window.toggleFont = toggleFont;
window.retakeTest = retakeTest;
window.goHome = goHome;

// ============ ЖЕТІ МУЗЫКА (соңында Shiza - SHYM тікелей эфир) ============
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
        'loop': 1,
        'playlist': currentPlaylist[6]
      },
      events: {
        'onStateChange': onLivePlayerStateChange
      }
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
    isShizaPlaying = false;
    isKairatPlaying = false;
    isDensPlaying = false;
    isKzoPlaying = false;
    isKzo2Playing = false;
    isSharautPlaying = false;
    isShizaLivePlaying = false;
    document.getElementById('music-icon').innerHTML = '▶️';
    
    if (playlistInterval) {
      clearInterval(playlistInterval);
      playlistInterval = null;
    }
  } else {
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
    
    if (!playlistInterval) {
      playlistInterval = setInterval(updateMusicInfo, 3000);
    }
  }
};

function updateMusicInfo() {
  const titleEl = document.getElementById('music-title');
  const subtitleEl = document.getElementById('music-subtitle');
  
  if (isShizaPlaying) {
    titleEl.textContent = 'Shiza';
    subtitleEl.textContent = 'SHYM (1950s Jazz)';
    document.getElementById('music-control').style.background = 'linear-gradient(135deg, #8A2BE2, #4B0082)';
  } else if (isKairatPlaying) {
    titleEl.textContent = 'Қайрат Нұртас';
    subtitleEl.textContent = 'Ол сен емес';
    document.getElementById('music-control').style.background = 'linear-gradient(135deg, #8B0000, #4A0404)';
  } else if (isDensPlaying) {
    titleEl.textContent = '9 Грамм';
    subtitleEl.textContent = 'ДЭНС';
    document.getElementById('music-control').style.background = 'linear-gradient(135deg, #2C3E50, #3498DB)';
  } else if (isKzoPlaying) {
    titleEl.textContent = '6ellucci';
    subtitleEl.textContent = 'KZO';
    document.getElementById('music-control').style.background = 'linear-gradient(135deg, #006400, #228B22)';
  } else if (isKzo2Playing) {
    titleEl.textContent = '6ELLUCCI & JUNIOR';
    subtitleEl.textContent = 'KZO II';
    document.getElementById('music-control').style.background = 'linear-gradient(135deg, #8B4513, #CD853F)';
  } else if (isSharautPlaying) {
    titleEl.textContent = 'Guf & BALLER';
    subtitleEl.textContent = 'Шараут';
    document.getElementById('music-control').style.background = 'linear-gradient(135deg, #4B0082, #9400D3)';
  } else if (isShizaLivePlaying) {
    titleEl.textContent = 'Shiza';
    subtitleEl.textContent = 'SHYM (LIVE)';
    document.getElementById('music-control').style.background = 'linear-gradient(135deg, #FF4500, #8B0000)';
  }
}

function updateMusicIcons() {
  if (isShizaPlaying || isKairatPlaying || isDensPlaying || isKzoPlaying || isKzo2Playing || isSharautPlaying || isShizaLivePlaying) {
    document.getElementById('music-icon').innerHTML = '⏸️';
  } else {
    document.getElementById('music-icon').innerHTML = '▶️';
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
};

setTimeout(addMusicControl, 3000);