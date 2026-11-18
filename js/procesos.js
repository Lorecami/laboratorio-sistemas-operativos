'use strict';
/* ===== Gestión de procesos: temas 9 a 14 ===== */

OS.add({
  n: 9, sec: 'proc', title: 'Procesos', url: 'procesos/procesos/',
  demo: 'Estados de un proceso y su PCB',
  idea: 'Un proceso es un programa en ejecución. A lo largo de su vida va cambiando de estado, y el sistema operativo guarda todo lo que sabe de él en una ficha llamada bloque de control de proceso (PCB).',
  tips: [
    'Recorre el camino completo: Nuevo → Preparado → En ejecución → Esperando → Preparado → En ejecución → Terminado.',
    'Señala que de <b>Esperando</b> nunca se pasa directo a En ejecución: primero hay que volver a la cola de preparados.',
    'Mira el PCB: al salir de la CPU se guarda el contador de programa; al volver, el proceso sigue justo donde se quedó. Eso es el <b>cambio de contexto</b>.'
  ],
  render(el) {
    const S = { nuevo: [80, 60, 'Nuevo'], prep: [240, 170, 'Preparado'], ejec: [480, 170, 'En ejecución'], esp: [360, 280, 'Esperando'], fin: [640, 60, 'Terminado'] };
    const T = [
      ['nuevo', 'prep', 'Admitir', 'El sistema operativo admite el proceso: crea su PCB y lo pone en la cola de preparados.'],
      ['prep', 'ejec', 'Asignar CPU', 'El planificador lo elige y le entrega la CPU. Se carga su contexto desde el PCB.'],
      ['ejec', 'prep', 'Interrupción (fin del cuanto)', 'Se acabó su tiempo. Se guarda su contexto en el PCB y vuelve a la cola de preparados.'],
      ['ejec', 'esp', 'Pedir E/S', 'Pide una operación de E/S. Como tardará, deja la CPU libre y pasa a esperar.'],
      ['esp', 'prep', 'Fin de la E/S', 'La E/S terminó. El proceso NO pasa a ejecutarse: vuelve a la cola de preparados.'],
      ['ejec', 'fin', 'Terminar', 'El proceso acaba. El sistema operativo libera su memoria y sus recursos.']
    ];
    let st = 'nuevo', pc = 0;
    const svg = `<svg viewBox="0 0 720 330" style="width:100%;min-width:560px" role="img" aria-label="Diagrama de estados de un proceso">
      <defs><marker id="ah" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="currentColor" style="color:var(--muted)"/></marker></defs>
      <path class="ar" marker-end="url(#ah)" d="M120,78 L196,145"/><text class="lbl" x="165" y="100">admitido</text>
      <path class="ar" marker-end="url(#ah)" d="M300,158 L418,158"/><text class="lbl" x="318" y="150">asignación de CPU</text>
      <path class="ar" marker-end="url(#ah)" d="M418,184 L300,184"/><text class="lbl" x="328" y="200">interrupción</text>
      <path class="ar" marker-end="url(#ah)" d="M470,196 L410,260"/><text class="lbl" x="450" y="240">espera de E/S</text>
      <path class="ar" marker-end="url(#ah)" d="M310,260 L252,196"/><text class="lbl" x="205" y="240">fin de E/S</text>
      <path class="ar" marker-end="url(#ah)" d="M520,145 L600,78"/><text class="lbl" x="575" y="118">salida</text>
      ${Object.keys(S).map(k => `<g data-s="${k}"><rect class="st" x="${S[k][0] - 60}" y="${S[k][1] - 24}" width="120" height="48" rx="24"/><text x="${S[k][0]}" y="${S[k][1] + 5}" text-anchor="middle" font-size="14">${S[k][2]}</text></g>`).join('')}
    </svg>`;
    const dia = h('div', { class: 'scroll', html: svg }), bar = h('div', { class: 'row' }), log = h('div', { class: 'log' }), pcb = h('table');
    const paint = () => {
      dia.querySelectorAll('g[data-s] rect').forEach(r => r.classList.toggle('on', r.parentNode.dataset.s === st));
      [...bar.children].forEach((b, i) => { if (T[i]) b.disabled = T[i][0] !== st; });
      pcb.innerHTML = '';
      [['Identificador (PID)', '1042'], ['Estado', S[st][2]], ['Contador de programa', '0x' + (0x4000 + pc * 4).toString(16)], ['Registros de la CPU', st === 'ejec' ? 'en uso por la CPU' : (st === 'fin' ? '—' : 'guardados en el PCB')], ['Prioridad', '5'], ['Memoria asignada', st === 'fin' ? 'liberada' : '12 MB'], ['Archivos abiertos', st === 'fin' ? 'cerrados' : 'datos.txt']]
        .forEach(r => pcb.append(h('tr', { class: r[0] === 'Estado' ? 'hl' : '' }, h('td', null, r[0]), h('td', { class: 'mono' }, r[1]))));
    };
    T.forEach(t => bar.append(btn(t[2], () => { st = t[1]; log.prepend(h('div', null, `${S[t[0]][2]} → ${S[t[1]][2]}: ${t[3]}`)); paint(); })));
    bar.append(btn('Reiniciar', () => { st = 'nuevo'; pc = 0; log.innerHTML = ''; paint(); }));
    OS.every(() => { if (st === 'ejec') { pc++; paint(); } }, 500);
    el.append(panel('La vida de un proceso', 'Solo se activan los botones de las transiciones posibles desde el estado actual.', dia, bar, log),
      panel('Bloque de control de proceso (PCB)', 'Es la ficha que el sistema operativo guarda de cada proceso. Mira cómo avanza el contador de programa solo mientras está en ejecución.', pcb));
    paint();
  }
});

