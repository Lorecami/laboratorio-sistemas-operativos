'use strict';
/* Núcleo del dashboard: utilidades, navegación y componentes reutilizables */
const OS = {
  chapters: [], timers: [],
  base: 'https://ull-esit-sistemas-operativos.github.io/ssoo-apuntes/',
  sections: [
    { id: 'intro', name: 'Introducción', color: '#6d4bd8' },
    { id: 'org', name: 'Organización', color: '#0f8a7e' },
    { id: 'proc', name: 'Gestión de procesos', color: '#d9541a' },
    { id: 'mem', name: 'Gestión de la memoria', color: '#2b6fd6' },
    { id: 'alm', name: 'Gestión del almacenamiento', color: '#b0307a' }
  ],
  colors: ['#2b6fd6', '#d9541a', '#0f8a7e', '#b0307a', '#b08900', '#6d4bd8', '#3c8f2f', '#c0392b'],
  add(ch) { this.chapters.push(ch); },
  every(fn, ms) { const id = setInterval(fn, ms); this.timers.push(id); return id; },
  stop(id) { clearInterval(id); }
};

/* Crea un elemento: h('div', {class:'x', onclick:fn}, hijos...) */
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') { for (const p in v) p.startsWith('--') ? e.style.setProperty(p, v[p]) : (e.style[p] = v[p]); }
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    e.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return e;
}
const btn = (label, on, cls) => h('button', { class: 'btn ' + (cls || ''), type: 'button', onclick: on }, label);
const field = (label, control) => h('label', { class: 'field' }, h('span', null, label), control);
function sel(options, value, on) {
  const s = h('select', { onchange: () => on(s.value) },
    options.map(o => { const [v, t] = Array.isArray(o) ? o : [o, o]; return h('option', { value: v, selected: String(v) === String(value) }, t); }));
  return s;
}
function num(value, min, max, on) {
  const i = h('input', { type: 'number', value, min, max });
  i.addEventListener('input', () => { let v = parseInt(i.value, 10); if (isNaN(v)) return; v = Math.max(min, Math.min(max, v)); on(v); });
  return i;
}
function panel(title, sub, ...kids) {
  return h('section', { class: 'panel' }, h('h3', null, title), sub ? h('p', { class: 'sub' }, sub) : null, kids);
}
const stat = (label, value) => h('div', { class: 'stat' }, h('small', null, label), h('b', null, value));
function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* Componente: clasificar tarjetas arrastrando (o tocando la tarjeta y luego la casilla) */
function classify(host, cats, items) {
  let cur = null;
  const pool = h('div', { class: 'pool' });
  const fb = h('div', { class: 'note' }, 'Arrastra cada tarjeta a su casilla. En el celular: toca la tarjeta y luego la casilla.');
  const zones = h('div', { class: 'zones' });
  const pick = el => { pool.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); cur = el; if (el) el.classList.add('sel'); };
  const drop = (cat, zone) => {
    if (!cur) return;
    const it = cur._it;
    if (it.c === cat.id) {
      cur.classList.remove('sel'); cur.classList.add('done'); cur.draggable = false;
      if (it.why) cur.append(h('small', null, it.why));
      zone.querySelector('.zi').append(cur);
      const left = pool.children.length;
      fb.className = 'note ok';
      fb.textContent = left ? `Correcto. Faltan ${left}.` : '¡Completado! Todas las tarjetas están en su lugar.';
    } else {
      zone.classList.add('no'); setTimeout(() => zone.classList.remove('no'), 350);
      fb.className = 'note bad';
      fb.textContent = `"${it.t}" no va en "${cat.label}". Inténtalo en otra casilla.`;
    }
    pick(null);
  };
  const build = () => {
    pool.innerHTML = ''; zones.innerHTML = ''; cur = null;
    shuffle(items).forEach(it => {
      const el = h('div', { class: 'item', draggable: 'true', tabindex: '0' }, it.t);
      el._it = it;
      el.addEventListener('dragstart', e => { pick(el); e.dataTransfer.setData('text/plain', it.t); });
      el.addEventListener('click', () => { if (!el.classList.contains('done')) pick(cur === el ? null : el); });
      el.addEventListener('keydown', e => { if (e.key === 'Enter' && !el.classList.contains('done')) pick(el); });
      pool.append(el);
    });
    cats.forEach(c => {
      const z = h('div', { class: 'zone', tabindex: '0' }, h('h5', null, c.label), h('div', { class: 'zi' }));
      z.addEventListener('dragover', e => { e.preventDefault(); z.classList.add('over'); });
      z.addEventListener('dragleave', () => z.classList.remove('over'));
      z.addEventListener('drop', e => { e.preventDefault(); z.classList.remove('over'); drop(c, z); });
      z.addEventListener('click', () => drop(c, z));
      z.addEventListener('keydown', e => { if (e.key === 'Enter') drop(c, z); });
      zones.append(z);
    });
    fb.className = 'note'; fb.textContent = 'Arrastra cada tarjeta a su casilla. En el celular: toca la tarjeta y luego la casilla.';
  };
  build();
  host.append(pool, zones, fb, h('div', { class: 'gap' }), btn('Reiniciar juego', build));
}

