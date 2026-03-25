
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

// Тілді ауыстыру
function setLang(lang) {
  localStorage.setItem("lang", lang);

  document.body.innerHTML = document.body.innerHTML
    .replace(
      "Сайтта жөндеу жұмыстары жүргізілуде",
      translations[lang].title
    )
    .replace(
      "Қолайсыздықтар үшін кешірім сұраймыз!",
      translations[lang].desc
    );
}

// Батырмаларды табу (Қаз / Рус)
document.querySelectorAll("button").forEach(btn => {
  if (btn.innerText.includes("Рус")) {
    btn.onclick = () => setLang("ru");
  }
  if (btn.innerText.includes("Қаз")) {
    btn.onclick = () => setLang("kz");
  }
});

// Бастапқы тіл
const savedLang = localStorage.getItem("lang") || "kz";
if (savedLang === "ru") {
  setLang("ru");
}