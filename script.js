'use strict';

// ==================== MAX.RU СТИЛІНДЕГІ САЙТ ====================
// Глобалды айнымалылар
let cachedWeather = null;
let lastWeatherFetch = 0;
const WEATHER_FETCH_INTERVAL = 5 * 60 * 1000;

let usersResults = JSON.parse(localStorage.getItem('quizUsers')) || [];
let loginAttempts = 0;
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000;

const CORRECT_PASSWORD = '7700';

// ==================== АУА РАЙЫ ====================
async function getKyzylordaWeather() {
    const now = Date.now();
    
    if (cachedWeather && (now - lastWeatherFetch < WEATHER_FETCH_INTERVAL)) {
        return cachedWeather;
    }
    
    try {
        const response = await fetch('https://api.weatherapi.com/v1/current.json?key=4c249f5920cb4d78b1d183152261403&q=Kyzylorda&lang=kk&aqi=no');
        
        if (!response.ok) throw new Error('Ауа райын алу мүмкін болмады');
        
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
        console.log('Ауа райын алу мүмкін болмады:', error);
        return cachedWeather;
    }
}

// ==================== УАҚЫТ ====================
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

// ==================== MAX.RU СТИЛІНДЕГІ БАННЕР ====================
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
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="https:${weather.icon}" style="width: 24px; height: 24px;">
                <span style="font-weight: 600;">${weather.temp > 0 ? '+' : ''}${weather.temp}°C</span>
                <span style="font-size: 13px; opacity: 0.8;">${weather.condition}</span>
            </div>
        `;
    } else if (!isNight) {
        weatherHtml = `
            <a href="https://yandex.ru/pogoda/kk/kyzylorda" target="_blank" style="
                background: rgba(255,255,255,0.15);
                padding: 6px 16px;
                border-radius: 30px;
                color: white;
                text-decoration: none;
                font-size: 13px;
                font-weight: 500;
            ">☀️ Қызылорда →</a>
        `;
    }
    
    banner.innerHTML = `
        <div style="
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
        ">
            <div style="display: flex; align-items: center; gap: 16px;">
                <span style="font-size: 20px;">${icon}</span>
                <span style="font-weight: 500;">${greeting}</span>
                <span style="
                    background: rgba(255,255,255,0.15);
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-family: monospace;
                    font-size: 14px;
                " id="time-banner-display">${currentTime}</span>
            </div>
            <div id="weather-banner-content">${weatherHtml}</div>
        </div>
    `;
    
    banner.style.cssText = `
        background: #0a0a0a;
        color: white;
        padding: 12px 0;
        position: sticky;
        top: 0;
        z-index: 10000;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    if (document.body.firstChild) {
        document.body.insertBefore(banner, document.body.firstChild);
    } else {
        document.body.appendChild(banner);
    }
}

function updateTimeInBanner() {
    const timeSpan = document.getElementById('time-banner-display');
    if (timeSpan) {
        const { currentTime } = getTimeInfo();
        timeSpan.textContent = currentTime;
    }
}