/* Simulador de planificación (se usa también en las pruebas) */
OS.schedule = function (procs, alg, q, cores) {
  const P = procs.map((p, i) => ({ ...p, i, rem: p.burst, start: null, end: null }));
  const ready = [], run = Array(cores).fill(null), used = Array(cores).fill(0), tl = Array.from({ length: cores }, () => []);
  const pre = alg === 'SRTF' || alg === 'PRIOX';
  const key = p => alg === 'SJF' || alg === 'SRTF' ? p.rem : (alg === 'PRIO' || alg === 'PRIOX' ? p.prio : 0);
  let t = 0, done = 0;
  while (done < P.length && t < 2000) {
    P.filter(p => p.arr === t).forEach(p => ready.push(p));
    if (alg === 'RR') run.forEach((p, c) => { if (p && used[c] >= q) { ready.push(p); run[c] = null; } });
    if (pre) {
      const cand = [...run.filter(Boolean), ...ready];
      cand.sort((a, b) => key(a) - key(b) || (run.includes(b) - run.includes(a)) || a.arr - b.arr || a.i - b.i);
      const chosen = cand.slice(0, cores);
      run.forEach((p, c) => { if (p && !chosen.includes(p)) { ready.push(p); run[c] = null; } });
      chosen.filter(p => !run.includes(p)).forEach(p => { const c = run.indexOf(null); run[c] = p; used[c] = 0; ready.splice(ready.indexOf(p), 1); });
    } else {
      run.forEach((p, c) => {
        if (p || !ready.length) return;
        let k = 0;
        if (alg !== 'FCFS' && alg !== 'RR') ready.forEach((r, j) => { if (key(r) < key(ready[k])) k = j; });
        run[c] = ready.splice(k, 1)[0]; used[c] = 0;
      });
    }
    run.forEach((p, c) => {
      tl[c].push(p ? p.i : null);
      if (!p) return;
      if (p.start === null) p.start = t;
      p.rem--; used[c]++;
      if (p.rem === 0) { p.end = t + 1; run[c] = null; done++; }
    });
    t++;
  }
  return { tl, P, T: t };
};

