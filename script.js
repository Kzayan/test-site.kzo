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

// ==================== ЖАҢА СҰРАҚТАР (Қателерді анықтау) ====================
const QUESTIONS = [
    {question:"Кодтағы қателерді анықтау процесі қалай аталады?", options:["Компиляция","Дебаггинг","Тестілеу","Орындау","Инсталляция"], correct:1},
    {question:"Синтаксистік қате дегеніміз не?", options:["Логикалық қате","Бағдарлама баяу жұмыс істеуі","Жазылу ережесінің бұзылуы","Дерекқор қатесі","Дизайн қатесі"], correct:2},
    {question:"Логикалық қате кезінде:", options:["Бағдарлама мүлде ашылмайды","Қате нәтиже береді","Компьютер өшеді","Файл жойылады","Желі үзіледі"], correct:1},
    {question:"Runtime error қашан пайда болады?", options:["Код жазу кезінде","Компиляция кезінде","Орындау кезінде","Жобалау кезінде","Орнату кезінде"], correct:2},
    {question:"Debugger не үшін керек?", options:["Код жазу","Қате іздеу","Сурет салу","Файл сақтау","Интернетке шығу"], correct:1},
    {question:"print() функциясы не үшін қолданылады?", options:["Қате жою","Мәлімет шығару","Файл ашу","Желіге қосылу","Код жою"], correct:1},
    {question:"try-except блогы не үшін керек?", options:["Цикл құру","Шарт жазу","Қателерді өңдеу","Айнымалы құру","Файл жою"], correct:2},
    {question:"IDE дегеніміз:", options:["Операциялық жүйе","Бағдарламалау ортасы","Вирус","Драйвер","Сервер"], correct:1},
    {question:"Infinite loop дегеніміз:", options:["Бір рет орындалатын цикл","Шексіз цикл","Қате код","Айнымалы","Функция"], correct:1},
    {question:"Null мәні дегеніміз:", options:["0 саны","Бос мән","1 саны","Теріс сан","Символ"], correct:1},
    {question:"Логикалық қатені табудың ең тиімді жолы:", options:["Компьютерді өшіру","Кодты қайта көшіру","Қадамдап орындау (step-by-step)","Интернетті тексеру","Принтер қосу"], correct:2},
    {question:"Синтаксистік қате табылғанда:", options:["Бағдарлама дұрыс жұмыс істейді","Компиляция тоқтайды","Нәтиже баяу шығады","Файл ашылады","Желі үзіледі"], correct:1},
    {question:"Айнымалы анықталмаса қандай қате шығады?", options:["Type error","Name error","Index error","Logic error","Value error"], correct:1},
    {question:"Массив шегінен тыс элементке жүгінсек:", options:["Name error","Type error","Index error","Syntax error","Key error"], correct:2},
    {question:"Type error қашан болады?", options:["Қате атау жазылса","Түрлер сәйкес келмесе","Индекс дұрыс болмаса","Цикл тоқтаса","Файл жабылса"], correct:1},
    {question:"Қатені қайталамау үшін не істеу керек?", options:["Кодты тестілеу","Өшіру","Компьютер ауыстыру","Интернет қосу","Бағдарламаны жасыру"], correct:0},
    {question:"assert командасы не үшін қолданылады?", options:["Файл ашу","Мәлімет басу","Шартты тексеру","Цикл жасау","Айнымалы жою"], correct:2},
    {question:"Лог-файл не үшін керек?", options:["Музыка сақтау","Қате жазбаларын сақтау","Видео көру","Сурет салу","Интернетке қосылу"], correct:1},
    {question:"Refactoring дегеніміз:", options:["Кодты жою","Код құрылымын жақсарту","Қате қосу","Файл форматтау","Компьютер тазалау"], correct:1},
    {question:"Unit тестілеу не тексереді?", options:["Бүкіл жүйені","Бір модульді","Серверді","Интернетті","Дизайнды"], correct:1},
    {question:"ValueError қашан пайда болады?", options:["Айнымалы жоқ болса","Мәлімет түрі сәйкес келмесе","Дұрыс емес мән енгізілсе","Индекс артық болса","Файл табылмаса"], correct:2},
    {question:"FileNotFoundError қашан шығады?", options:["Айнымалы жоқ болса","Файл табылмаса","Түр сәйкес келмесе","Шарт қате болса","Цикл тоқтаса"], correct:1},
    {question:"except блогы қай кезде орындалады?", options:["Қате болмаса","Қате пайда болса","Әрқашан","Цикл ішінде ғана","Функция алдында"], correct:1},
    {question:"finally блогы:", options:["Ешқашан орындалмайды","Қате болса ғана орындалады","Әрқашан орындалады","Цикл жасайды","Айнымалы құрады"], correct:2},
    {question:"Логикалық қателерді табу үшін:", options:["Кодты талдау керек","Компьютер ауыстыру керек","Файлды жою керек","Интернетті өшіру керек","Принтер қосу керек"], correct:0},
    {question:"Breakpoint дегеніміз:", options:["Қате түрі","Бағдарламаны тоқтату нүктесі","Айнымалы","Цикл","Файл"], correct:1},
    {question:"Stack trace нені көрсетеді?", options:["Дизайнды","Қате шыққан жолды","Интернет жылдамдығын","Файл өлшемін","Процессор түрін"], correct:1},
    {question:"Тестілеудің мақсаты:", options:["Қате табу","Кодты жасыру","Компьютерді өшіру","Желі қосу","Файлды көшіру"], correct:0},
    {question:"Қай қате бағдарлама тоқтауына әкелуі мүмкін?", options:["Логикалық","Runtime error","Комментарий қатесі","Дизайн қатесі","Стиль қатесі"], correct:1},
    {question:"Debugging процесінің соңғы мақсаты:", options:["Кодты жою","Қатені түзету","Файлды жабу","Компьютерді өшіру","Интернетке қосылу"], correct:1},
    {question:"SyntaxError қай кезде шығады?", options:["Орындау кезінде","Компиляция кезінде","Интернет жоқ кезде","Файл жабылғанда","Цикл тоқтағанда"], correct:0},
    {question:"ZeroDivisionError қашан пайда болады?", options:["0-ге бөлгенде","Айнымалы жоқ болса","Түр сәйкес келмесе","Индекс артық болса","Файл ашылмаса"], correct:0},
    {question:"Кодтағы комментарий не үшін керек?", options:["Қате шығару","Түсіндіру жазу","Файл жою","Айнымалы құру","Цикл жасау"], correct:1},
    {question:"Қате табылғаннан кейін бірінші қадам:", options:["Кодты өшіру","Себебін анықтау","Компьютерді өшіру","Жаңа файл ашу","Интернет қосу"], correct:1},
    {question:"while циклі тоқтамаса, бұл:", options:["Syntax error","Логикалық қате","Type error","Name error","Value error"], correct:1},
    {question:"Функция дұрыс нәтиже бермесе:", options:["Логикалық қате бар","Компьютер бұзылған","Интернет жоқ","Файл ашылмаған","Драйвер жоқ"], correct:0},
    {question:"IDE-де қызыл сызық нені білдіреді?", options:["Дұрыс код","Синтаксистік қате","Интернет бар","Файл сақталған","Принтер қосылған"], correct:1},
    {question:"Exception дегеніміз:", options:["Айнымалы","Қате жағдай","Цикл","Функция","Сервер"], correct:1},
    {question:"Кодты кішкене бөліктермен тексеру:", options:["Инсталляция","Модульдік тексеру","Форматтау","Архивтеу","Дизайн"], correct:1},
    {question:"Қай әдіс қателерді азайтады?", options:["Тестілеу","Көшіру","Өшіру","Форматтамау","Компьютер ауыстыру"], correct:0},
    {question:"KeyError қашан пайда болады?", options:["Айнымалы жоқ болса","Сөздікте (dict) жоқ кілт қолданылса","0-ге бөлгенде","Түр сәйкес келмесе","Файл ашылмаса"], correct:1},
    {question:"ImportError дегеніміз:", options:["Айнымалы қатесі","Модуль жүктелмесе","Индекс қатесі","Логикалық қате","Шарт қатесі"], correct:1},
    {question:"Кодты қайта қарау (code review) мақсаты:", options:["Қате табу","Файл жою","Интернет қосу","Компьютер өшіру","Дизайн өзгерту"], correct:0},
    {question:"Traceback нені көрсетеді?", options:["Файл көлемін","Қате шыққан жолдар тізбегін","Интернет жылдамдығын","Компьютер жадын","Экран өлшемін"], correct:1},
    {question:"Бағдарламаны тест мәліметтермен тексеру:", options:["Архивтеу","Тестілеу","Орнату","Форматтау","Көшіру"], correct:1},
    {question:"Қай жағдайда try блогы орындалады?", options:["Қате болса ғана","Әрқашан бірінші орындалады","Ешқашан","Цикл ішінде ғана","Файл жабылғанда"], correct:1},
    {question:"except бірнешеу болуы мүмкін бе?", options:["Жоқ","Иә","Тек біреу","Тек циклде","Тек функцияда"], correct:1},
    {question:"Debugging құралдарының бірі:", options:["Paint","Debugger","Word","Excel","Browser"], correct:1},
    {question:"Кодтағы артық жолдарды жою:", options:["Refactoring","Компиляция","Инсталляция","Архивтеу","Көшіру"], correct:0},
    {question:"Қате табылған соң не істеу керек?", options:["Елемеу","Түзету","Жою","Компьютер өшіру","Файл жабу"], correct:1},
    {question:"AttributeError қашан шығады?", options:["0-ге бөлгенде","Объектіде жоқ қасиет шақырылса","Индекс артық болса","Файл табылмаса","Айнымалы жоқ болса"], correct:1},
    {question:"Memory error себебі:", options:["Жад жетіспеуі","Интернет жоқ","Синтаксис қате","Индекс үлкен","Файл жабық"], correct:0},
    {question:"Қай әдіс қатені тез табуға көмектеседі?", options:["Кодты форматтау","Қадамдап орындау","Файл көшіру","Өшіру","Архивтеу"], correct:1},
    {question:"Тест кейс дегеніміз:", options:["Қате түрі","Тексеру сценарийі","Айнымалы","Файл","Сервер"], correct:1},
    {question:"Boundary value testing не тексереді?", options:["Орта мәндерді","Шектік мәндерді","Тек мәтінді","Дизайнды","Интернетті"], correct:1},
    {question:"Infinite recursion себебі:", options:["Шарт жоқ","Файл жоқ","Интернет жоқ","Индекс артық","Түр сәйкес емес"], correct:0},
    {question:"raise командасы:", options:["Қате тастау","Цикл құру","Айнымалы жою","Файл ашу","Мәлімет шығару"], correct:0},
    {question:"Қате туралы хабарлама не үшін маңызды?", options:["Уақыт өткізу","Себебін түсіну","Дизайн көру","Файл өлшеу","Интернет тексеру"], correct:1},
    {question:"Regression testing мақсаты:", options:["Жаңа қате қосу","Бұрынғы қателер қайталанбауын тексеру","Файл жою","Компьютер жаңарту","Дизайн өзгерту"], correct:1},
    {question:"Кодты жиі сақтау не үшін керек?", options:["Қате көбейту","Мәлімет жоғалтпау","Интернет қосу","Форматтау","Архивтеу"], correct:1},
    {question:"Логикалық қате табудың бір жолы:", options:["Нәтижені күтілген мәнмен салыстыру","Компьютер өшіру","Файл жою","Интернет қосу","Архивтеу"], correct:0},
    {question:"Exception handling мақсаты:", options:["Бағдарламаны тоқтату","Қатені басқару","Файл ашу","Айнымалы жою","Дизайн жасау"], correct:1},
    {question:"Кодтың оқылуын жақсарту:", options:["Түсінікті атаулар қолдану","Барлығын бір жолға жазу","Комментарийсіз жазу","Форматтамау","Қысқарту"], correct:0},
    {question:"Unit test қашан жазылады?", options:["Кодтан кейін","Кодпен бірге","Ешқашан","Орнатқанда","Архивтегенде"], correct:1},
    {question:"Bug дегеніміз:", options:["Дұрыс код","Қате","Сервер","Айнымалы","Файл"], correct:1},
    {question:"Debugging мақсаты:", options:["Қате қосу","Қате табу және түзету","Файл жою","Интернет өшіру","Компьютер ауыстыру"], correct:1},
    {question:"try блогында не жазылады?", options:["Қауіпті код","Комментарий","Айнымалы аты","Файл аты","Дизайн"], correct:0},
    {question:"finally көбіне не үшін қолданылады?", options:["Файл жабу","Қате шығару","Цикл құру","Айнымалы жою","Дизайн жасау"], correct:0},
    {question:"Кодты тексерудің автоматты түрі:", options:["Manual testing","Automated testing","Архивтеу","Форматтау","Көшіру"], correct:1},
    {question:"Stack overflow себебі:", options:["Терең рекурсия","Интернет жоқ","Файл жоқ","Индекс үлкен","Түр сәйкес емес"], correct:0},
    {question:"Input тексеру не үшін қажет?", options:["Қате болдырмау","Интернет қосу","Файл жою","Дизайн өзгерту","Архивтеу"], correct:0},
    {question:"Қате шыққан жолды табу үшін:", options:["Traceback қарау","Компьютер өшіру","Файл жабу","Интернет тексеру","Архивтеу"], correct:0},
    {question:"Version control не үшін керек?", options:["Код нұсқаларын сақтау","Файл жою","Интернет қосу","Дизайн өзгерту","Компьютер өшіру"], correct:0},
    {question:"Git дегеніміз:", options:["Операциялық жүйе","Нұсқа бақылау жүйесі","Сервер","Айнымалы","Қате түрі"], correct:1},
    {question:"Merge conflict қашан болады?", options:["Бір файлды екі адам өзгерткенде","Интернет жоқ кезде","Файл жойылғанда","Компьютер өшкенде","Индекс үлкенде"], correct:0},
    {question:"Test coverage нені көрсетеді?", options:["Код көлемін","Тестпен қамтылған пайызды","Интернет жылдамдығын","Файл өлшемін","Дизайн сапасын"], correct:1},
    {question:"Кодты форматтау құралы:", options:["Linter","Printer","Scanner","Monitor","Router"], correct:0},
    {question:"Static analysis қашан жасалады?", options:["Орындаусыз","Орындау кезінде","Интернетпен","Серверде","Принтерде"], correct:0},
    {question:"Dynamic testing қашан жасалады?", options:["Орындау кезінде","Код жазғанда","Форматтағанда","Архивтегенде","Дизайнда"], correct:0},
    {question:"Code smell дегеніміз:", options:["Жақсы код","Жаман құрылым белгісі","Қате хабарлама","Айнымалы","Файл"], correct:1},
    {question:"Refactoring кезінде:", options:["Функционал өзгермейді","Жаңа қате қосылады","Код жойылады","Интернет қосылады","Компьютер өшеді"], correct:0},
    {question:"Қай тест жүйені толық тексереді?", options:["Unit test","Integration test","System test","Static test","Manual test"], correct:2},
    {question:"Integration test не тексереді?", options:["Бір функцияны","Модульдердің байланысын","Дизайнды","Интернетті","Файлды"], correct:1},
    {question:"Manual testing дегеніміз:", options:["Қолмен тексеру","Автоматты тексеру","Архивтеу","Форматтау","Орнату"], correct:0},
    {question:"Automated testing артықшылығы:", options:["Жылдамдық","Қате көбейту","Файл жою","Интернет өшіру","Дизайн бұзу"], correct:0},
    {question:"Қате қайталанса:", options:["Себебін терең талдау керек","Елемеу керек","Файл жою керек","Компьютер ауыстыру керек","Интернет қосу керек"], correct:0},
    {question:"Clean code мақсаты:", options:["Оқылуы жеңіл код","Ұзын код","Қате код","Форматсыз код","Архивтелген код"], correct:0},
    {question:"DRY принципі:", options:["Қайталауды азайту","Қате қосу","Файл жою","Интернет қосу","Дизайн өзгерту"], correct:0},
    {question:"SOLID принциптері:", options:["Дизайн қағидалары","Қате түрлері","Файл атауы","Интернет түрі","Айнымалы атауы"], correct:0},
    {question:"Код сапасын арттыру үшін:", options:["Тестілеу жүргізу","Комментарийсіз жазу","Барлығын қысқарту","Форматтамау","Тексермеу"], correct:0},
    {question:"Exception түрін нақты көрсету:", options:["Жақсы тәжірибе","Қате","Міндет емес","Интернетке байланысты","Файлға байланысты"], correct:0},
    {question:"Логикалық қате көбіне:", options:["Есептеуде болады","Интернетте болады","Файлда болады","Серверде болады","Принтерде болады"], correct:0},
    {question:"Кодты қайта пайдалану:", options:["Қайта қолдану","Жою","Архивтеу","Форматтау","Өшіру"], correct:0},
    {question:"CI/CD мақсаты:", options:["Автоматты құрастыру және тексеру","Файл жою","Интернет өшіру","Дизайн өзгерту","Компьютер өшіру"], correct:0},
    {question:"Bug report құрамына кіреді:", options:["Қате сипаттамасы","Музыка","Видео","Сурет салу","Архив"], correct:0},
    {question:"Қате табылған орта:", options:["Production","Test","Dev","Барлығы мүмкін","Ешқайсысы"], correct:3},
    {question:"Code review кім жасайды?", options:["Басқа бағдарламашы","Клиент","Дизайнер","Қолданушы","Принтер"], correct:0},
    {question:"Тестілеу кезеңі:", options:["Жобалау алдында","Әзірлеу кезінде және кейін","Орнатудан кейін ғана","Архивтегенде","Форматтағанда"], correct:1},
    {question:"Қатені түзеткен соң:", options:["Қайта тестілеу керек","Елемеу керек","Файл жою керек","Интернет өшіру керек","Компьютер ауыстыру керек"], correct:0},
    {question:"Бағдарламалық код сапасының негізгі көрсеткіші:", options:["Қатесіз жұмыс","Ұзындығы","Түсі","Форматы","Архив көлемі"], correct:0}
];

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

// ==================== МУЗЫКА ====================
let musicPlayers = {};
let isMusicPlaying = false;
let currentTrackIndex = 0;

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