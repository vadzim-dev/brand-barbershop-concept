const BOOKSY = 'https://booksy.com/pl-pl/67599_brand-barbershop_barber-shop_3_warszawa';
const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const TIERS = [
  { id: 'barber', people: ['Roman', 'Andrzej'] },
  { id: 'top', people: ['Darina', 'Karim'] },
  { id: 'master', people: ['Zahar'] }
];

const SERVICES = [
  { id: 'cut', group: 'cut', price: { barber: 120, top: 140, master: 140 }, time: { barber: 45, top: 60, master: 60 } },
  { id: 'combo', group: 'cut', price: { barber: 180, top: 200, master: 245 }, time: { barber: 75, top: 75, master: 60 } },
  { id: 'beard', group: 'cut', price: { barber: 80, top: 100, master: 125 }, time: { barber: 30, top: 30, master: 30 } },
  { id: 'clipper', group: 'cut', price: 100, time: 45 },
  { id: 'clipperBeard', group: 'cut', price: 150, time: 60 },
  { id: 'kid', group: 'cut', price: 100, time: 45 },
  { id: 'fatherSon', group: 'cut', price: 190, time: 75 },
  { id: 'greyHair', group: 'grey', price: 80, time: 30 },
  { id: 'greyBeard', group: 'grey', price: 80, time: 30 },
  { id: 'greyCombo', group: 'grey', price: 150, time: 45 },
  { id: 'wash', group: 'extra', price: 50, time: 15 },
  { id: 'wax', group: 'extra', price: 40, time: 15 }
];

const GROUPS = ['cut', 'grey', 'extra'];

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

const RATINGS = [
  [5, 1065],
  [4, 7],
  [3, 6],
  [2, 4],
  [1, 4]
];

