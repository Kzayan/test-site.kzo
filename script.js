'use strict';

const QUESTIONS = [
  {question:"Кодтағы қателерді анықтау процесі қалай аталады?",options:["Компиляция","Дебаггинг","Тестілеу","Орындау","Инсталляция"],correct:1},
  {question:"Синтаксистік қате дегеніміз не?",options:["Логикалық қате","Бағдарлама баяу жұмыс істеуі","Жазылу ережесінің бұзылуы","Дерекқор қатесі","Дизайн қатесі"],correct:2},
  {question:"Логикалық қате кезінде:",options:["Бағдарлама мүлде ашылмайды","Қате нәтиже береді","Компьютер өшеді","Файл жойылады","Желі үзіледі"],correct:1},
  {question:"Runtime error қашан пайда болады?",options:["Код жазу кезінде","Компиляция кезінде","Орындау кезінде","Жобалау кезінде","Орнату кезінде"],correct:2},
  {question:"Debugger не үшін керек?",options:["Код жазу","Қате іздеу","Сурет салу","Файл сақтау","Интернетке шығу"],correct:1},
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
  {question:"Логикалық қателерді табу үшін:",options:["Кодты талдау керек","Компьютер ауыстыру керек","Файлды жою керек","Интернетті өшіру керек","Принтер қосу керек"],correct:0},
  {question:"Breakpoint дегеніміз:",options:["Қате түрі","Бағдарламаны тоқтату нүктесі","Айнымалы","Цикл","Файл"],correct:1},
  {question:"Stack trace нені көрсетеді?",options:["Дизайнды","Қате шыққан жолды","Интернет жылдамдығын","Файл өлшемін","Процессор түрін"],correct:1},
  {question:"Тестілеудің мақсаты:",options:["Қате табу","Кодты жасыру","Компьютерді өшіру","Желі қосу","Файлды көшіру"],correct:0},
  {question:"Қай қате бағдарлама тоқтауына әкелуі мүмкін?",options:["Логикалық","Runtime error","Комментарий қатесі","Дизайн қатесі","Стиль қатесі"],correct:1},
  {question:"Debugging процесінің соңғы мақсаты:",options:["Кодты жою","Қатені түзету","Файлды жабу","Компьютерді өшіру","Интернетке қосылу"],correct:1},
  {question:"SyntaxError қай кезде шығады?",options:["Орындау кезінде","Компиляция кезінде","Интернет жоқ кезде","Файл жабылғанда","Цикл тоқтағанда"],correct:1},
  {question:"ZeroDivisionError қашан пайда болады?",options:["0-ге бөлгенде","Айнымалы жоқ болса","Түр сәйкес келмесе","Индекс артық болса","Файл ашылмаса"],correct:0},
  {question:"Кодтағы комментарий не үшін керек?",options:["Қате шығару","Түсіндіру жазу","Файл жою","Айнымалы құру","Цикл жасау"],correct:1},
  {question:"Қате табылғаннан кейін бірінші қадам:",options:["Кодты өшіру","Себебін анықтау","Компьютерді өшіру","Жаңа файл ашу","Интернет қосу"],correct:1},
  {question:"while циклі тоқтамаса, бұл:",options:["Syntax error","Логикалық қате","Type error","Name error","Value error"],correct:1},
  {question:"Функция дұрыс нәтиже бермесе:",options:["Логикалық қате бар","Компьютер бұзылған","Интернет жоқ","Файл ашылмаған","Драйвер жоқ"],correct:0},
  {question:"IDE-де қызыл сызық нені білдіреді?",options:["Дұрыс код","Синтаксистік қате","Интернет бар","Файл сақталған","Принтер қосылған"],correct:1},
  {question:"Exception дегеніміз:",options:["Айнымалы","Қате жағдай","Цикл","Функция","Сервер"],correct:1},
  {question:"Кодты кішкене бөліктермен тексеру:",options:["Инсталляция","Модульдік тексеру","Форматтау","Архивтеу","Дизайн"],correct:1},
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
  {question:"Exception handling мақсаты:",options:["Бағдарламаны тоқтату","Қатені басқару","Файл ашу","Айнымалы жою","Дизайн жасау"],correct:1},
  {question:"Кодтың оқылуын жақсарту:",options:["Түсінікті атаулар қолдану","Барлығын бір жолға жазу","Комментарийсіз жазу","Форматтамау","Қысқарту"],correct:0},
  {question:"Unit test қашан жазылады?",options:["Кодтан кейін","Кодпен бірге","Ешқашан","Орнатқанда","Архивтегенде"],correct:1},
  {question:"Bug дегеніміз:",options:["Дұрыс код","Қате","Сервер","Айнымалы","Файл"],correct:1},
  {question:"Debugging мақсаты:",options:["Қате қосу","Қате табу және түзету","Файл жою","Интернет өшіру","Компьютер ауыстыру"],correct:1},
  {question:"try блогында не жазылады?",options:["Қауіпті код","Комментарий","Айнымалы аты","Файл аты","Дизайн"],correct:0},
  {question:"finally көбіне не үшін қолданылады?",options:["Файл жабу","Қате шығару","Цикл құру","Айнымалы жою","Дизайн жасау"],correct:0},
  {question:"Кодты тексерудің автоматты түрі:",options:["Manual testing","Automated testing","Архивтеу","Форматтау","Көшіру"],correct:1},
  {question:"Stack overflow себебі:",options:["Терең рекурсия","Интернет жоқ","Файл жоқ","Индекс үлкен","Түр сәйкес емес"],correct:0},
  {question:"Input тексеру не үшін қажет?",options:["Қате болдырмау","Интернет қосу","Файл жою","Дизайн өзгерту","Архивтеу"],correct:0},
  {question:"Қате шыққан жолды табу үшін:",options:["Traceback қарау","Компьютер өшіру","Файл жабу","Интернет тексеру","Архивтеу"],correct:0},
  {question:"Version control не үшін керек?",options:["Код нұсқаларын сақтау","Файл жою","Интернет қосу","Дизайн өзгерту","Компьютер өшіру"],correct:0},
  {question:"Git дегеніміз:",options:["Операциялық жүйе","Нұсқа бақылау жүйесі","Сервер","Айнымалы","Қате түрі"],correct:1},
  {question:"Merge conflict қашан болады?",options:["Бір файлды екі адам өзгерткенде","Интернет жоқ кезде","Файл жойылғанда","Компьютер өшкенде","Индекс үлкенде"],correct:0},
  {question:"Test coverage нені көрсетеді?",options:["Код көлемін","Тестпен қамтылған пайызды","Интернет жылдамдығын","Файл өлшемін","Дизайн сапасын"],correct:1},
  {question:"Кодты форматтау құралы:",options:["Linter","Printer","Scanner","Monitor","Router"],correct:0},
  {question:"Static analysis қашан жасалады?",options:["Орындаусыз","Орындау кезінде","Интернетпен","Серверде","Принтерде"],correct:0},
  {question:"Dynamic testing қашан жасалады?",options:["Орындау кезінде","Код жазғанда","Форматтағанда","Архивтегенде","Дизайнда"],correct:0},
  {question:"Code smell дегеніміз:",options:["Жақсы код","Жаман құрылым белгісі","Қате хабарлама","Айнымалы","Файл"],correct:1},
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
  {question:"Кодты қайта пайдалану:",options:["Қайта қолдану","Жою","Архивтеу","Форматтау","Өшіру"],correct:0},
  {question:"CI/CD мақсаты:",options:["Автоматты құрастыру және тексеру","Файл жою","Интернет өшіру","Дизайн өзгерту","Компьютер өшіру"],correct:0},
  {question:"Bug report құрамына кіреді:",options:["Қате сипаттамасы","Музыка","Видео","Сурет салу","Архив"],correct:0},
  {question:"Қате табылған орта:",options:["Production","Test","Dev","Барлығы мүмкін","Ешқайсысы"],correct:3},
  {question:"Code review кім жасайды?",options:["Басқа бағдарламашы","Клиент","Дизайнер","Қолданушы","Принтер"],correct:0},
  {question:"Тестілеу кезеңі:",options:["Жобалау алдында","Әзірлеу кезінде және кейін","Орнатудан кейін ғана","Архивтегенде","Форматтағанда"],correct:1},
  {question:"Қатені түзеткен соң:",options:["Қайта тестілеу керек","Елемеу керек","Файл жою керек","Интернет өшіру керек","Компьютер ауыстыру керек"],correct:0},
  {question:"Бағдарламалық код сапасының негізгі көрсеткіші:",options:["Қатесіз жұмыс","Ұзындығы","Түсі","Форматы","Архив көлемі"],correct:0}
];