async function updateWeatherInBanner() {
    const weatherDiv = document.getElementById('weather-banner-content');
    if (!weatherDiv) return;
    
    const { isNight } = getTimeInfo();
    
    if (!isNight) {
        weatherDiv.innerHTML = `
            <a href="https://yandex.ru/pogoda/kk/kyzylorda" target="_blank" style="
                background: rgba(255,255,255,0.15);
                padding: 6px 16px;
                border-radius: 30px;
                color: white;
                text-decoration: none;
                font-size: 13px;
                font-weight: 500;
            ">☀️ Қызылорда →</a>
        `;
        return;
    }
    
    const weather = await getKyzylordaWeather();
    if (weather) {
        weatherDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="https:${weather.icon}" style="width: 24px; height: 24px;">
                <span style="font-weight: 600;">${weather.temp > 0 ? '+' : ''}${weather.temp}°C</span>
                <span style="font-size: 13px; opacity: 0.8;">${weather.condition}</span>
            </div>
        `;
    }
}

// ==================== ҚОЛЖЕТІМДІЛІКТІ ТЕКСЕРУ ====================
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
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            
            let weatherHtml = '';
            if (isNight && weather) {
                weatherHtml = `
                    <div style="
                        background: rgba(255,255,255,0.05);
                        border-radius: 24px;
                        padding: 20px;
                        margin: 20px 0;
                        text-align: center;
                    ">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 15px;">
                            <img src="https:${weather.icon}" style="width: 56px; height: 56px;">
                            <div style="font-size: 36px; font-weight: 700;">${weather.temp > 0 ? '+' : ''}${weather.temp}°C</div>
                        </div>
                        <div style="display: flex; justify-content: center; gap: 20px; font-size: 13px;">
                            <span>🌡️ ${weather.feelslike > 0 ? '+' : ''}${weather.feelslike}°C</span>
                            <span>💧 ${weather.humidity}%</span>
                            <span>🌬️ ${weather.wind} км/сағ</span>
                        </div>
                        <div style="margin-top: 10px; font-size: 14px;">${weather.condition}</div>
                    </div>
                `;
            }
            
            accessDeniedPage.innerHTML = `
                <div style="
                    background: rgba(255,255,255,0.05);
                    backdrop-filter: blur(20px);
                    border-radius: 32px;
                    padding: 48px 32px;
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                    color: white;
                    border: 1px solid rgba(255,255,255,0.1);
                ">
                    <div style="font-size: 64px; margin-bottom: 20px;">${icon}</div>
                    <h1 style="font-size: 28px; margin-bottom: 12px;">Қолжетімділік шектелген</h1>
                    <p style="font-size: 14px; opacity: 0.7; margin-bottom: 24px;">Сайт таңғы 07:00-ден кешкі 22:00-ге дейін жұмыс істейді</p>
                    
                    <div style="
                        background: rgba(255,255,255,0.1);
                        border-radius: 20px;
                        padding: 16px;
                        margin-bottom: 24px;
                        font-size: 18px;
                    ">
                        ${icon} ${greeting} Қазір ${currentTime}
                    </div>
                    
                    <div style="
                        background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,140,0,0.1));
                        border-radius: 24px;
                        padding: 24px;
                        margin-bottom: 24px;
                        border: 1px solid rgba(255,215,0,0.3);
                    ">
                        <h3 style="color: #FFD700; margin-bottom: 16px;">✨ Қадір түні ✨</h3>
                        <div style="font-size: 24px; margin-bottom: 12px;">اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ العَفْوَ فَاعْفُ عَنِّي</div>
                        <div style="font-size: 14px; margin-bottom: 8px;">Аллаһуммә иннәкә афувун тухиббул-афва фағфу анни</div>
                        <div style="font-size: 12px; opacity: 0.7;">Уа, Алла! Сен өте кешірімдісің, кешіруді жақсы көресің. Мені кешіре гөр.</div>
                    </div>
                    
                    ${weatherHtml}
                    
                    <div style="
                        background: rgba(0,0,0,0.3);
                        border-radius: 20px;
                        padding: 16px;
                        margin-bottom: 24px;
                    ">
                        <div style="display: flex; align-items: center; gap: 12px; background: rgba(46,204,113,0.15); padding: 12px; border-radius: 12px; margin-bottom: 8px;">
                            <span>✅</span>
                            <div style="text-align: left;">
                                <strong>Қолжетімді</strong>
                                <div style="font-size: 12px; opacity: 0.7;">07:00 - 22:00</div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px; background: rgba(231,76,60,0.15); padding: 12px; border-radius: 12px;">
                            <span>❌</span>
                            <div style="text-align: left;">
                                <strong>Қолжетімсіз</strong>
                                <div style="font-size: 12px; opacity: 0.7;">22:00 - 07:00</div>
                            </div>
                        </div>
                    </div>
                    
                    <p style="font-size: 16px; opacity: 0.8;">Қайта келіңіз! ${icon}</p>
                </div>
            `;
            
            document.body.appendChild(accessDeniedPage);
        }
        return false;
    }
    return true;
}

// ==================== ТОЛЫҚ JAVA СҰРАҚТАРЫ ====================
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
    {question:"Массив ұзындығын табу?", options:["size()","length","count()","len()","get()"], correct:1},
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

// ==================== ТЕСТ ФУНКЦИЯЛАРЫ ====================
let shuffled = [];
let curIdx = 0;
let score = 0;
let timerID = null;
let timeLeft = 1800;
let answeredCount = 0;
let currentUserName = '';

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function showToast(msg, isError = false) {
    let toast = document.getElementById('custom-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'custom-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: ${isError ? '#e74c3c' : '#2ecc71'};
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10001;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = isError ? '#e74c3c' : '#2ecc71';
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2500);
}

function lockContent() {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showToast('🚫 Мәтінді көшіруге болмайды', true);
    });

    document.addEventListener('keydown', (e) => {
        const ctrl = e.ctrlKey || e.metaKey;
        if (ctrl && ['c','x','v','u','s','a'].includes(e.key.toLowerCase())) {
            e.preventDefault();
            showToast('🚫 Мәтінді көшіруге болмайды', true);
            return false;
        }
        if (e.key === 'F12' || (ctrl && e.shiftKey && e.key.toLowerCase() === 'i')) {
            e.preventDefault();
            showToast('🔒 Құралдар бұғатталған', true);
            return false;
        }
    });

    ['copy', 'cut', 'paste'].forEach(ev => {
        document.addEventListener(ev, (e) => {
            e.preventDefault();
            showToast('🚫 Мәтінді көшіруге болмайды', true);
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

function checkPw() {
    const input = document.getElementById('pw-in');
    const value = input.value.trim();
    
    const lockData = localStorage.getItem('loginLockout');
    if (lockData) {
        const lock = JSON.parse(lockData);
        if (Date.now() < lock.until) {
            const remainingMinutes = Math.ceil((lock.until - Date.now()) / 60000);
            showToast(`🔒 ${remainingMinutes} минут күтіңіз! Тым көп қате әрекет`, true);
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
    
    let attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    
    if (value === CORRECT_PASSWORD) {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginLockout');
        document.getElementById('pw-err').classList.add('hidden');
        showToast('✅ Құппия сөз дұрыс!');
        showNameInput();
        input.value = '';
        input.disabled = false;
    } else {
        attempts++;
        localStorage.setItem('loginAttempts', attempts);
        
        if (attempts >= 3) {
            const lockUntil = Date.now() + (5 * 60 * 1000);
            localStorage.setItem('loginLockout', JSON.stringify({ until: lockUntil, attempts: attempts }));
            showToast(`🔒 ${attempts} рет қате! 5 минутқа бұғатталды`, true);
            input.disabled = true;
            setTimeout(() => {
                input.disabled = false;
                localStorage.removeItem('loginLockout');
                localStorage.removeItem('loginAttempts');
            }, 5 * 60 * 1000);
        } else {
            showToast(`❌ Қате құппия сөз! ${3 - attempts} рет қалды`, true);
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
    showPage('page-home'); 
}

// ==================== МУЗЫКА (ЖАҢАРТЫЛҒАН ПЛЕЙЛИСТ) ====================
let musicPlayers = {};
let isMusicPlaying = false;
let currentTrackIndex = 0;

// ЖАҢА ПЛЕЙЛИСТ: Бірінші - Белые розы, Екінші - Забудь
const playlist = [
    { id: 'belye_rozy', videoId: 'aKL8LxvLPoA', title: 'Белые розы', subtitle: 'Ласковый май' },
    { id: 'zabud', videoId: 'IFCF_NUyiu4', title: 'Забудь', subtitle: 'Юрий Шатунов' },
    { id: 'shiza', videoId: 'XYIYpFZ59wU', title: 'Shiza', subtitle: 'SHYM' },
    { id: 'kairat', videoId: 'uZy0-fQOBj8', title: 'Қайрат Нұртас', subtitle: 'Ол сен емес' },
    { id: 'dens', videoId: '5KDZD86MWYU', title: '9 Грамм', subtitle: 'ДЭНС' },
    { id: 'kzo', videoId: 'XwImCmmEDgA', title: '6ellucci', subtitle: 'KZO' },
    { id: 'kzo2', videoId: 'AH9zEI9Hx-0', title: '6ELLUCCI & JUNIOR', subtitle: 'KZO II' },
    { id: 'sharaut', videoId: 'FNKFpuoM1OY', title: 'Guf & BALLER', subtitle: 'Шараут' },
    { id: 'shiza-live', videoId: 'cSxNzTebJyY', title: 'Shiza', subtitle: 'SHYM (LIVE)' }
];

function loadYouTubeAPI() {
    if (document.getElementById('youtube-api-script')) return;
    
    const tag = document.createElement('script');
    tag.id = 'youtube-api-script';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function() {
    playlist.forEach((track, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.id = `${track.id}-player`;
        playerDiv.style.display = 'none';
        document.body.appendChild(playerDiv);
        
        musicPlayers[track.id] = new YT.Player(`${track.id}-player`, {
            height: '0',
            width: '0',
            videoId: track.videoId,
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                enablejsapi: 1,
                fs: 0,
                loop: 0
            },
            events: {
                onStateChange: (event) => {
                    if (event.data === 0) {
                        playNextTrack();
                    }
                }
            }
        });
    });
};

function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    playCurrentTrack();
}

function playCurrentTrack() {
    Object.values(musicPlayers).forEach(player => {
        if (player && player.stopVideo) player.stopVideo();
    });
    
    const track = playlist[currentTrackIndex];
    if (musicPlayers[track.id] && musicPlayers[track.id].playVideo) {
        musicPlayers[track.id].playVideo();
    }
    
    updateMusicUI(track);
}

function updateMusicUI(track) {
    const musicTitle = document.getElementById('music-title');
    const musicSubtitle = document.getElementById('music-subtitle');
    const musicIcon = document.getElementById('music-icon');
    
    if (musicTitle) musicTitle.textContent = track.title;
    if (musicSubtitle) musicSubtitle.textContent = track.subtitle;
    if (musicIcon) musicIcon.textContent = '⏸️';
}

function toggleMusic() {
    if (!musicPlayers[playlist[0]?.id]) {
        loadYouTubeAPI();
        setTimeout(() => {
            if (musicPlayers[playlist[0]?.id]) toggleMusic();
        }, 1000);
        return;
    }
    
    if (isMusicPlaying) {
        Object.values(musicPlayers).forEach(player => {
            if (player && player.pauseVideo) player.pauseVideo();
        });
        isMusicPlaying = false;
        const musicIcon = document.getElementById('music-icon');
        if (musicIcon) musicIcon.textContent = '▶️';
    } else {
        if (!musicPlayers[playlist[currentTrackIndex]?.id]?.playVideo) {
            currentTrackIndex = 0;
        }
        playCurrentTrack();
        isMusicPlaying = true;
    }
}

function addMusicControl() {
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
            border-radius: 50px;
            padding: 8px 15px 8px 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.5);
            backdrop-filter: blur(5px);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
                <div style="font-weight: 700; font-size: 13px;" id="music-title">Белые розы</div>
                <div style="font-size: 11px; opacity: 0.9;" id="music-subtitle">Ласковый май</div>
            </div>
        </div>
    `;
    document.body.appendChild(musicControl);
    
    loadYouTubeAPI();
}

// ==================== DOM READY ====================
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
    addMusicControl();
});

// Глобалды функциялар
window.checkPw = checkPw;
window.saveUserNameAndStart = saveUserNameAndStart;
window.showLeaderboard = showLeaderboard;
window.retakeTest = retakeTest;
window.goHome = goHome;
window.toggleMusic = toggleMusic;