OS.add({
  n: 10, sec: 'proc', title: 'Planificación de la CPU', url: 'procesos/planificacion-de-la-cpu/',
  demo: 'Simulador con 1 a 4 núcleos y diagrama de Gantt',
  idea: 'Cuando hay más procesos preparados que núcleos libres, el planificador decide quién usa la CPU. Cada algoritmo reparte el tiempo de forma distinta, y eso cambia cuánto espera cada proceso.',
  tips: [
    'Con 1 núcleo, compara <b>FCFS</b> con <b>SJF</b> usando los mismos procesos: la espera media baja al atender primero a los cortos.',
    'Pasa a <b>Round Robin</b> y cambia el cuanto: si es pequeño, todos responden rápido pero hay más cambios de proceso; si es enorme, se comporta como FCFS.',
    'Sube a <b>4 núcleos</b> y pulsa «Reproducir»: se ve cómo varios procesos se ejecutan de verdad al mismo tiempo.'
  ],
  render(el) {
    let procs = [{ name: 'P1', arr: 0, burst: 8, prio: 3 }, { name: 'P2', arr: 1, burst: 4, prio: 1 }, { name: 'P3', arr: 2, burst: 9, prio: 4 }, { name: 'P4', arr: 3, burst: 5, prio: 2 }, { name: 'P5', arr: 6, burst: 2, prio: 2 }];
    let alg = 'FCFS', q = 2, cores = 1, shown = Infinity, play = null;
    const A = { FCFS: ['FCFS (por orden de llegada)', 'Se atiende en orden de llegada y nadie es interrumpido. Simple, pero un proceso largo hace esperar a todos los que llegan detrás.'],
      SJF: ['SJF (primero el más corto)', 'Cuando un núcleo queda libre, entra el proceso con la ráfaga más corta. Da la menor espera media sin expulsar a nadie, pero los largos pueden esperar mucho.'],
      SRTF: ['SRTF (menor tiempo restante)', 'Versión expulsiva de SJF: si llega un proceso al que le queda menos tiempo que al que se está ejecutando, le quita la CPU.'],
      RR: ['Round Robin (turno rotatorio)', 'Cada proceso recibe un cuanto de tiempo. Si no termina, vuelve al final de la cola. Reparte la CPU de forma equitativa.'],
      PRIO: ['Prioridades (no expulsivo)', 'Entra el proceso con mayor prioridad (número más bajo). Riesgo: los de baja prioridad pueden sufrir inanición.'],
      PRIOX: ['Prioridades (expulsivo)', 'Igual que el anterior, pero si llega un proceso más prioritario le quita la CPU al que la tiene.'] };
    const tb = h('tbody'), gantt = h('div', { class: 'gantt' }), res = h('table'), stats = h('div', { class: 'stats' }), desc = h('div', { class: 'note' });
    const qf = field('Cuanto (quantum)', num(q, 1, 20, v => { q = v; draw(); }));
    const playBtn = btn('▶ Reproducir', () => {
      if (play) { OS.stop(play); play = null; shown = Infinity; playBtn.textContent = '▶ Reproducir'; return draw(); }
      shown = 0; playBtn.textContent = '⏹ Mostrar todo'; draw();
      play = OS.every(() => { shown++; draw(); }, 350);
    });
    function table() {
      tb.innerHTML = '';
      procs.forEach((p, i) => tb.append(h('tr', null,
        h('td', null, h('span', { class: 'badge', style: { background: OS.colors[i % 8] } }, p.name)),
        h('td', null, num(p.arr, 0, 50, v => { p.arr = v; draw(); })), h('td', null, num(p.burst, 1, 30, v => { p.burst = v; draw(); })), h('td', null, num(p.prio, 1, 9, v => { p.prio = v; draw(); })),
        h('td', null, procs.length > 1 ? h('button', { class: 'btn', type: 'button', 'aria-label': 'Quitar ' + p.name, title: 'Quitar', onclick: () => { procs.splice(i, 1); table(); draw(); } }, '✕') : null))));
    }
    function draw() {
      qf.style.display = alg === 'RR' ? '' : 'none'; desc.innerHTML = `<b>${A[alg][0]}.</b> ${A[alg][1]}`;
      const r = OS.schedule(procs, alg, q, cores), T = r.T;
      if (shown >= T && play) { OS.stop(play); play = null; shown = Infinity; playBtn.textContent = '▶ Reproducir'; }
      gantt.innerHTML = ''; gantt.style.gridTemplateColumns = `auto repeat(${T}, minmax(24px, 1fr))`;
      r.tl.forEach((row, c) => {
        gantt.append(h('div', { class: 'lab' }, cores > 1 ? `Núcleo ${c + 1}` : 'CPU'));
        row.forEach((v, t) => gantt.append(h('div', { class: 'cell' + (v === null ? ' idle' : '') + (t >= shown ? ' hide' : ''), style: { background: v === null ? '' : OS.colors[v % 8] } }, v === null ? '' : procs[v].name)));
      });
      gantt.append(h('div'));
      for (let t = 0; t < T; t++) gantt.append(h('div', { class: 't' }, t));
      res.innerHTML = ''; res.append(h('tr', null, ['Proceso', 'Termina en', 'Retorno', 'Espera', 'Respuesta'].map(x => h('th', null, x))));
      let w = 0, ta = 0, rs = 0, busy = 0;
      r.P.forEach(p => { const tt = p.end - p.arr, ww = tt - p.burst, rr = p.start - p.arr; w += ww; ta += tt; rs += rr; busy += p.burst;
        res.append(h('tr', null, h('td', null, p.name), h('td', null, p.end), h('td', null, tt), h('td', null, ww), h('td', null, rr))); });
      const n = r.P.length;
      stats.innerHTML = ''; stats.append(stat('Espera media', (w / n).toFixed(2)), stat('Retorno medio', (ta / n).toFixed(2)), stat('Respuesta media', (rs / n).toFixed(2)), stat('Uso de CPU', Math.round(busy / (T * cores) * 100) + '%'));
    }
    el.append(panel('Simulador de planificación', 'Cambia el algoritmo, el número de núcleos o los datos de los procesos: el diagrama se recalcula al instante.',
      h('div', { class: 'row' }, field('Algoritmo', sel(Object.keys(A).map(k => [k, A[k][0]]), alg, v => { alg = v; draw(); })), qf,
        field('Núcleos de CPU', sel([1, 2, 3, 4], cores, v => { cores = +v; draw(); })), playBtn), desc,
      h('h3', { style: { fontSize: '1rem', margin: '16px 0 6px' } }, 'Diagrama de Gantt'), h('div', { class: 'scroll' }, gantt), stats));
    el.append(h('div', { class: 'grid2' },
      panel('Procesos', 'Prioridad: el número más bajo es el más prioritario.', h('div', { class: 'scroll' }, h('table', null, h('thead', null, h('tr', null, ['Proceso', 'Llegada', 'Ráfaga', 'Prioridad', ''].map(x => h('th', null, x)))), tb)), h('div', { class: 'gap' }),
        btn('+ Añadir proceso', () => { if (procs.length >= 8) return; const k = Math.max(...procs.map(p => +p.name.slice(1))) + 1; procs.push({ name: 'P' + k, arr: 0, burst: 4, prio: 3 }); table(); draw(); })),
      panel('Resultados por proceso', 'Retorno = fin − llegada. Espera = retorno − ráfaga. Respuesta = primera vez en CPU − llegada.', h('div', { class: 'scroll' }, res))));
    table(); draw();
  }
});

