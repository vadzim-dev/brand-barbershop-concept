const BOOKSY = 'https://booksy.com/pl-pl/67599_brand-barbershop_barber-shop_3_warszawa';
const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const BARBERS = [
  { id: 'any', tier: 'barber' },
  { id: 'Roman', tier: 'barber' },
  { id: 'Andrzej', tier: 'barber' },
  { id: 'Darina', tier: 'top' },
  { id: 'Karim', tier: 'top' },
  { id: 'Zahar', tier: 'master' }
];

const SERVICES = [
  { id: 'cut', main: true, price: { barber: 120, top: 140, master: 140 }, time: { barber: 45, top: 60, master: 60 } },
  { id: 'combo', main: true, price: { barber: 180, top: 200, master: 245 }, time: { barber: 75, top: 75, master: 60 } },
  { id: 'beard', main: true, price: { barber: 80, top: 100, master: 125 }, time: { barber: 30, top: 30, master: 30 } },
  { id: 'clipper', main: true, price: 100, time: 45 },
  { id: 'clipperBeard', price: 150, time: 60 },
  { id: 'kid', price: 100, time: 45 },
  { id: 'fatherSon', price: 190, time: 75 },
  { id: 'greyHair', price: 80, time: 30 },
  { id: 'greyBeard', price: 80, time: 30 },
  { id: 'greyCombo', price: 150, time: 45 },
  { id: 'wash', price: 50, time: 15 },
  { id: 'wax', price: 40, time: 15 }
];

const MERGES = [
  { parts: ['cut', 'beard'], into: 'combo', key: 'hint.combo' },
  { parts: ['greyHair', 'greyBeard'], into: 'greyCombo', key: 'hint.grey' }
];

const HOURS = [
  ['09:00', '21:00'],
  ['09:00', '21:00'],
  ['09:00', '21:00'],
  ['09:00', '21:00'],
  ['09:00', '21:00'],
  ['10:00', '20:00'],
  ['10:00', '20:00']
];

const REVIEWS = [
  { name: 'Adam', staff: 'Karim', text: 'Najlepszy barber, u jakiego byłem.' },
  { name: 'Michał', staff: 'Zahar', text: 'Chodzę do Zahara regularnie od wielu lat i nigdy się nie zawiodłem. Prawdziwy fachowiec.' },
  { name: 'Petihko', staff: 'Andrzej', text: 'Wszystko dokładnie, fajna atmosfera i widać, że zna się na rzeczy. Na pewno wrócę!' },
  { name: 'Elchin', staff: 'Karim', text: 'As always, perfect service, amazing coffee and friendly atmosphere.' },
  { name: 'Anton', staff: 'Darina', text: 'Profesjonalna, miła i zawsze dokładnie wie, czego potrzebuję.' },
  { name: 'Ilya', staff: 'Roman', text: 'Fryzura została wykonana na najwyższym poziomie.' }
];

