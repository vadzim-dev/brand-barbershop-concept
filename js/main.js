const BOOKSY = 'https://booksy.com/pl-pl/67599_brand-barbershop_barber-shop_3_warszawa';
const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const LAND = '.reviews__big, h2, .founder__label b';

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
  const navStatus = $('#mmStatus');
  navStatus.textContent = text;
  navStatus.classList.toggle('is-open', isOpen);
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

function splitName() {
  const b = $('.founder__label b');
  const name = b.textContent.trim();
  b.setAttribute('aria-label', name);
  b.innerHTML = [...name].map((ch, i) => `<span aria-hidden="true" style="--i:${i}">${ch}</span>`).join('');
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
    if (open) {
      const r = $('.founder__plus').getBoundingClientRect();
      fx.burst(r.left + r.width / 2, r.top + r.height / 2, 26);
    }
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
  const menu = $('#mmenu');
  const meta = $('meta[name="theme-color"]');
  const setMenu = open => {
    burger.setAttribute('aria-expanded', open);
    document.body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', !open);
    menu.inert = !open;
    meta.content = open ? '#10121a' : document.documentElement.dataset.theme === 'dark' ? '#0b0c0f' : '#15161a';
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
  });
}

function bindScroll() {
  const bar = $('#topbar');
  const progress = $('#progress');
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.classList.toggle('is-scrolled', y > 8);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
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
  const targets = $$('.cut, .section__head, .step, .bill, .about__media, .about__text, .reviews__score, .quotes, .visit__info, .visit__map, .founder');
  targets.forEach(el => el.classList.add('reveal'));

  if (REDUCE || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-in'));
    $('#opinie').classList.add('is-in');
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  targets.forEach(el => io.observe(el));
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
  const root = document.documentElement;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let busy = false;

  const instant = dark => {
    root.classList.add('theme-swap');
    setTheme(dark);
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-swap')));
  };

  btn.addEventListener('click', () => {
    if (busy) return;
    const dark = root.dataset.theme !== 'dark';
    if (REDUCE) {
      instant(dark);
      return;
    }
    busy = true;

    if (document.startViewTransition) {
      const r = btn.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const end = Math.ceil(Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)));
      const tr = document.startViewTransition(() => {
        root.classList.add('theme-swap');
        setTheme(dark);
      });
      tr.ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
          { duration: fine ? 650 : 750, easing: 'cubic-bezier(.65, 0, .35, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      });
      tr.finished.finally(() => {
        root.classList.remove('theme-swap');
        busy = false;
      });
      return;
    }

    root.classList.add('theme-fade');
    setTheme(dark);
    setTimeout(() => {
      root.classList.remove('theme-fade');
      busy = false;
    }, 650);
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
  const wait = document.fonts ? Promise.race([document.fonts.load('900 100px "Big Shoulders Display"'), new Promise(r => setTimeout(r, 700))]) : Promise.resolve();
  wait.catch(() => {}).then(() => {
    requestAnimationFrame(() => intro.classList.add('is-on'));
    setTimeout(() => {
      intro.classList.add('is-out');
      document.body.classList.remove('is-intro');
      done();
    }, 1500);
    setTimeout(() => intro.remove(), 2550);
  });
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
  const k = matchMedia('(pointer: coarse)').matches ? 0.6 : 1;
  const items = [
    { el: $('.about__img--b'), f: -0.12 * k, y: 0 },
    { el: $('.about__img--a'), f: 0.05 * k, y: 0 }
  ];
  const box = $('.about__media');
  let visible = false;
  let running = false;

  const target = it => {
    const r = it.el.getBoundingClientRect();
    return (r.top - it.y + r.height / 2 - innerHeight / 2) * it.f;
  };

  const frame = () => {
    let moving = false;
    items.forEach(it => {
      const to = target(it);
      it.y += (to - it.y) * 0.12;
      if (Math.abs(to - it.y) > 0.05) moving = true;
      else it.y = to;
      it.el.style.transform = `translate3d(0, ${it.y.toFixed(2)}px, 0)`;
    });
    if (visible || moving) requestAnimationFrame(frame);
    else running = false;
  };

  const start = () => {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  };

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) start();
  }, { rootMargin: '200px 0px' }).observe(box);
  window.addEventListener('scroll', () => { if (visible) start(); }, { passive: true });
}