var answered = false;
var shuffled = [], curIdx = 0, score = 0;
var timerID = null, timeLeft = 1800;
var eyeTimer = null;
var isDark = false, isWarm = false, isLarge = false;
var toastT = null;

window.addEventListener('DOMContentLoaded', lockContent);

function showPage(id) {
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

function checkPw() {
  var v = document.getElementById('pw-in').value.trim();
  if (v === '7777') {
    document.getElementById('pw-err').classList.add('hidden');
    showPage('page-home');
  } else {
    document.getElementById('pw-err').classList.remove('hidden');
    var w = document.getElementById('pw-wrap');
    w.classList.add('shake');
    setTimeout(function() { w.classList.remove('shake'); }, 400);
    document.getElementById('pw-in').value = '';
    document.getElementById('pw-in').focus();
  }
}

function startTest() {
  shuffled = shuffle(QUESTIONS.slice());
  curIdx = 0;
  score = 0;
  timeLeft = 1800;
  showPage('page-test');
  renderQ();
  startTimer();
  clearTimeout(eyeTimer);
  eyeTimer = setTimeout(function() {
    if (document.getElementById('page-test').classList.contains('active')) {
      document.getElementById('eye-banner').classList.remove('hidden');
    }
  }, 20 * 60 * 1000);
}

function renderQ() {
  answered = false;

  var q = shuffled[curIdx];
  var total = shuffled.length;
  var LTRS = ['A','B','C','D','E','F','G'];

  document.getElementById('q-num').textContent = (curIdx + 1) + ' / ' + total;
  document.getElementById('score-live').textContent = '✅ ' + score;
  document.getElementById('q-lbl').textContent = 'Сұрақ ' + (curIdx + 1);
  document.getElementById('q-text').textContent = q.question;
  document.getElementById('prog-bar').style.width = (curIdx / total * 100) + '%';

  var order = shuffle(q.options.map(function(_, i) { return i; }));
  var cont = document.getElementById('q-opts');
  cont.innerHTML = '';

  order.forEach(function(origIdx, pos) {
    var btn = document.createElement('button');
    btn.className = 'opt';
    btn.dataset.orig = String(origIdx);
    btn.innerHTML = '<span class="opt-L">' + LTRS[pos] + '</span><span>' + q.options[origIdx] + '</span>';
    btn.addEventListener('click', function() {
      if (!answered) {
        answered = true;
        handleAnswer(origIdx, q.correct);
      }
    });
    cont.appendChild(btn);
  });

  var card = document.getElementById('q-card');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = '';
}

function handleAnswer(selIdx, corrIdx) {
  var all = document.querySelectorAll('.opt');

  all.forEach(function(b) {
    b.disabled = true;
    b.style.pointerEvents = 'none';
  });

  var ok = (selIdx === corrIdx);

  all.forEach(function(b) {
    var orig = Number(b.dataset.orig);
    if (orig === selIdx) {
      b.classList.add(ok ? 'correct' : 'wrong');
    }
    if (!ok && orig === corrIdx) {
      b.classList.add('correct');
    }
  });

  if (ok) {
    score++;
    document.getElementById('score-live').textContent = '✅ ' + score;
  }

  setTimeout(function() {
    curIdx++;
    if (curIdx >= shuffled.length) {
      finishTest(false);
    } else {
      renderQ();
    }
  }, ok ? 1100 : 1700);
}

function startTimer() {
  clearInterval(timerID);
  updateTimer();
  timerID = setInterval(function() {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timerID);
      finishTest(true);
    }
  }, 1000);
}

