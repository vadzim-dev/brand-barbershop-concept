const BOOKSY = 'https://booksy.com/pl-pl/67599_brand-barbershop_barber-shop_3_warszawa';
const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const BARBERS = [
  { id: 'any', tier: 'barber' },
  { id: 'Roman', tier: 'barber' },
  { id: 'Andrzej', tier: 'barber' },
  { id: 'Darina', tier: 'top' },
  { id: 'Karim', tier: 'top', photo: 'assets/karim.webp' },
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

const RATINGS = [[5, 1065], [4, 7], [3, 6], [2, 4], [1, 4]];

const REVIEWS = [
  { name: 'Adam', staff: 'Karim', text: 'Najlepszy barber, u jakiego byłem. Brodę zawsze strzyże bardzo dokładnie i zgodnie z tym, o co proszę.' },
  { name: 'Petihko', staff: 'Andrzej', text: 'Byłem u Andrzeja i naprawdę super robota. Wszystko dokładnie, fajna atmosfera i widać, że zna się na rzeczy. Na pewno wrócę! 👌' },
  { name: 'VOLODYMYR', staff: 'Zahar', text: 'Zakhar is a super barber! High quality haircut and friendly atmosphere. I recommend! 😉' },
  { name: 'Anton', staff: 'Darina', text: 'Darina to świetna fryzjerka — profesjonalna, miła i zawsze dokładnie wie, czego potrzebuję, gorąco polecam!' },
  { name: 'Ilya', staff: 'Roman', text: 'Dziękuję za wspaniałą atmosferę i punktualność Romana. Fryzura została wykonana na najwyższym poziomie, napewno wrócę tu jeszcze raz.' },
  { name: 'Elchin', staff: 'Karim', text: 'As always, perfect service, amazing coffee and friendly atmosphere. Thanks Karim' },
  { name: 'Michał', staff: 'Zahar', text: 'Chodzę do Zahara regularnie od wielu lat i nigdy się nie zawiodłem. Prawdziwy fachowiec. Serdecznie polecam' },
  { name: 'Omar', staff: 'Andrzej', text: 'Andrzej is a great skilled barber, very sweet and kind guy too, surely coming back' },
  { name: 'Can', staff: 'Darina', text: 'Najlepsi w Warszawie! Bardzo polecam, za każdym razem wychodzę zadowolony 🚀' },
  { name: 'Grzegorz', staff: 'Karim', text: 'Jak zwykle świetna robota! Szybko, precyzyjnie i z klasą!' },
  { name: 'Berat can', staff: 'Karim', text: 'Karim mükemmel bir berber herşeyi ile muhteşem' },
  { name: 'Aleksander', staff: 'Zahar', text: 'Polecam Zahara w 100%. Bardzo dobry i dokładny barber. Pełna satysfakcja z wizyty gwarantowana' },
  { name: 'Piotr', staff: 'Darina', text: 'Miła obsługa. Strzyżenie ładne i dokładne, co najważniejsze kawke dostałem. Cena adekwatna do jakości czyli sztosik' },
  { name: 'Yehor', staff: 'Karim', text: 'Chodzę tutaj od lat i nigdy się nie zawiodłem. Polecam 10/10' },
  { name: 'Szymon', staff: 'Andrzej', text: 'Polecam bardzo serdecznie, barber Andrzej najlepszy u jakiego byłem!! 😄 Napewno wrócę.' },
  { name: 'Jeffery', staff: 'Zahar', text: 'Great haircut as always! Zakhar is the best. 🏆' }
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
  const dict = I18N[state.lang] || I18N.pl;
  let str = dict[key] ?? I18N.pl[key] ?? key;
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

function tween(to, dur = 520) {
  const el = $('#billTotal');
  const dock = $('#dockTotal');
  const from = state.shown;
  state.shown = to;
  if (REDUCE || from === to) {
    el.textContent = to;
    dock.textContent = to;
    return;
  }
  el.classList.remove('is-bump');
  void el.offsetWidth;
  el.classList.add('is-bump');
  const start = performance.now();
  const step = now => {
    const p = Math.min((now - start) / dur, 1);
    const v = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    el.textContent = v;
    dock.textContent = v;
    if (p < 1 && state.shown === to) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function countUp(el) {
  const to = parseFloat(el.dataset.count);
  const dec = +(el.dataset.decimals || 0);
  if (REDUCE) {
    el.textContent = to.toFixed(dec);
    return;
  }
  const start = performance.now();
  const dur = 1400;
  const step = now => {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = (to * (1 - Math.pow(1 - p, 4))).toFixed(dec);
    if (p < 1) requestAnimationFrame(step);
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

function renderTicker() {
  const row = t('ticker').map(w => `<span>${w}</span><i class="ticker__dot"></i>`).join('');
  $('#ticker').innerHTML = row + row;
}

function avatar(b) {
  if (b.photo) return `<span class="barber__ava"><img src="${b.photo}" alt=""></span>`;
  if (b.id === 'any') return '<span class="barber__ava barber__ava--any">★</span>';
  return `<span class="barber__ava">${b.id[0]}</span>`;
}

function renderBarbers() {
  $('#barbers').innerHTML = BARBERS.map(b => {
    const on = b.id === state.barber;
    const name = b.id === 'any' ? t('calc.any') : b.id;
    const note = b.id === 'any' ? t('calc.anyNote') : t('calc.from', { p: priceOf(byId('cut'), b.tier) });
    return `
      <button class="barber${on ? ' is-on' : ''}" type="button" role="radio" aria-checked="${on}" data-barber="${b.id}">
        ${avatar(b)}
        <b>${name}</b>
        <small>${note}</small>
      </button>`;
  }).join('');
}

function svcRow(svc) {
  const on = state.picked.has(svc.id);
  return `
    <label class="svc${on ? ' is-on' : ''}">
      <input type="checkbox" value="${svc.id}"${on ? ' checked' : ''}>
      <span class="svc__box" aria-hidden="true"></span>
      <span class="svc__text">
        <b>${t('svc.' + svc.id)}</b>
        <small>${t('svc.' + svc.id + '.d')} · ${fmtTime(timeOf(svc))}</small>
      </span>
      <b class="svc__price" data-svc="${svc.id}">${priceOf(svc)} zł</b>
    </label>`;
}

function renderServices() {
  $('#services').innerHTML = SERVICES.filter(s => s.main).map(svcRow).join('');
  $('#servicesMore').innerHTML = SERVICES.filter(s => !s.main).map(svcRow).join('');
  renderMoreBtn();
}

function renderMoreBtn() {
  const btn = $('#moreBtn');
  btn.setAttribute('aria-expanded', state.more);
  $('span', btn).textContent = state.more ? t('calc.less') : t('calc.more');
  $('#more').classList.toggle('is-open', state.more);
}

function refreshPrices() {
  $$('.svc__price').forEach(el => {
    const svc = byId(el.dataset.svc);
    const next = `${priceOf(svc)} zł`;
    const small = el.previousElementSibling.querySelector('small');
    small.textContent = `${t('svc.' + svc.id + '.d')} · ${fmtTime(timeOf(svc))}`;
    if (el.textContent === next) return;
    el.classList.remove('is-flip');
    void el.offsetWidth;
    el.textContent = next;
    el.classList.add('is-flip');
  });
}

function findMerge() {
  return MERGES.find(m => m.parts.every(p => state.picked.has(p)) && !state.picked.has(m.into));
}

function renderBill() {
  const items = SERVICES.filter(s => state.picked.has(s.id));
  const total = items.reduce((sum, s) => sum + priceOf(s), 0);
  const time = items.reduce((sum, s) => sum + timeOf(s), 0);
  const b = BARBERS.find(x => x.id === state.barber);

  $('#billWho').innerHTML = `${avatar(b)}<span>${b.id === 'any' ? t('sum.anyone') : b.id}</span>`;
  $('#billList').innerHTML = items.map(s => `
    <li>
      <span>${t('svc.' + s.id)}</span>
      <b>${priceOf(s)} zł</b>
      <button type="button" class="bill__x" data-remove="${s.id}" aria-label="${t('sum.remove')}: ${t('svc.' + s.id)}">×</button>
    </li>`).join('');

  $('#billEmpty').hidden = items.length > 0;
  $('#billTime').textContent = items.length ? fmtTime(time) : '';
  tween(total);

  $('#dock').classList.toggle('is-shown', items.length > 0);
  $('#dock').setAttribute('aria-hidden', items.length ? 'false' : 'true');
  $('#dockBook').tabIndex = items.length ? 0 : -1;

  const merge = findMerge();
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

function renderBars() {
  const max = RATINGS[0][1];
  $('#bars').innerHTML = RATINGS.map(([n, count]) => `
    <li>
      <span>${n}★</span>
      <span class="bars__track"><i style="--v:${Math.max(count / max, 0.008)}"></i></span>
      <b>${count}</b>
    </li>`).join('');
}

function renderQuotes() {
  $('#quotes').innerHTML = REVIEWS.map((r, i) => `
    <figure class="quote${i === state.quote ? ' is-on' : ''}" aria-hidden="${i !== state.quote}">
      <span class="stars" aria-hidden="true">★★★★★</span>
      <blockquote>${r.text}</blockquote>
      <figcaption>
        <span class="quote__ava">${r.name[0].toUpperCase()}</span>
        <span><b>${r.name}</b><small>${t('reviews.at', { s: r.staff })} · Booksy</small></span>
      </figcaption>
    </figure>`).join('');
  $('#quoteDots').innerHTML = `
    <button type="button" class="quotes__arrow quotes__arrow--prev" data-step="-1" aria-label="${t('reviews.prev')}"></button>
    <span class="quotes__count"><b id="quoteNum"></b> / ${String(REVIEWS.length).padStart(2, '0')}</span>
    <button type="button" class="quotes__arrow" data-step="1" aria-label="${t('reviews.next')}"></button>
    <span class="quotes__bar" id="quoteBar"></span>`;
  showQuote(state.quote);
}

function showQuote(i) {
  state.quote = (i + REVIEWS.length) % REVIEWS.length;
  $$('.quote').forEach((q, n) => {
    q.classList.toggle('is-on', n === state.quote);
    q.setAttribute('aria-hidden', n !== state.quote);
  });
  $('#quoteNum').textContent = String(state.quote + 1).padStart(2, '0');
  restartBar();
}

function restartBar() {
  const bar = $('#quoteBar');
  bar.classList.remove('is-run');
  void bar.offsetWidth;
  bar.classList.add('is-run');
}

function startQuotes() {
  stopQuotes();
  if (REDUCE) return;
  state.timer = setInterval(() => showQuote(state.quote + 1), 5500);
  $('#quoteDots').classList.remove('is-paused');
  restartBar();
}

function stopQuotes() {
  clearInterval(state.timer);
  $('#quoteDots').classList.add('is-paused');
}

function renderHours() {
  const { day } = warsawNow();
  const names = t('days');
  $('#hours').innerHTML = HOURS.map(([a, b], i) => `
    <tr${i === day ? ' class="is-today"' : ''}>
      <th scope="row">${names[i]}${i === day ? ` <em>${t('visit.today')}</em>` : ''}</th>
      <td>${a} – ${b}</td>
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

function splitTitle() {
  const title = $('.hero__title');
  const words = title.textContent.trim().split(/ +/);
  title.innerHTML = words.map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`).join(' ');
}

function renderAll() {
  applyStatic();
  splitTitle();
  renderStatus();
  renderTicker();
  renderBarbers();
  renderServices();
  renderBill();
  renderBars();
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
  renderBill();
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
    renderMoreBtn();
  }
  renderBill();
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

  $('#barbers').addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const i = BARBERS.findIndex(b => b.id === state.barber);
    const next = BARBERS[(i + (e.key === 'ArrowRight' ? 1 : BARBERS.length - 1)) % BARBERS.length];
    setBarber(next.id);
    $(`.barber[data-barber="${next.id}"]`).focus();
  });

  $('.calc__main').addEventListener('change', e => {
    if (e.target.matches('.svc input')) toggleService(e.target.value, e.target.checked);
  });

  $('#moreBtn').addEventListener('click', () => {
    state.more = !state.more;
    renderMoreBtn();
  });

  $('#billList').addEventListener('click', e => {
    const btn = e.target.closest('[data-remove]');
    if (btn) toggleService(btn.dataset.remove, false);
  });

  $('#hintBtn').addEventListener('click', () => {
    const merge = MERGES.find(m => m.into === $('#hint').dataset.merge);
    if (!merge) return;
    merge.parts.forEach(id => toggleService(id, false));
    toggleService(merge.into, true);
  });

  $('#founderBtn').addEventListener('pointermove', e => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
  });

  $('#founderBtn').addEventListener('click', () => {
    const btn = $('#founderBtn');
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', open);
    $('#zalozyciel').classList.toggle('is-open', open);
    if (open && !REDUCE) {
      setTimeout(() => $('#founderPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 450);
    }
  });

  $('#founderBook').addEventListener('click', () => {
    setBarber('Karim');
    if (!state.picked.size) toggleService('cut', true);
    $('#cennik').scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
  });

  $('#quoteDots').addEventListener('click', e => {
    const btn = e.target.closest('[data-step]');
    if (!btn) return;
    showQuote(state.quote + +btn.dataset.step);
    startQuotes();
  });

  const stage = $('.quotes');
  stage.addEventListener('mouseenter', stopQuotes);
  stage.addEventListener('mouseleave', startQuotes);
  stage.addEventListener('focusin', stopQuotes);
  stage.addEventListener('focusout', startQuotes);

  const burger = $('#burger');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open);
    document.body.classList.toggle('menu-open', open);
  });

  $('#nav').addEventListener('click', e => {
    if (!e.target.closest('a')) return;
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
}

function bindScroll() {
  const bar = $('#topbar');
  const progress = $('#progress');
  const cut = $('.cut');
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.classList.toggle('is-scrolled', y > 8);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    const r = cut.getBoundingClientRect();
    const p = Math.min(Math.max((innerHeight - r.top) / (innerHeight + r.height), 0), 1);
    const eased = Math.min(Math.max((p - 0.15) / 0.6, 0), 1);
    cut.style.setProperty('--p', eased);
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

function bindReveal() {
  const targets = $$('.section__head, .step, .bill, .about__media, .about__text, .reviews__score, .quotes, .visit__info, .visit__map, .founder');
  targets.forEach(el => el.classList.add('reveal'));
  const counters = $$('[data-count]');

  if (REDUCE || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-in'));
    $('#opinie').classList.add('is-in');
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      if (entry.target.dataset.count) countUp(entry.target);
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  targets.forEach(el => io.observe(el));
  counters.forEach(el => io.observe(el));
  io.observe($('#opinie'));
}

function setTheme(dark) {
  const root = document.documentElement;
  if (dark) root.dataset.theme = 'dark';
  else delete root.dataset.theme;
  $('meta[name="theme-color"]').content = dark ? '#0b0c0f' : '#15161a';
  store('brand.theme', dark ? 'dark' : 'light');
}

function bindTheme() {
  const btn = $('#themeBtn');
  btn.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    if (REDUCE || !document.startViewTransition) {
      setTheme(dark);
      return;
    }
    const r = btn.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const tr = document.startViewTransition(() => setTheme(dark));
    tr.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 750, easing: 'cubic-bezier(.65, 0, .35, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  });
}

function runIntro(done) {
  const intro = $('#intro');
  let seen = false;
  try { seen = sessionStorage.getItem('brand.intro') === '1'; } catch (e) {}
  if (REDUCE || seen) {
    intro.remove();
    done();
    return;
  }
  try { sessionStorage.setItem('brand.intro', '1'); } catch (e) {}
  document.body.classList.add('is-intro');
  requestAnimationFrame(() => intro.classList.add('is-on'));
  setTimeout(() => {
    intro.classList.add('is-out');
    document.body.classList.remove('is-intro');
    done();
  }, 1250);
  setTimeout(() => intro.remove(), 2300);
}


function bindFx() {
  if (REDUCE || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  $$('.btn, .theme, .founder__plus').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.translate = `${dx * 0.22}px ${dy * 0.32}px`;
    });
    el.addEventListener('pointerleave', () => { el.style.translate = ''; });
  });

  document.addEventListener('pointermove', e => {
    const card = e.target.closest('.svc, .barber, .perks li, .quote, .bill');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--sx', e.clientX - r.left + 'px');
    card.style.setProperty('--sy', e.clientY - r.top + 'px');
  }, { passive: true });

  const hero = $('.hero');
  const media = $('.hero__media');
  hero.addEventListener('pointermove', e => {
    const r = media.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    media.style.transform = `perspective(1100px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg)`;
  });
  hero.addEventListener('pointerleave', () => { media.style.transform = ''; });
}

function bindParallax() {
  if (REDUCE) return;
  const items = [[$('.about__img--b'), -0.12], [$('.about__img--a'), 0.05]];
  let ticking = false;
  const update = () => {
    ticking = false;
    items.forEach(([el, k]) => {
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2 - innerHeight / 2;
      el.style.translate = `0 ${(mid * k).toFixed(1)}px`;
    });
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

function init() {
  const saved = store('brand.lang');
  const nav = (navigator.language || 'pl').slice(0, 2);
  state.lang = I18N[saved] ? saved : I18N[nav] ? nav : 'pl';

  ['#heroBooksy', '#billBook', '#dockBook', '#reviewsLink'].forEach(sel => {
    $(sel).href = BOOKSY;
  });

  renderAll();
  bindEvents();
  bindScroll();
  bindReveal();
  startQuotes();
  bindTheme();
  bindFx();
  bindParallax();
  setInterval(renderStatus, 60000);
  runIntro(() => requestAnimationFrame(() => document.body.classList.add('is-ready')));
}

init();