const state = {
  lang: 'pl',
  barber: 'any',
  picked: new Set(),
  shown: 0,
  more: false,
  quote: 0,
  timer: null
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function t(key, vars) {
  let str = (I18N[state.lang] || I18N.pl)[key] ?? I18N.pl[key] ?? key;
  if (vars && typeof str === 'string') {
    for (const [k, v] of Object.entries(vars)) str = str.replace(`{${k}}`, v);
  }
  return str;
}

function store(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch (e) {
    return null;
  }
}

function tier() {
  return BARBERS.find(b => b.id === state.barber).tier;
}

function priceOf(svc, tr = tier()) {
  return typeof svc.price === 'object' ? svc.price[tr] : svc.price;
}

function timeOf(svc, tr = tier()) {
  return typeof svc.time === 'object' ? svc.time[tr] : svc.time;
}

function byId(id) {
  return SERVICES.find(s => s.id === id);
}

function fmtTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} ${t('sum.min')}`;
  return m ? `${h} ${t('sum.h')} ${m} ${t('sum.min')}` : `${h} ${t('sum.h')}`;
}

function warsawNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Warsaw',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const get = type => parts.find(p => p.type === type).value;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return { day: days.indexOf(get('weekday')), min: +get('hour') * 60 + +get('minute') };
}

function toMin(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

function tween(to) {
  const els = [$('#sumTotal'), $('#dockTotal')];
  const from = state.shown;
  state.shown = to;
  if (REDUCE || from === to) {
    els.forEach(el => { el.textContent = to; });
    return;
  }
  const start = performance.now();
  const step = now => {
    const p = Math.min((now - start) / 450, 1);
    const v = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    els.forEach(el => { el.textContent = v; });
    if (p < 1 && state.shown === to) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function renderStatus() {
  const { day, min } = warsawNow();
  const [open, close] = HOURS[day];
  const el = $('#status');
  let text;
  let isOpen = false;
  if (min >= toMin(open) && min < toMin(close)) {
    text = t('status.open', { t: close });
    isOpen = true;
  } else if (min < toMin(open)) {
    text = t('status.today', { t: open });
  } else {
    text = t('status.tomorrow', { t: HOURS[(day + 1) % 7][0] });
  }
  el.classList.toggle('is-open', isOpen);
  $('span', el).textContent = text;
}

function renderBarbers() {
  $('#barbers').innerHTML = BARBERS.map(b => {
    const on = b.id === state.barber;
    const name = b.id === 'any' ? t('calc.any') : b.id;
    const letter = b.id === 'any' ? '★' : b.id[0];
    return `
      <button class="barber${on ? ' is-on' : ''}" type="button" role="radio" aria-checked="${on}" data-barber="${b.id}">
        <span class="barber__ava" aria-hidden="true">${letter}</span>
        <b>${name}</b>
        <small>${t('calc.from', { p: priceOf(byId('cut'), b.tier) })}</small>
      </button>`;
  }).join('');
}

function svcRow(svc) {
  const on = state.picked.has(svc.id);
  return `
    <label class="svc${on ? ' is-on' : ''}">
      <input type="checkbox" value="${svc.id}"${on ? ' checked' : ''}>
      <span class="svc__box" aria-hidden="true"></span>
      <span class="svc__name">${t('svc.' + svc.id)}<small>${fmtTime(timeOf(svc))}</small></span>
      <b class="svc__price" data-svc="${svc.id}">${priceOf(svc)} zł</b>
    </label>`;
}

function renderServices() {
  $('#services').innerHTML = SERVICES.filter(s => s.main).map(svcRow).join('');
  $('#servicesMore').innerHTML = SERVICES.filter(s => !s.main).map(svcRow).join('');
  renderMore();
}

function renderMore() {
  const btn = $('#moreBtn');
  btn.setAttribute('aria-expanded', state.more);
  btn.textContent = state.more ? t('calc.less') : t('calc.more');
  $('#more').classList.toggle('is-open', state.more);
}

function refreshPrices() {
  $$('.svc__price').forEach(el => {
    const svc = byId(el.dataset.svc);
    el.previousElementSibling.querySelector('small').textContent = fmtTime(timeOf(svc));
    const next = `${priceOf(svc)} zł`;
    if (el.textContent === next) return;
    el.textContent = next;
    el.classList.remove('is-flip');
    void el.offsetWidth;
    el.classList.add('is-flip');
  });
}

function renderSum() {
  const items = SERVICES.filter(s => state.picked.has(s.id));
  const total = items.reduce((sum, s) => sum + priceOf(s), 0);
  const time = items.reduce((sum, s) => sum + timeOf(s), 0);
  const label = items.length ? fmtTime(time) : '';

  $('#sumTime').textContent = label;
  $('#dockTime').textContent = label;
  $('#sum').classList.toggle('is-empty', !items.length);
  tween(total);

  const dock = $('#dock');
  dock.classList.toggle('is-shown', items.length > 0);
  dock.setAttribute('aria-hidden', items.length ? 'false' : 'true');
  $('#dockBook').tabIndex = items.length ? 0 : -1;

  const merge = MERGES.find(m => m.parts.every(p => state.picked.has(p)) && !state.picked.has(m.into));
  const hint = $('#hint');
  if (merge) {
    const save = merge.parts.reduce((sum, id) => sum + priceOf(byId(id)), 0) - priceOf(byId(merge.into));
    if (save > 0) {
      $('#hintText').textContent = t(merge.key, { x: save });
      hint.dataset.merge = merge.into;
      hint.hidden = false;
      return;
    }
  }
  hint.hidden = true;
}

function renderQuotes() {
  $('#quotes').innerHTML = REVIEWS.map((r, i) => `
    <figure class="quote${i === state.quote ? ' is-on' : ''}" aria-hidden="${i !== state.quote}">
      <blockquote>„${r.text}”</blockquote>
      <figcaption>${r.name}, ${t('reviews.at', { s: r.staff })}</figcaption>
    </figure>`).join('');
  $('#dots').innerHTML = REVIEWS.map((r, i) => `
    <button type="button" class="${i === state.quote ? 'is-on' : ''}" data-quote="${i}" aria-label="${t('reviews.go', { n: i + 1 })}"></button>`).join('');
}

function showQuote(i) {
  state.quote = (i + REVIEWS.length) % REVIEWS.length;
  $$('.quote').forEach((q, n) => {
    q.classList.toggle('is-on', n === state.quote);
    q.setAttribute('aria-hidden', n !== state.quote);
  });
  $$('#dots button').forEach((d, n) => d.classList.toggle('is-on', n === state.quote));
}

function startQuotes() {
  clearInterval(state.timer);
  if (!REDUCE) state.timer = setInterval(() => showQuote(state.quote + 1), 5000);
}

function renderHours() {
  const { day } = warsawNow();
  const names = t('days');
  $('#hours').innerHTML = HOURS.map(([a, b], i) => `
    <tr${i === day ? ' class="is-today"' : ''}>
      <th scope="row">${names[i]}${i === day ? ` <em>${t('visit.today')}</em>` : ''}</th>
      <td>${a}–${b}</td>
    </tr>`).join('');
}

function applyStatic() {
  document.documentElement.lang = state.lang;
  $$('[data-i18n]').forEach(el => {
    el.innerHTML = t(el.dataset.i18n);
  });
  $$('[data-i18n-alt]').forEach(el => {
    el.alt = t(el.dataset.i18nAlt);
  });
  $$('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  $$('.langs button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === state.lang));
}

function renderAll() {
  applyStatic();
  renderStatus();
  renderBarbers();
  renderServices();
  renderSum();
  renderQuotes();
  renderHours();
}

function setBarber(id) {
  if (id === state.barber) return;
  const before = tier();
  state.barber = id;
  $$('.barber').forEach(b => {
    const on = b.dataset.barber === id;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-checked', on);
  });
  if (before !== tier()) refreshPrices();
  renderSum();
}

function toggleService(id, on) {
  if (on) state.picked.add(id);
  else state.picked.delete(id);
  const input = $(`.svc input[value="${id}"]`);
  if (input) {
    input.checked = on;
    input.closest('.svc').classList.toggle('is-on', on);
  }
  if (on && !byId(id).main && !state.more) {
    state.more = true;
    renderMore();
  }
  renderSum();
}

function bindEvents() {
  $('.langs').addEventListener('click', e => {
    const btn = e.target.closest('button[data-lang]');
    if (!btn || btn.dataset.lang === state.lang) return;
    state.lang = btn.dataset.lang;
    store('brand.lang', state.lang);
    renderAll();
  });

  $('#barbers').addEventListener('click', e => {
    const btn = e.target.closest('.barber');
    if (btn) setBarber(btn.dataset.barber);
  });

  $('#cennik').addEventListener('change', e => {
    if (e.target.matches('.svc input')) toggleService(e.target.value, e.target.checked);
  });

  $('#moreBtn').addEventListener('click', () => {
    state.more = !state.more;
    renderMore();
  });

  $('#hintBtn').addEventListener('click', () => {
    const merge = MERGES.find(m => m.into === $('#hint').dataset.merge);
    if (!merge) return;
    merge.parts.forEach(id => toggleService(id, false));
    toggleService(merge.into, true);
  });

  $('#dots').addEventListener('click', e => {
    const btn = e.target.closest('[data-quote]');
    if (!btn) return;
    showQuote(+btn.dataset.quote);
    startQuotes();
  });

  let startX = null;
  const quotes = $('#quotes');
  quotes.addEventListener('pointerdown', e => { startX = e.clientX; });
  quotes.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) < 40) return;
    showQuote(state.quote + (dx < 0 ? 1 : -1));
    startQuotes();
  });

  $('#founderBtn').addEventListener('click', () => {
    const btn = $('#founderBtn');
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', open);
    $('#founder').classList.toggle('is-open', open);
    if (open && !REDUCE) {
      setTimeout(() => $('#founderPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 350);
    }
  });

  $('#founderBook').addEventListener('click', () => {
    setBarber('Karim');
    $('#cennik').scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
  });

  const progress = $('#progress');
  const top = $('#top');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      top.classList.toggle('is-scrolled', scrollY > 8);
    });
  }, { passive: true });
}

function bindReveal() {
  const targets = $$('.block > *, .founder');
  if (REDUCE || !('IntersectionObserver' in window)) return;
  targets.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  targets.forEach(el => io.observe(el));
}

function init() {
  const saved = store('brand.lang');
  const nav = (navigator.language || 'pl').slice(0, 2);
  state.lang = I18N[saved] ? saved : I18N[nav] ? nav : 'pl';
  ['#sumBook', '#dockBook'].forEach(sel => {
    $(sel).href = BOOKSY;
  });
  renderAll();
  bindEvents();
  bindReveal();
  startQuotes();
  setInterval(renderStatus, 60000);
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
}

init();