OS.add({
  n: 11, sec: 'proc', title: 'Paso de mensajes', url: 'procesos/comunicacion-mediante-paso-de-mensajes/',
  demo: 'Enviar y recibir con buzón',
  idea: 'Dos procesos pueden comunicarse sin compartir memoria: uno envía un mensaje (send) y el otro lo recibe (receive). El sistema operativo hace de cartero y guarda los mensajes en una cola.',
  tips: [
    'Con capacidad 2: envía tres mensajes seguidos. El tercero <b>bloquea al emisor</b> porque el buzón está lleno.',
    'Vacía el buzón y pulsa «Recibir» otra vez: ahora es el <b>receptor el que se bloquea</b>, esperando un mensaje.',
    'Pon capacidad 0 (cita o <i>rendezvous</i>): el emisor queda bloqueado hasta que el receptor recoge el mensaje en mano.'
  ],
  render(el) {
    let cap = 2, queue = [], n = 0, pend = null, bWait = false, got = [];
    const box = h('div'), log = h('div', { class: 'log' });
    const say = t => log.prepend(h('div', null, t));
    const sendB = btn('A: send(mensaje)', () => {
      const m = 'm' + (++n);
      if (bWait) { bWait = false; got.push(m); say(`A envía ${m}. B estaba esperando: lo recibe al instante y se desbloquea.`); }
      else if (queue.length < cap) { queue.push(m); say(`A envía ${m}. Queda guardado en el buzón y A sigue trabajando.`); }
      else { pend = m; say(cap ? `A envía ${m}, pero el buzón está lleno: A se BLOQUEA.` : `A envía ${m}. Sin búfer, A se BLOQUEA hasta que B lo reciba.`); }
      draw();
    }, 'pri');
    const recvB = btn('B: receive()', () => {
      if (queue.length) { const m = queue.shift(); got.push(m); say(`B recibe ${m} del buzón.`); if (pend) { queue.push(pend); say(`Hay hueco: ${pend} entra en el buzón y A se desbloquea.`); pend = null; } }
      else if (pend) { got.push(pend); say(`B recibe ${pend} directamente de A. A se desbloquea.`); pend = null; }
      else { bWait = true; say('B quiere recibir, pero no hay mensajes: B se BLOQUEA.'); }
      draw();
    }, 'pri');
    function draw() {
      sendB.disabled = !!pend; recvB.disabled = bWait;
      const slots = []; for (let i = 0; i < cap; i++) slots.push(h('div', { class: 'cell', style: { background: queue[i] ? OS.colors[1] : 'var(--idle)', minWidth: '46px', height: '40px', display: 'grid', placeItems: 'center', color: '#fff', borderRadius: '6px', fontFamily: 'var(--mono)' } }, queue[i] || ''));
      box.innerHTML = '';
      box.append(h('div', { class: 'grid2', style: { gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', alignItems: 'stretch' } },
        h('div', { class: 'node' + (pend ? ' crash' : ' on') }, h('b', null, 'Proceso A (emisor)'), h('br'), h('span', { class: 'badge ' + (pend ? 'b' : 'u') }, pend ? 'bloqueado' : 'activo'), pend ? h('div', { class: 'mono small' }, `en la mano: ${pend}`) : null),
        h('div', { class: 'zoneK' }, h('small', null, `Buzón en el núcleo · capacidad ${cap}`), cap ? h('div', { style: { display: 'flex', gap: '5px', flexWrap: 'wrap' } }, slots) : h('div', { class: 'small muted' }, 'Sin búfer: el mensaje pasa de mano en mano.')),
        h('div', { class: 'node' + (bWait ? ' crash' : ' on') }, h('b', null, 'Proceso B (receptor)'), h('br'), h('span', { class: 'badge ' + (bWait ? 'b' : 'u') }, bWait ? 'bloqueado' : 'activo'), h('div', { class: 'mono small' }, 'recibidos: ' + (got.join(', ') || '—')))));
    }
    const reset = () => { queue = []; n = 0; pend = null; bWait = false; got = []; log.innerHTML = ''; draw(); };
    el.append(panel('Emisor, buzón y receptor', 'Pulsa los botones en el orden que quieras y observa cuándo se bloquea cada proceso.',
      h('div', { class: 'row' }, field('Capacidad del buzón', sel([[0, '0 · sin búfer (cita)'], [1, '1 mensaje'], [2, '2 mensajes'], [4, '4 mensajes']], cap, v => { cap = +v; reset(); })), sendB, recvB, btn('Reiniciar', reset)),
      h('div', { class: 'gap' }), box, log));
    draw();
  }
});

OS.add({
  n: 12, sec: 'proc', title: 'Memoria compartida', url: 'procesos/memoria-compartida/',
  demo: 'Productor y consumidor sobre un búfer común',
  idea: 'Dos procesos pueden acordar compartir una misma zona de memoria. Una vez creada, se comunican leyendo y escribiendo en ella directamente, sin pasar por el sistema operativo: es la forma más rápida de comunicarse.',
  tips: [
    'Señala que la región es <b>la misma memoria física</b>, aunque cada proceso la ve en una dirección virtual distinta.',
    'Produce y consume varias veces: los índices <code>entra</code> y <code>sale</code> dan la vuelta al búfer (por eso se llama circular).',
    'Llena el búfer y vacíalo: el productor debe esperar si está lleno y el consumidor si está vacío. Esa coordinación ya es tarea de los procesos (enlaza con Sincronización).'
  ],
  render(el) {
    const N = 6; let buf = Array(N).fill(null), inn = 0, out = 0, count = 0, k = 0, got = [];
    const box = h('div'), msg = h('div', { class: 'note' }, 'Pulsa «Producir» para que el proceso A escriba un dato en la memoria compartida.');
    const pB = btn('A: producir', () => {
      if (count === N) { msg.className = 'note bad'; msg.innerHTML = '<b>Búfer lleno.</b> El productor debe esperar a que el consumidor retire algún dato.'; return; }
      const d = 'D' + (++k); buf[inn] = d; msg.className = 'note'; msg.innerHTML = `A escribe <b>${d}</b> en la posición ${inn} y avanza <code>entra</code> a ${(inn + 1) % N}. No ha hecho falta ninguna llamada al sistema.`;
      inn = (inn + 1) % N; count++; draw();
    }, 'pri');
    const cB = btn('B: consumir', () => {
      if (count === 0) { msg.className = 'note bad'; msg.innerHTML = '<b>Búfer vacío.</b> El consumidor debe esperar a que el productor escriba algo.'; return; }
      const d = buf[out]; buf[out] = null; got.push(d); msg.className = 'note'; msg.innerHTML = `B lee <b>${d}</b> de la posición ${out} y avanza <code>sale</code> a ${(out + 1) % N}.`;
      out = (out + 1) % N; count--; draw();
    }, 'pri');
    function draw() {
      box.innerHTML = '';
      const cells = h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${N},1fr)`, gap: '5px' } }, buf.map((d, i) =>
        h('div', { style: { textAlign: 'center' } },
          h('div', { style: { height: '46px', borderRadius: '6px', display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)', color: '#fff', background: d ? OS.colors[1] : 'var(--idle)' } }, d || ''),
          h('div', { class: 'mono small muted' }, i),
          h('div', { class: 'mono small', style: { minHeight: '2.6em', lineHeight: '1.3' } }, i === inn ? h('div', { style: { color: OS.colors[0] } }, '▲ entra') : null, i === out ? h('div', { style: { color: OS.colors[2] } }, '▲ sale') : null))));
      box.append(h('div', { class: 'grid2', style: { gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' } },
        h('div', { class: 'node' }, h('b', null, 'Proceso A (productor)'), h('div', { class: 'mono small muted' }, 've la región en 0x7f10a000'), h('div', { class: 'small' }, `ha producido ${k} datos`)),
        h('div', { class: 'node' }, h('b', null, 'Proceso B (consumidor)'), h('div', { class: 'mono small muted' }, 've la región en 0x7fa2c000'), h('div', { class: 'small' }, 'ha leído: ' + (got.slice(-6).join(', ') || '—')))),
        h('div', { class: 'zoneK', style: { marginTop: '10px' } }, h('small', null, `Región de memoria compartida · búfer circular de ${N} posiciones · ocupadas: ${count}`), cells));
    }
    el.append(panel('Un búfer circular compartido por dos procesos', 'El productor escribe donde apunta «entra»; el consumidor lee donde apunta «sale».',
      h('div', { class: 'row' }, pB, cB, btn('Reiniciar', () => { buf = Array(N).fill(null); inn = out = count = k = 0; got = []; msg.className = 'note'; msg.textContent = 'Reiniciado.'; draw(); })), h('div', { class: 'gap' }), box, msg));
    draw();
    el.append(panel('Paso de mensajes frente a memoria compartida', null, h('div', { class: 'scroll' }, h('table', null,
      h('tr', null, h('th'), h('th', null, 'Paso de mensajes'), h('th', null, 'Memoria compartida')),
      h('tr', null, h('td', null, 'Velocidad'), h('td', null, 'Más lento: cada mensaje es una llamada al sistema'), h('td', null, 'Muy rápido: es acceder a memoria')),
      h('tr', null, h('td', null, 'Papel del sistema operativo'), h('td', null, 'Interviene en cada envío y recepción'), h('td', null, 'Solo al crear la región')),
      h('tr', null, h('td', null, 'Sincronización'), h('td', null, 'La resuelve el sistema'), h('td', null, 'Es responsabilidad de los procesos')),
      h('tr', null, h('td', null, 'Uso típico'), h('td', null, 'Pocos datos, o equipos distintos conectados por red'), h('td', null, 'Muchos datos dentro del mismo equipo'))))));
  }
});

OS.add({
  n: 13, sec: 'proc', title: 'Hilos', url: 'procesos/hilos/',
  demo: 'Qué comparten los hilos y modelos de hilos',
  idea: 'Un hilo es cada uno de los caminos de ejecución dentro de un proceso. Los hilos de un mismo proceso comparten el código, los datos y los archivos, pero cada uno tiene su propia pila y sus propios registros.',
  tips: [
    'Sube el número de hilos: lo de arriba (código, datos, archivos) no se duplica; lo de abajo (registros, pila) sí. Por eso crear un hilo es más barato que crear un proceso.',
    'En los modelos, pulsa «Un hilo hace una llamada bloqueante»: en <b>muchos a uno</b> se paran todos; en <b>uno a uno</b> solo ese.',
    'Di cuál se usa hoy: Linux y Windows usan <b>uno a uno</b>.'
  ],
  render(el) {
    let n = 2; const view = h('div');
    const draw = () => {
      view.innerHTML = '';
      view.append(h('div', { class: 'zoneU' }, h('small', null, `Un proceso con ${n} hilo${n > 1 ? 's' : ''}`),
        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px' } }, ['Código', 'Datos', 'Archivos abiertos'].map(x => h('div', { class: 'node on', style: { textAlign: 'center', margin: 0 } }, x, h('div', { class: 'small muted' }, 'compartido')))),
        h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${n},1fr)`, gap: '6px', marginTop: '8px' } }, Array.from({ length: n }, (_, i) =>
          h('div', { style: { border: `2px solid ${OS.colors[i]}`, borderRadius: '8px', padding: '6px', textAlign: 'center' } }, h('b', { style: { color: OS.colors[i] } }, 'Hilo ' + (i + 1)),
            h('div', { class: 'node', style: { margin: '4px 0' } }, 'Registros'), h('div', { class: 'node', style: { margin: '4px 0' } }, 'Pila'))))));
    };
    el.append(panel('¿Qué comparten los hilos y qué tiene cada uno?', null, field('Número de hilos: ', h('input', { type: 'range', min: 1, max: 4, value: n, oninput: e => { n = +e.target.value; draw(); } })), h('div', { class: 'gap' }), view));
    draw();

    const M = { m1: ['Muchos a uno', 1, 'Todos los hilos de usuario se apoyan en un solo hilo del núcleo. Gestionarlos es muy barato, pero no aprovechan varios núcleos y una llamada bloqueante los detiene a todos.'],
      '11': ['Uno a uno', 4, 'Cada hilo de usuario tiene su propio hilo del núcleo. Hay paralelismo real y un bloqueo no afecta a los demás, aunque crear cada hilo cuesta más. Es el modelo de Linux y Windows.'],
      mn: ['Muchos a muchos', 2, 'Muchos hilos de usuario se reparten entre un grupo más pequeño de hilos del núcleo. Combina las ventajas de los otros dos, pero es complejo de implementar.'] };
    let mod = 'm1', blocked = false;
    const svgBox = h('div', { class: 'scroll' }), info = h('div', { class: 'note' });
    const bar = h('div', { class: 'row' }, Object.keys(M).map(k => btn(M[k][0], e => { mod = k; blocked = false; [...bar.children].forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); drawM(); }, k === mod ? 'on' : '')));
    function drawM() {
      const kn = M[mod][1], ux = i => 90 + i * 130, kx = j => kn === 1 ? 285 : (kn === 4 ? ux(j) : 155 + j * 260);
      let map = mod === 'm1' ? [0, 0, 0, 0] : (mod === '11' ? [0, 1, 2, 3] : [0, 0, 1, 1]);
      let uB = [false, false, false, false], kB = Array(kn).fill(false), text = M[mod][2];
      if (blocked) {
        kB[0] = true;
        if (mod === 'm1') { uB = [true, true, true, true]; text = '<b>Todo el proceso se detiene.</b> El único hilo del núcleo está bloqueado, así que ningún hilo de usuario puede ejecutarse.'; }
        else if (mod === '11') { uB[0] = true; text = '<b>Solo se bloquea ese hilo.</b> Los otros tres tienen su propio hilo del núcleo y siguen ejecutándose.'; }
        else { uB[0] = true; map = [0, 1, 1, 1]; text = '<b>Se bloquea un hilo del núcleo, pero no el proceso.</b> Los demás hilos de usuario se reparten el hilo del núcleo que queda libre.'; }
      }
      const col = b => b ? 'var(--bad)' : 'var(--sec)';
      svgBox.innerHTML = `<svg viewBox="0 0 570 230" style="width:100%;min-width:480px;max-width:640px" role="img" aria-label="Modelo ${M[mod][0]}">
        <text x="10" y="20" font-size="12" class="lbl">Hilos de usuario</text><text x="10" y="222" font-size="12" class="lbl">Hilos del núcleo</text>
        <line x1="0" y1="120" x2="570" y2="120" stroke="var(--line)" stroke-dasharray="5 5"/>
        ${map.map((k, i) => `<line x1="${ux(i)}" y1="72" x2="${kx(k)}" y2="160" stroke="${uB[i] ? 'var(--bad)' : 'var(--muted)'}" stroke-width="2"/>`).join('')}
        ${uB.map((b, i) => `<circle cx="${ux(i)}" cy="52" r="22" fill="${col(b)}"/><text x="${ux(i)}" y="57" text-anchor="middle" font-size="13" style="fill:#fff">U${i + 1}</text>`).join('')}
        ${kB.map((b, j) => `<rect x="${kx(j) - 24}" y="160" width="48" height="36" rx="6" fill="${b ? 'var(--bad)' : 'var(--ink)'}"/><text x="${kx(j)}" y="183" text-anchor="middle" font-size="13" style="fill:var(--bg)">K${j + 1}</text>`).join('')}</svg>`;
      info.className = 'note' + (blocked ? (mod === 'm1' ? ' bad' : ' ok') : ''); info.innerHTML = text;
    }
    el.append(panel('Modelos de hilos: ¿cómo se conectan con el núcleo?', 'Los círculos son hilos de usuario; los rectángulos, hilos del núcleo. Lo rojo está bloqueado.', bar, h('div', { class: 'gap' }), svgBox,
      h('div', { class: 'row' }, btn('Un hilo hace una llamada bloqueante', () => { blocked = true; drawM(); }, 'pri'), btn('Quitar bloqueo', () => { blocked = false; drawM(); })), info));
    drawM();
  }
});

