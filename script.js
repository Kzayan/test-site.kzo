const translations = {
  kz: {
    title: "Сайтта жөндеу жұмыстары жүргізілуде",
    desc: "Қолайсыздықтар үшін кешірім сұраймыз!"
  },
  ru: {
    title: "На сайте ведутся технические работы",
    desc: "Приносим извинения за неудобства!"
  }
};

function setLang(lang) {
  document.getElementById("title").innerText = translations[lang].title;
  document.getElementById("desc").innerText = translations[lang].desc;
}

// Бастапқы тіл
setLang("kz");