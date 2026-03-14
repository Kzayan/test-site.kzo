'use strict';

// Уақытқа байланысты қолжетімділік және хабарламалар
function getTimeMessage() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  let timeMessage = '';
  let isAccessAllowed = true;
  
  // Қолжетімділікті тексеру (таңғы 7:00 - кешкі 22:00)
  if (hours >= 22 || hours < 7) {
    isAccessAllowed = false;
  }
  
  // Уақытқа байланысты хабарлама
  if (hours >= 7 && hours < 12) {
    timeMessage = '🌅 Қайырлы таң! Қазақстан уақыты ' + currentTime;
  } else if (hours >= 12 && hours < 18) {
    timeMessage = '☀️ Қайырлы күн! Қазақстан уақыты ' + currentTime;
  } else if (hours >= 18 && hours < 22) {
    timeMessage = '🌆 Қайырлы кеш! Қазақстан уақыты ' + currentTime;
  } else {
    timeMessage = '🌙 Қайырлы түн! Қазақстан уақыты ' + currentTime;
  }
  
  return { timeMessage, isAccessAllowed, hours, currentTime };
}

// Уақыт баннерін қосу
function addTimeBanner() {
  const { timeMessage } = getTimeMessage();
  
  // Ескі баннерді өшіру
  const oldBanner = document.getElementById('time-banner');
  if (oldBanner) oldBanner.remove();
  
  // Жаңа баннер жасау
  const banner = document.createElement('div');
  banner.id = 'time-banner';
  banner.textContent = timeMessage;
  
  // Баннерге стиль қосу
  banner.style.cssText = `
    background: linear-gradient(135deg, #3b5bdb, #2f4ac8);
    color: white;
    text-align: center;
    padding: 10px;
    font-weight: bold;
    font-size: 16px;
    position: sticky;
    top: 0;
    z-index: 9999;
    width: 100%;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  
  // Баннерді body-дің басына қосу
  document.body.insertBefore(banner, document.body.firstChild);
  
  // Барлық беттердің margin-ін түзету
  document.querySelectorAll('.page').forEach(page => {
    page.style.marginTop = '0';
  });
}

// Қолжетімділікті тексеру
function checkAccess() {
  const { isAccessAllowed, timeMessage, currentTime } = getTimeMessage();
  
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
        background: linear-gradient(135deg, #0d1117, #1a1f3c);
        padding: 20px;
      `;
      
      accessDeniedPage.innerHTML = `
        <div style="
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 30px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          color: white;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          animation: fadeIn 0.5s ease;
        ">
          <div style="font-size: 80px; margin-bottom: 20px; animation: float 3s infinite;">🌙</div>
          <h1 style="font-size: 32px; margin-bottom: 20px;">Қолжетімділік шектелген</h1>
          <p style="font-size: 18px; margin-bottom: 20px;">Сайт таңғы 7:00-ден кешкі 22:00-ге дейін жұмыс істейді</p>
          <div style="
            background: rgba(255,255,255,0.15);
            padding: 15px;
            border-radius: 50px;
            margin-bottom: 30px;
            font-size: 20px;
            font-weight: bold;
          ">${timeMessage}</div>
          <div style="
            background: rgba(0,0,0,0.3);
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: left;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 15px;
              padding: 10px;
              background: rgba(46,204,113,0.2);
              border-radius: 10px;
              margin-bottom: 10px;
            ">
              <span style="font-size: 24px;">✅</span>
              <span>Қолжетімді: 07:00 - 22:00</span>
            </div>
            <div style="
              display: flex;
              align-items: center;
              gap: 15px;
              padding: 10px;
              background: rgba(231,76,60,0.2);
              border-radius: 10px;
            ">
              <span style="font-size: 24px;">❌</span>
              <span>Қолжетімсіз: 22:00 - 07:00</span>
            </div>
          </div>
          <p style="font-size: 20px; font-style: italic;">Қайта келіңіз! 🌙</p>
        </div>
        <style>
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>
      `;
      
      document.body.appendChild(accessDeniedPage);
    } else {
      accessDeniedPage.classList.add('active');
      accessDeniedPage.style.display = 'flex';
    }
    return false;
  }
  return true;
}

// Уақытты тексеру
function startTimeChecker() {
  // Бірінші тексеру
  if (!checkAccess()) {
    return false;
  }
  
  // Әр минут сайын тексеру
  setInterval(() => {
    const { isAccessAllowed } = getTimeMessage();
    
    // Уақыт баннерін жаңарту
    addTimeBanner();
    
    if (!isAccessAllowed) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      
      const accessDeniedPage = document.getElementById('page-access-denied');
      if (accessDeniedPage) {
        accessDeniedPage.classList.add('active');
        accessDeniedPage.style.display = 'flex';
      }
    } else {
      const accessDeniedPage = document.getElementById('page-access-denied');
      if (accessDeniedPage && accessDeniedPage.classList.contains('active')) {
        accessDeniedPage.classList.remove('active');
        accessDeniedPage.style.display = 'none';
        document.getElementById('page-login').classList.add('active');
      }
    }
  }, 60000);
  
  return true;
}

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

function finishTest(timeout) {
  clearInterval(timerID);
  clearTimeout(eyeTimer);
  
  const total = shuffled.length;
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
  startTest(); 
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
  // Уақыт баннерін қосу
  addTimeBanner();
  
  // Қолжетімділікті тексеру
  const hasAccess = checkAccess();
  
  if (hasAccess) {
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
  }
});

window.checkPw = checkPw;
window.startTest = startTest;
window.toggleDark = toggleDark;
window.toggleWarm = toggleWarm;
window.toggleFont = toggleFont;
window.retakeTest = retakeTest;
window.goHome = goHome;