function pageTop(el) {
  let y = 0;
  for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
  return y;
}

function glow(rgb) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, `rgba(${rgb}, 1)`);
  grad.addColorStop(.25, `rgba(${rgb}, .55)`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

const fx = { burst: () => {} };

function bindFlight() {
  if (REDUCE) return;
  const cv = document.createElement('canvas');
  cv.className = 'flight';
  cv.setAttribute('aria-hidden', 'true');
  document.body.append(cv);
  const ctx = cv.getContext('2d');
  const gold = glow('255, 190, 64');
  const hot = glow('255, 250, 232');
  const amber = glow('236, 146, 8');
  const inOut = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const ease = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const trail = [];
  const sparks = [];
  let flight = null;
  let raf = 0;
  let last = 0;
  let w = 0;
  let h = 0;
  let dark = false;

  const size = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    w = innerWidth;
    h = innerHeight;
    cv.width = w * dpr;
    cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const anchor = (id, goal, held) => {
    if (id === '#top') {
      const r = $('.logo').getBoundingClientRect();
      return () => ({ x: r.left + 18, y: r.top + r.height / 2 });
    }
    const head = $(id).querySelector(LAND) || $(id);
    return () => {
      const r = head.getBoundingClientRect();
      const shift = held() ? 0 : scrollY - goal;
      return { x: Math.max(22, r.left - 18), y: r.top + Math.min(r.height / 2, 26) + shift };
    };
  };

  const blend = () => {
    ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
  };

  const streak = (x, y, len, thick, angle, alpha) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.drawImage(dark ? hot : amber, -len, -thick, len * 2, thick * 2);
    ctx.restore();
  };

  const sparkle = (x, y, r, now, alpha) => {
    const tw = .82 + .18 * Math.sin(now / 31) * Math.sin(now / 53);
    const spin = now / 900;
    blend();
    ctx.globalAlpha = alpha * (dark ? .75 : .5);
    const g = r * 6 * tw;
    ctx.drawImage(dark ? gold : amber, x - g, y - g, g * 2, g * 2);

    const long = r * (3.4 + .9 * Math.sin(now / 47));
    streak(x, y, long, r * .32, spin, alpha * .95);
    streak(x, y, long * .9, r * .32, spin + Math.PI / 2, alpha * .95);
    const short = r * (1.5 + .7 * Math.sin(now / 37 + 1.3));
    streak(x, y, short, r * .22, spin + Math.PI / 4, alpha * .7);
    streak(x, y, short, r * .22, spin - Math.PI / 4, alpha * .7);

    ctx.globalCompositeOperation = 'source-over';
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);
    const k = r * 1.15 * tw;
    const c = k * .16;
    ctx.beginPath();
    ctx.moveTo(0, -k);
    ctx.quadraticCurveTo(c, -c, k, 0);
    ctx.quadraticCurveTo(c, c, 0, k);
    ctx.quadraticCurveTo(-c, c, -k, 0);
    ctx.quadraticCurveTo(-c, -c, 0, -k);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = dark ? '#fff3c4' : '#ffb81f';
    ctx.fill();
    if (!dark) {
      ctx.lineWidth = .9;
      ctx.strokeStyle = '#c47a00';
      ctx.stroke();
    }
    ctx.restore();

    blend();
    ctx.globalAlpha = alpha;
    const core = r * .9;
    ctx.drawImage(hot, x - core, y - core, core * 2, core * 2);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };

  const spark = (x, y, speed, life, big) => {
    const a = Math.random() * Math.PI * 2;
    const v = speed * (.3 + Math.random() * .7);
    sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life, size: big ? 3 + Math.random() * 3 : 1.5 + Math.random() * 2.5, star: big || Math.random() < .25, ph: Math.random() * 6 });
  };

  const TEXT = 'h1, h2, h3, h4, p, li, a, button, b, strong, small, span, em, label, address';
  const touch = (x, y) => {
    if (x < 0 || y < 0 || x > w || y > h) return;
    const hit = document.elementFromPoint(x, y);
    const t = hit && hit.closest(TEXT);
    if (!t || t.classList.contains('is-touched') || t.classList.contains('is-lit')) return;
    const text = t.textContent.trim();
    if (!text || text.length > 260) return;
    const cs = getComputedStyle(t);
    if (cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || cs.webkitTextFillColor === 'transparent') return;
    t.classList.add('is-touched');
    setTimeout(() => t.classList.remove('is-touched'), 1600);
  };

  const stopAll = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    trail.length = 0;
    sparks.length = 0;
    ctx.clearRect(0, 0, w, h);
    cv.classList.remove('is-on');
  };

  const step = f => {
    const now = f.now;
    const p = Math.min(1, (now - f.t0) / f.dur);
    if (!f.held) window.scrollTo({ top: f.from + (f.to - f.from) * inOut(p), behavior: 'instant' });
    const q = ease(p);
    const e = f.end();
    const dx = e.x - f.sx;
    const dy = e.y - f.sy;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const sway = f.amp * Math.sin(q * Math.PI * 3) * Math.sin(q * Math.PI);
    const x = f.sx + dx * q + nx * sway;
    const y = f.sy + dy * q + ny * sway;
    f.x = x;
    f.y = y;

    if (p < 1) {
      const prev = trail[trail.length - 1];
      if (prev) {
        const gap = Math.hypot(x - prev.x, y - prev.y);
        const n = Math.min(8, Math.floor(gap / 5));
        for (let i = 1; i <= n; i++) trail.push({ x: prev.x + (x - prev.x) * i / (n + 1), y: prev.y + (y - prev.y) * i / (n + 1) });
      }
      trail.push({ x, y });
      while (trail.length > 54) trail.shift();
      if (Math.random() < .8) spark(x, y, 1.1, 30 + Math.random() * 24);
      if (++f.tick % 2) touch(x, y);
    } else if (!f.landed) {
      f.landed = now;
      for (let i = 0; i < 26; i++) spark(e.x, e.y, 4.6, 40 + Math.random() * 26, i < 6);
      const head = f.id === '#top' ? $('.logo') : $(f.id).querySelector(LAND);
      if (head) {
        head.classList.remove('is-lit');
        void head.offsetWidth;
        head.classList.add('is-lit');
        setTimeout(() => head.classList.remove('is-lit'), 1300);
      }
    }
  };

  const loop = now => {
    const dt = Math.min(3, (now - last) / 16.67);
    last = now;
    if (flight) {
      flight.now = now;
      step(flight);
      if (flight.landed) trail.splice(0, Math.ceil(dt * 4));
    } else {
      trail.splice(0, Math.ceil(dt * 4));
    }

    ctx.clearRect(0, 0, w, h);
    blend();
    const n = trail.length;
    trail.forEach((pt, i) => {
      const k = (i + 1) / n;
      const s = 2 + 16 * k * k;
      ctx.globalAlpha = k * k * (dark ? .7 : .45);
      ctx.drawImage(dark ? gold : amber, pt.x - s, pt.y - s, s * 2, s * 2);
      if (k > .6) {
        const c = s * .45;
        ctx.globalAlpha = (k - .6) * 2;
        ctx.drawImage(hot, pt.x - c, pt.y - c, c * 2, c * 2);
      }
    });

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life -= dt;
      if (s.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      s.vx *= Math.pow(.93, dt);
      s.vy = s.vy * Math.pow(.93, dt) + .025 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      const k = s.life / s.max;
      const tw = .55 + .45 * Math.sin(now / 40 + s.ph);
      const r = s.size * (.5 + k);
      if (s.star) {
        streak(s.x, s.y, r * 2.6, r * .3, s.ph, k * tw);
        streak(s.x, s.y, r * 2.6, r * .3, s.ph + Math.PI / 2, k * tw);
      }
      ctx.globalAlpha = k * tw;
      ctx.drawImage(dark ? gold : amber, s.x - r * 1.6, s.y - r * 1.6, r * 3.2, r * 3.2);
      ctx.drawImage(hot, s.x - r * .6, s.y - r * .6, r * 1.2, r * 1.2);
    }
    ctx.globalAlpha = 1;

    if (flight) {
      const fade = flight.landed ? Math.max(0, 1 - (now - flight.landed) / 280) : 1;
      if (fade > 0) {
        const grow = flight.landed ? 1 + (1 - fade) * 1.2 : 1;
        sparkle(flight.x, flight.y, 11 * grow, now, fade);
      } else {
        window.removeEventListener('wheel', flight.hold);
        window.removeEventListener('touchstart', flight.hold);
        flight = null;
      }
    }
    ctx.globalCompositeOperation = 'source-over';

    if (!flight && !trail.length && !sparks.length) {
      stopAll();
      return;
    }
    raf = requestAnimationFrame(loop);
  };

  const run = () => {
    if (raf) return;
    dark = document.documentElement.dataset.theme === 'dark';
    size();
    cv.classList.add('is-on');
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };

  const fly = (id, sx, sy) => {
    if (flight) {
      window.removeEventListener('wheel', flight.hold);
      window.removeEventListener('touchstart', flight.hold);
    }
    trail.length = 0;
    const from = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    const to = id === '#top' ? 0 : Math.min(max, Math.max(0, pageTop($(id)) - 84));
    const f = {
      id,
      sx,
      sy,
      from,
      to,
      x: sx,
      y: sy,
      t0: performance.now(),
      dur: Math.min(1700, Math.max(1000, 900 + Math.abs(to - from) * .2)),
      amp: Math.min(140, Math.max(60, innerWidth * .2)),
      held: false,
      landed: 0,
      tick: 0
    };
    f.end = anchor(id, to, () => f.held);
    const e0 = f.end();
    const nx = -(e0.y - sy) / (Math.hypot(e0.x - sx, e0.y - sy) || 1);
    f.amp *= Math.sign((innerWidth / 2 - sx) * nx) || 1;
    f.hold = () => { f.held = true; };
    window.addEventListener('wheel', f.hold, { passive: true, once: true });
    window.addEventListener('touchstart', f.hold, { passive: true, once: true });
    flight = f;
    for (let i = 0; i < 10; i++) spark(sx, sy, 2.6, 26 + Math.random() * 16);
    run();
  };

  fx.burst = (x, y, count = 22) => {
    for (let i = 0; i < count; i++) spark(x, y, 4, 36 + Math.random() * 26, i < count / 4);
    run();
  };

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('skip') || e.defaultPrevented) return;
    const id = a.getAttribute('href');
    if (id.length < 2 || (id !== '#top' && !$(id))) return;
    e.preventDefault();
    const r = a.getBoundingClientRect();
    const x = e.clientX || r.left + 24;
    const y = e.clientY || r.top + r.height / 2;
    history.replaceState(null, '', id === '#top' ? location.pathname : id);
    requestAnimationFrame(() => fly(id, x, y));
  });
}

function init() {
  const saved = store('brand.lang');
  const nav = (navigator.language || 'pl').slice(0, 2);
  state.lang = I18N[saved] ? saved : I18N[nav] ? nav : 'pl';

  ['#heroBooksy', '#billBook', '#dockBook', '#reviewsLink', '#mmBook', '#mmBooksy'].forEach(sel => {
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
  bindFlight();
  splitName();
  setInterval(renderStatus, 60000);
  runIntro(() => requestAnimationFrame(() => document.body.classList.add('is-ready')));
}

init();