/* Componente: explicación paso a paso con Anterior / Siguiente / Automático */
function stepper(host, getSteps, onStep) {
  let i = 0, auto = null;
  const txt = h('div', { class: 'step-text' }), cnt = h('span', { class: 'muted small' });
  const prev = btn('◀ Anterior', () => go(i - 1)), next = btn('Siguiente ▶', () => go(i + 1), 'pri');
  const play = btn('▶ Automático', () => { if (auto) halt(); else { if (i >= getSteps().length - 1) go(0); play.textContent = '⏸ Pausar'; auto = OS.every(() => { if (i >= getSteps().length - 1) halt(); else go(i + 1); }, 2200); } });
  const halt = () => { OS.stop(auto); auto = null; play.textContent = '▶ Automático'; };
  function go(n) {
    const steps = getSteps();
    i = Math.max(0, Math.min(steps.length - 1, n));
    txt.innerHTML = steps[i].t; cnt.textContent = `Paso ${i + 1} de ${steps.length}`;
    prev.disabled = i === 0; next.disabled = i === steps.length - 1;
    onStep(steps[i], i);
  }
  host.append(txt, h('div', { class: 'row center' }, prev, next, play, btn('Reiniciar', () => { halt(); go(0); }), cnt));
  go(0);
  return { go, reset: () => { halt(); go(0); } };
}