function updateTimer() {
  var mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  var ss = String(timeLeft % 60).padStart(2, '0');
  var el = document.getElementById('timer');
  el.textContent = '⏱ ' + mm + ':' + ss;
  el.classList.toggle('danger', timeLeft <= 120);
}

function finishTest(timeout) {
  clearInterval(timerID);
  clearTimeout(eyeTimer);

  var total = shuffled.length;
  var wrong = total - score;
  var pct = Math.round(score / total * 100);

  document.getElementById('rs-c').textContent = score;
  document.getElementById('rs-w').textContent = wrong;
  document.getElementById('rs-t').textContent = total;
  document.getElementById('res-big').textContent = score + ' / ' + total;
  document.getElementById('res-pct').textContent = pct + '%';
  document.getElementById('res-title').textContent = timeout ? 'Уақыт бітті!' : resTitle(pct);
  document.getElementById('res-emoji').textContent = resEmoji(pct, timeout);

  showPage('page-result');

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      document.getElementById('res-prog').style.width = pct + '%';
    });
  });
}

function resTitle(p) {
  if (p >= 90) return 'Тамаша нәтиже! 🎉';
  if (p >= 70) return 'Жақсы нәтиже!';
  if (p >= 50) return 'Орташа нәтиже';
  return 'Қайта оқып, тапсырыңыз';
}