OS.add({
  n: 14, sec: 'proc', title: 'Sincronización', url: 'procesos/sincronizacion/',
  demo: 'Condición de carrera y mutex, paso a paso',
  idea: 'Cuando dos hilos modifican el mismo dato a la vez, el resultado depende de en qué orden se intercalen sus instrucciones: es una condición de carrera. La solución es proteger la sección crítica para que solo entre un hilo cada vez.',
  tips: [
    'Sin mutex, pulsa «Ejecutar intercalado conflictivo»: los dos hilos leen 0, los dos escriben 1. Se esperaba 2: <b>se perdió un incremento</b>.',
    'Explica el porqué: <code>contador++</code> parece una sola operación, pero son tres (leer, sumar, escribir).',
    'Activa el mutex y repite: mientras un hilo está en la sección crítica, el otro queda bloqueado y el resultado siempre es 2.'
  ],
  render(el) {
    const base = [['registro = contador', 'lee el contador'], ['registro = registro + 1', 'suma 1 en su registro'], ['contador = registro', 'escribe el resultado']];
    let mutex = false, cnt, pcs, regs, owner, timer = null;
    const view = h('div'), msg = h('div', { class: 'note' }), log = h('div', { class: 'log' });
    const prog = () => mutex ? [['lock(mutex)', 'pide el mutex'], ...base, ['unlock(mutex)', 'libera el mutex']] : base;
    const names = ['A', 'B'];
    const blockedT = t => mutex && pcs[t] === 0 && owner !== null && owner !== t;
    function step(t) {
      const P = prog(); if (pcs[t] >= P.length || blockedT(t)) return;
      const ins = P[pcs[t]][0];
      if (ins === 'lock(mutex)') owner = t;
      else if (ins === 'unlock(mutex)') owner = null;
      else if (ins === 'registro = contador') regs[t] = cnt;
      else if (ins === 'registro = registro + 1') regs[t]++;
      else cnt = regs[t];
      log.prepend(h('div', null, `Hilo ${names[t]}: ${ins}  →  contador = ${cnt}, registro de ${names[t]} = ${regs[t] ?? '—'}`));
      pcs[t]++; draw();
    }
    function draw() {
      const P = prog(); view.innerHTML = '';
      const done = pcs.every(p => p >= P.length);
      view.append(h('div', { class: 'stats', style: { marginTop: 0 } }, stat('contador (dato compartido)', cnt), stat('Valor esperado al final', 2), mutex ? stat('Mutex', owner === null ? 'libre' : 'lo tiene ' + names[owner]) : null),
        h('div', { class: 'gap' }),
        h('div', { class: 'grid2' }, [0, 1].map(t => h('div', { style: { border: `2px solid ${OS.colors[t]}`, borderRadius: '10px', padding: '10px' } },
          h('b', { style: { color: OS.colors[t] } }, `Hilo ${names[t]}`), ' ', blockedT(t) ? h('span', { class: 'badge b' }, 'bloqueado: espera el mutex') : (pcs[t] >= P.length ? h('span', { class: 'badge' }, 'terminó') : null),
          h('div', { class: 'small muted' }, `registro privado = ${regs[t] ?? '—'}`),
          P.map((ins, i) => h('div', { class: 'node mono small' + (i === pcs[t] ? ' on' : ''), style: { opacity: i < pcs[t] ? .45 : 1 } }, (i < pcs[t] ? '✓ ' : (i === pcs[t] ? '▶ ' : '   ')) + ins[0])),
          btn(`Avanzar hilo ${names[t]}`, () => step(t), 'pri')))));
      view.querySelectorAll('.btn.pri').forEach((b, t) => b.disabled = pcs[t] >= P.length || blockedT(t));
      if (done) { msg.className = 'note ' + (cnt === 2 ? 'ok' : 'bad'); msg.innerHTML = cnt === 2 ? '<b>Resultado correcto: 2.</b> Los dos incrementos se aplicaron.' : `<b>Resultado incorrecto: ${cnt}.</b> Se perdió un incremento: los dos hilos leyeron el mismo valor antes de que el otro escribiera. Eso es una condición de carrera.`; }
      else { msg.className = 'note'; msg.innerHTML = mutex ? 'Con mutex: el primer hilo que ejecuta <code>lock</code> entra en la sección crítica; el otro no puede avanzar hasta el <code>unlock</code>.' : 'Sin protección: tú decides qué hilo avanza en cada momento. Prueba distintos órdenes y mira el resultado final.'; }
    }
    function reset() { if (timer) { OS.stop(timer); timer = null; } cnt = 0; pcs = [0, 0]; regs = [null, null]; owner = null; log.innerHTML = ''; draw(); }
    const auto = () => { reset(); const order = mutex ? [0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1] : [0, 1, 0, 1, 0, 1]; let i = 0; timer = OS.every(() => { if (i >= order.length) { OS.stop(timer); timer = null; return; } step(order[i++]); }, 800); };
    const chk = h('input', { type: 'checkbox', onchange: e => { mutex = e.target.checked; reset(); } });
    el.append(panel('Dos hilos ejecutan contador++ a la vez', 'El contador empieza en 0. Cada hilo lo incrementa una vez, así que debería terminar en 2.',
      h('div', { class: 'row center' }, h('label', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, chk, 'Proteger con mutex'), btn('Ejecutar intercalado conflictivo', auto), btn('Reiniciar', () => reset())),
      h('div', { class: 'gap' }), view, msg, log));
    reset();
  }
});
