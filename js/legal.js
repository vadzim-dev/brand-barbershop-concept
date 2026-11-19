const TITLES = {
  pl: 'Polityka prywatności · BRAND Barbershop',
  en: 'Privacy policy · BRAND Barbershop',
  ru: 'Политика конфиденциальности · BRAND Barbershop',
  tr: 'Gizlilik politikası · BRAND Barbershop'
};

function savedLang() {
  try {
    return localStorage.getItem('brand.lang');
  } catch (e) {
    return null;
  }
}

function showLang(lang) {
  document.documentElement.lang = lang;
  document.title = TITLES[lang];
  document.querySelectorAll('[data-doc]').forEach(doc => {
    doc.hidden = doc.dataset.doc !== lang;
  });
  document.querySelectorAll('.langs button').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.dataset.lang === lang);
  });
}

document.querySelector('.langs').addEventListener('click', e => {
  const btn = e.target.closest('button[data-lang]');
  if (!btn) return;
  showLang(btn.dataset.lang);
  try {
    localStorage.setItem('brand.lang', btn.dataset.lang);
  } catch (e) {}
});

const browser = (navigator.language || 'pl').slice(0, 2);
const start = savedLang() || browser;
showLang(TITLES[start] ? start : 'pl');