/* Navegación */
OS.secOf = id => OS.sections.find(s => s.id === id);
OS.buildNav = function () {
  const nav = document.getElementById('nav'); nav.innerHTML = '';
  nav.append(h('a', { href: '#inicio', 'data-k': 'inicio' }, h('b', null, '⌂'), 'Tablero general'));
  OS.sections.forEach(s => {
    nav.append(h('h4', null, h('i', { style: { background: s.color } }), s.name));
    OS.chapters.filter(c => c.sec === s.id).forEach(c =>
      nav.append(h('a', { href: '#c' + c.n, 'data-k': 'c' + c.n }, h('b', null, c.n), c.title)));
  });
};
OS.home = function (main) {
  main.style.removeProperty('--sec');
  main.append(h('div', { class: 'hero' },
    h('div', { class: 'eyebrow' }, 'Material didáctico interactivo'),
    h('h1', null, 'Laboratorio de Sistemas Operativos'),
    h('p', null, 'Veinte temas de la asignatura explicados con simuladores, animaciones y juegos. Elige un tema, prueba el simulador y usa la sección «Cómo explicarlo» como guion para exponer.'),
    h('p', { class: 'muted small' }, 'Basado en los ', h('a', { href: OS.base, target: '_blank', rel: 'noopener' }, 'Apuntes de Sistemas Operativos'), '. El cronómetro de arriba sirve para ensayar la presentación de 5 minutos.')));
  OS.sections.forEach(s => {
    main.append(h('h2', { style: { color: s.color, fontSize: '1.3rem' } }, s.name));
    main.append(h('div', { class: 'secgrid', style: { '--sec': s.color } },
      OS.chapters.filter(c => c.sec === s.id).map(c =>
        h('a', { class: 'tile', href: '#c' + c.n, style: { '--sec': s.color } }, h('b', null, 'Tema ' + c.n), h('strong', null, c.title), h('span', null, c.demo)))));
  });
};
OS.show = function () {
  OS.timers.forEach(clearInterval); OS.timers = [];
  const main = document.getElementById('main'); main.innerHTML = '';
  const key = (location.hash || '#inicio').slice(1);
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.k === key));
  document.getElementById('nav').classList.remove('open');
  const ch = OS.chapters.find(c => 'c' + c.n === key);
  window.scrollTo(0, 0);
  if (!ch) { document.title = 'Laboratorio de Sistemas Operativos'; return OS.home(main); }
  const s = OS.secOf(ch.sec), idx = OS.chapters.indexOf(ch);
  document.title = `${ch.n}. ${ch.title} · Laboratorio de SO`;
  main.style.setProperty('--sec', s.color);
  main.append(h('div', { class: 'eyebrow' }, `${s.name} · Tema ${ch.n}`), h('h1', null, ch.title), h('p', { class: 'idea' }, ch.idea));
  const body = h('div'); main.append(body); ch.render(body);
  main.append(panel('Cómo explicarlo en clase', null, h('ol', { class: 'tips' }, ch.tips.map(t => h('li', { html: t }))),
    h('p', { class: 'small muted' }, 'Fuente: ', h('a', { href: OS.base + ch.url, target: '_blank', rel: 'noopener' }, `Apuntes de Sistemas Operativos, tema ${ch.n}`))));
  const p = OS.chapters[idx - 1], n = OS.chapters[idx + 1];
  main.append(h('div', { class: 'pager' },
    p ? h('a', { class: 'btn', href: '#c' + p.n }, `◀ ${p.n}. ${p.title}`) : h('span'),
    n ? h('a', { class: 'btn', href: '#c' + n.n }, `${n.n}. ${n.title} ▶`) : h('span')));
};
OS.start = function () {
  OS.chapters.sort((a, b) => a.n - b.n);
  OS.buildNav();
  window.addEventListener('hashchange', OS.show);
  document.getElementById('menuBtn').onclick = () => document.getElementById('nav').classList.toggle('open');
  // tema claro / oscuro
  const root = document.documentElement;
  let theme = null; try { theme = localStorage.getItem('so-theme'); } catch (e) {}
  if (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches) theme = 'dark';
  if (theme) root.dataset.theme = theme;
  document.getElementById('themeBtn').onclick = () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('so-theme', root.dataset.theme); } catch (e) {}
  };
  // cronómetro de 5 minutos
  let left = 300, run = null;
  const box = document.getElementById('timer'), txt = document.getElementById('timerTxt'), go = document.getElementById('timerGo');
  const paint = () => { txt.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'); box.classList.toggle('warn', left <= 60 && left > 0); box.classList.toggle('end', left === 0); };
  go.onclick = () => {
    if (run) { clearInterval(run); run = null; go.textContent = 'Seguir'; return; }
    if (left === 0) left = 300;
    go.textContent = 'Pausar';
    run = setInterval(() => { left = Math.max(0, left - 1); paint(); if (left === 0) { clearInterval(run); run = null; go.textContent = 'Iniciar'; } }, 1000);
  };
  document.getElementById('timerReset').onclick = () => { clearInterval(run); run = null; left = 300; go.textContent = 'Iniciar'; paint(); };
  OS.show();
};