function resEmoji(p, t) {
  if (t) return '⏰';
  if (p >= 90) return '🏆';
  if (p >= 70) return '🎯';
  if (p >= 50) return '📚';
  return '💪';
}

function retakeTest() { startTest(); }

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
    setOn('btn-warm', false);
  }
  document.body.classList.toggle('dark', isDark);
  setOn('btn-dark', isDark);
}

function toggleWarm() {
  isWarm = !isWarm;
  if (isWarm) {
    isDark = false;
    document.body.classList.remove('dark');
    setOn('btn-dark', false);
  }
  document.body.classList.toggle('warm', isWarm);
  setOn('btn-warm', isWarm);
}

function toggleFont() {
  isLarge = !isLarge;
  document.body.classList.toggle('large', isLarge);
  setOn('btn-font', isLarge);
}

function setOn(id, on) {
  document.querySelectorAll('#' + id).forEach(function(b) {
    b.classList.toggle('on', on);
  });
}

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr;
}

function showToast(msg) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastT);
  toastT = setTimeout(function() { el.classList.add('hidden'); }, 2500);
}

function lockContent() {
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    showToast('🚫 Мәтінді көшіруге болмайды');
  });

  document.addEventListener('keydown', function(e) {
    var ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && ['c','x','v','u','s','a'].indexOf(e.key.toLowerCase()) >= 0) {
      e.preventDefault();
      showToast('🚫 Мәтінді көшіруге болмайды');
      return false;
    }
    if (e.key === 'F12') { e.preventDefault(); return false; }
    if (ctrl && e.shiftKey && e.key.toLowerCase() === 'i') { e.preventDefault(); return false; }
  });

  ['copy','cut','paste'].forEach(function(ev) {
    document.addEventListener(ev, function(e) {
      e.preventDefault();
      showToast('🚫 Мәтінді көшіруге болмайды');
    });
  });

  document.addEventListener('selectstart', function(e) {
    if (e.target.closest('.q-text, .q-opts')) e.preventDefault();
  });

  document.addEventListener('dragstart', function(e) { e.preventDefault(); });
}