const state = {
  lang: 'pl',
  tier: 'barber',
  person: null,
  picked: new Set(),
  shown: 0
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

function priceOf(svc, tier = state.tier) {
  return typeof svc.price === 'object' ? svc.price[tier] : svc.price;
}

function timeOf(svc, tier = state.tier) {
  return typeof svc.time === 'object' ? svc.time[tier] : svc.time;
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

function tween(el, to, dur = 520) {
  const from = state.shown;
  state.shown = to;
  if (REDUCE || from === to) {
    el.textContent = to;
    $('#dockTotal').textContent = to;
    return;
  }
  const start = performance.now();
  el.classList.remove('is-bump');
  void el.offsetWidth;
  el.classList.add('is-bump');
  const step = now => {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    const v = Math.round(from + (to - from) * e);
    el.textContent = v;
    $('#dockTotal').textContent = v;
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

function renderTicker() {
  const items = t('ticker');
  const row = items.map(w => `<span>${w}</span><i aria-hidden="true"></i>`).join('');
  $('#ticker').innerHTML = row + row;
}

function renderTiers() {
  $('#tiers').innerHTML = TIERS.map(tier => `
    <button class="tier${tier.id === state.tier ? ' is-active' : ''}" type="button" role="radio" aria-checked="${tier.id === state.tier}" data-tier="${tier.id}">
      <b>${t('tier.' + tier.id)}</b>
      <span>${tier.people.join(', ')}</span>
    </button>`).join('');
  const active = $('.tier.is-active');
  $('#tiers').style.setProperty('--x', active ? active.offsetLeft + 'px' : 0);
  $('#tiers').style.setProperty('--w', active ? active.offsetWidth + 'px' : 0);
}

function renderServices() {
  $('#services').innerHTML = GROUPS.map(group => {
    const list = SERVICES.filter(s => s.group === group);
    return `
      <fieldset class="group">
        <legend>${t('group.' + group)}${group === 'cut' ? `<small>${t('group.tierNote')}</small>` : ''}</legend>
        ${list.map(svc => {
          const tiered = typeof svc.price === 'object';
          const on = state.picked.has(svc.id);
          return `
          <label class="svc${on ? ' is-on' : ''}${tiered ? ' svc--tiered' : ''}">
            <input type="checkbox" value="${svc.id}"${on ? ' checked' : ''}>
            <span class="svc__box" aria-hidden="true"></span>
            <span class="svc__text">
              <b>${t('svc.' + svc.id)}</b>
              <small>${t('svc.' + svc.id + '.d')}</small>
            </span>
            <span class="svc__meta">
              <b class="svc__price" data-svc="${svc.id}">${priceOf(svc)} zł</b>
              <small>${fmtTime(timeOf(svc))}</small>
            </span>
          </label>`;
        }).join('')}
      </fieldset>`;
  }).join('');
}

function refreshPrices() {
  $$('.svc__price').forEach(el => {
    const svc = byId(el.dataset.svc);
    const next = `${priceOf(svc)} zł`;
    if (el.textContent === next) return;
    el.classList.remove('is-flip');
    void el.offsetWidth;
    el.textContent = next;
    el.classList.add('is-flip');
    const time = el.nextElementSibling;
    time.textContent = fmtTime(timeOf(svc));
  });
}

function findMerge() {
  return MERGES.find(m => m.parts.every(p => state.picked.has(p)) && !state.picked.has(m.into));
}

function renderBill() {
  const items = SERVICES.filter(s => state.picked.has(s.id));
  const total = items.reduce((sum, s) => sum + priceOf(s), 0);
  const time = items.reduce((sum, s) => sum + timeOf(s), 0);

  $('#billList').innerHTML = items.map(s => `
    <li>
      <span>${t('svc.' + s.id)}</span>
      <b>${priceOf(s)} zł</b>
      <button type="button" class="bill__x" data-remove="${s.id}" aria-label="${t('sum.clear')}: ${t('svc.' + s.id)}">×</button>
    </li>`).join('');

  $('#billEmpty').hidden = items.length > 0;
  $('#billClear').hidden = items.length === 0;

  const tier = TIERS.find(x => x.id === state.tier);
  $('#billBarber').textContent = state.person
    ? `${state.person}, ${t('tier.' + tier.id)}`
    : `${t('tier.' + tier.id)}: ${tier.people.join(' / ')}`;
  $('#billTime').textContent = fmtTime(time);

  tween($('#billTotal'), total);
  $('#dock').classList.toggle('is-shown', items.length > 0);
  $('#dock').setAttribute('aria-hidden', items.length ? 'false' : 'true');
  $('#dockBook').tabIndex = items.length ? 0 : -1;

  const merge = findMerge();
  const hint = $('#hint');
  if (merge) {
    const parts = merge.parts.reduce((sum, id) => sum + priceOf(byId(id)), 0);
    const save = parts - priceOf(byId(merge.into));
    if (save > 0) {
      $('#hintText').textContent = t(merge.key, { x: save });
      hint.hidden = false;
      hint.dataset.merge = merge.into;
      return;
    }
  }
  hint.hidden = true;
}

function renderTeam() {
  const people = TIERS.flatMap(tier => tier.people.map(name => ({ name, tier: tier.id })));
  $('#team').innerHTML = people.map(p => {
    const on = state.person === p.name;
    const from = priceOf(byId('cut'), p.tier);
    return `
      <li class="member member--${p.tier}${on ? ' is-on' : ''}">
        <span class="member__letter" aria-hidden="true">${p.name[0]}</span>
        <div class="member__body">
          <b class="member__name">${p.name}</b>
          <span class="member__tier">${t('tier.' + p.tier)}</span>
          <span class="member__from">${t('team.from', { p: from })}</span>
        </div>
        <button class="btn btn--sm ${on ? 'btn--dark' : 'btn--ghost'}" type="button" data-person="${p.name}" data-tier="${p.tier}" aria-pressed="${on}">
          ${on ? t('team.picked') : t('team.pick')}
        </button>
      </li>`;
  }).join('');
}

function renderBars() {
  const max = Math.max(...RATINGS.map(r => r[1]));
  $('#bars').innerHTML = RATINGS.map(([n, count]) => `
    <li>
      <span class="bars__label">${n === 1 ? t('reviews.star') : t('reviews.stars', { n })}</span>
      <span class="bars__track"><i style="--v:${Math.max(count / max, 0.006)}"></i></span>
      <b>${count}</b>
    </li>`).join('');
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
  $$('.langs button').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.lang === state.lang);
  });
}

function renderAll() {
  applyStatic();
  renderStatus();
  renderTicker();
  renderTiers();
  renderServices();
  renderBill();
  renderTeam();
  renderBars();
  renderHours();
}

function setTier(tier, person = null) {
  const changed = tier !== state.tier;
  state.tier = tier;
  state.person = person;
  renderTiers();
  if (changed) refreshPrices();
  renderBill();
  renderTeam();
}

function toggleService(id, on) {
  if (on) state.picked.add(id);
  else state.picked.delete(id);
  const label = $(`.svc input[value="${id}"]`)?.closest('.svc');
  if (label) {
    label.classList.toggle('is-on', on);
    label.querySelector('input').checked = on;
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

  $('#tiers').addEventListener('click', e => {
    const btn = e.target.closest('.tier');
    if (btn) setTier(btn.dataset.tier);
  });

  $('#tiers').addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const i = TIERS.findIndex(x => x.id === state.tier);
    const next = TIERS[(i + (e.key === 'ArrowRight' ? 1 : TIERS.length - 1)) % TIERS.length];
    setTier(next.id);
    $(`.tier[data-tier="${next.id}"]`).focus();
  });

  $('#services').addEventListener('change', e => {
    if (e.target.matches('input[type="checkbox"]')) toggleService(e.target.value, e.target.checked);
  });

  $('#billList').addEventListener('click', e => {
    const btn = e.target.closest('[data-remove]');
    if (btn) toggleService(btn.dataset.remove, false);
  });

  $('#billClear').addEventListener('click', () => {
    [...state.picked].forEach(id => toggleService(id, false));
  });

  $('#hintBtn').addEventListener('click', () => {
    const into = $('#hint').dataset.merge;
    const merge = MERGES.find(m => m.into === into);
    if (!merge) return;
    merge.parts.forEach(id => toggleService(id, false));
    toggleService(into, true);
  });

  $('#team').addEventListener('click', e => {
    const btn = e.target.closest('[data-person]');
    if (!btn) return;
    const same = state.person === btn.dataset.person;
    setTier(btn.dataset.tier, same ? null : btn.dataset.person);
    if (!same && !state.picked.size) toggleService('cut', true);
    if (!same) {
      $('#cennik').scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
    }
  });

  const burger = $('#burger');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open);
    document.body.classList.toggle('menu-open', open);
  });

  $('#nav').addEventListener('click', e => {
    if (e.target.closest('a')) {
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
  });

  window.addEventListener('resize', () => {
    const active = $('.tier.is-active');
    if (!active) return;
    $('#tiers').style.setProperty('--x', active.offsetLeft + 'px');
    $('#tiers').style.setProperty('--w', active.offsetWidth + 'px');
  });

  window.addEventListener('scroll', () => {
    $('#topbar').classList.toggle('is-scrolled', window.scrollY > 8);
  }, { passive: true });
}

function bindReveal() {
  const targets = $$('.section__head, .group, .bill, .member, .about__media, .about__text, .reviews__score, .reviews__bars, .visit__info, .visit__map');
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

function init() {
  const saved = store('brand.lang');
  const nav = (navigator.language || 'pl').slice(0, 2);
  state.lang = I18N[saved] ? saved : I18N[nav] ? nav : 'pl';

  ['#heroBooksy', '#billBook', '#dockBook', '#reviewsLink'].forEach(sel => {
    $(sel).href = BOOKSY;
  });

  renderAll();
  bindEvents();
  bindReveal();
  setInterval(renderStatus, 60000);
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
}

init();
