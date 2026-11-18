'use strict';
/* ===== Gestión de la memoria: temas 15 a 17 ===== */

OS.add({
  n: 15, sec: 'mem', title: 'Memoria principal', url: 'memoria/memoria-principal/',
  demo: 'Crea y cierra procesos: fragmentación y compactación',
  idea: 'Con asignación contigua, cada proceso necesita un bloque de memoria seguido. Al crear y cerrar procesos van quedando huecos sueltos: puede haber memoria libre de sobra y, aun así, no caber un proceso nuevo. Eso es la fragmentación externa.',
  tips: [
    'Carga el «Escenario con huecos» e intenta crear un proceso de 300 KB: hay más de 300 KB libres, pero repartidos en huecos pequeños. No cabe.',
    'Pulsa «Compactar»: los procesos se juntan, los huecos se unen en uno solo y ahora sí cabe.',
    'Compara estrategias: <b>primer ajuste</b> es el más rápido; <b>mejor ajuste</b> deja huecos diminutos; <b>peor ajuste</b> deja los huecos sobrantes más grandes.'
  ],
  render(el) {
    const TOTAL = 1024; let blocks, alg = 'first', size = 120, next;
    const bar = h('div', { class: 'membar' }), stats = h('div', { class: 'stats' }), msg = h('div', { class: 'note' });
    const merge = () => { for (let i = 0; i < blocks.length - 1;) { if (!blocks[i].p && !blocks[i + 1].p) { blocks[i].s += blocks[i + 1].s; blocks.splice(i + 1, 1); } else i++; } };
    function alloc(sz, quiet) {
      const holes = blocks.map((b, i) => ({ b, i })).filter(x => !x.b.p && x.b.s >= sz);
      const free = blocks.filter(b => !b.p).reduce((a, b) => a + b.s, 0);
      if (!holes.length) {
        if (!quiet) { msg.className = 'note bad'; msg.innerHTML = free >= sz ? `<b>No cabe un proceso de ${sz} KB</b>, aunque hay ${free} KB libres en total: están repartidos en huecos más pequeños. Esto es <b>fragmentación externa</b>. Prueba a compactar.` : `<b>No cabe:</b> solo quedan ${free} KB libres en total.`; }
        return false;
      }
      let pick = holes[0];
      if (alg === 'best') pick = holes.reduce((a, x) => x.b.s < a.b.s ? x : a);
      if (alg === 'worst') pick = holes.reduce((a, x) => x.b.s > a.b.s ? x : a);
      const hole = pick.b, name = 'P' + (next++);
      blocks.splice(pick.i, 1, { p: name, s: sz, c: OS.colors[(next - 2) % 8] }, ...(hole.s > sz ? [{ p: null, s: hole.s - sz }] : []));
      if (!quiet) { msg.className = 'note ok'; msg.innerHTML = `<b>${name} (${sz} KB)</b> se colocó en un hueco de ${hole.s} KB` + (hole.s > sz ? `; sobra un hueco de ${hole.s - sz} KB.` : ', que queda ocupado por completo.'); }
      return name;
    }
    const freeP = name => { const b = blocks.find(x => x.p === name); if (!b) return; b.p = null; merge(); };
    function draw() {
      bar.innerHTML = '';
      blocks.forEach(b => bar.append(b.p
        ? h('div', { class: 'p', title: `Clic para cerrar ${b.p}`, style: { flex: b.s, background: b.c }, onclick: () => { freeP(b.p); msg.className = 'note'; msg.innerHTML = `Se cerró <b>${b.p}</b> y su memoria quedó libre.`; draw(); } }, h('span', { html: `${b.p}<br>${b.s}K` }))
        : h('div', { class: 'hole', style: { flex: b.s } }, h('span', { html: `libre<br>${b.s}K` }))));
      const holes = blocks.filter(b => !b.p), free = holes.reduce((a, b) => a + b.s, 0);
      stats.innerHTML = ''; stats.append(stat('Memoria libre total', free + ' KB'), stat('Hueco más grande', (holes.length ? Math.max(...holes.map(b => b.s)) : 0) + ' KB'), stat('Número de huecos', holes.length), stat('Procesos en memoria', blocks.length - holes.length));
    }
    const sizeIn = num(size, 10, 1024, v => size = v);
    const reset = () => { blocks = [{ p: null, s: TOTAL }]; next = 1; msg.className = 'note'; msg.textContent = 'Memoria vacía. Crea procesos y luego ciérralos haciendo clic sobre ellos.'; draw(); };
    const scen = () => { reset(); const keep = alg; alg = 'first'; [150, 110, 200, 130, 180, 120, 100].forEach(s => alloc(s, true)); ['P2', 'P4', 'P6'].forEach(freeP); alg = keep; size = 300; sizeIn.value = 300; msg.className = 'note'; msg.innerHTML = 'Se crearon 7 procesos y se cerraron 3. Quedan huecos de 110, 130 y 120 KB, más 34 KB al final. Intenta crear ahora un proceso de <b>300 KB</b>.'; draw(); };
    el.append(panel('Memoria de 1024 KB con asignación contigua', 'Crea procesos del tamaño que quieras. Haz clic sobre un proceso para cerrarlo y liberar su memoria.',
      h('div', { class: 'row' }, field('Estrategia', sel([['first', 'Primer ajuste (first-fit)'], ['best', 'Mejor ajuste (best-fit)'], ['worst', 'Peor ajuste (worst-fit)']], alg, v => alg = v)),
        field('Tamaño (KB)', sizeIn), btn('Crear proceso', () => { alloc(size); draw(); }, 'pri'),
        btn('Compactar', () => { const ps = blocks.filter(b => b.p), used = ps.reduce((a, b) => a + b.s, 0); blocks = [...ps, ...(used < TOTAL ? [{ p: null, s: TOTAL - used }] : [])]; msg.className = 'note ok'; msg.innerHTML = '<b>Compactación:</b> los procesos se movieron juntos al principio y toda la memoria libre quedó en un único hueco.'; draw(); }),
        btn('Escenario con huecos', scen), btn('Vaciar', reset)),
      bar, stats, msg));
    reset();
  }
});

OS.add({
  n: 16, sec: 'mem', title: 'Paginación', url: 'memoria/paginacion/',
  demo: 'Traductor de dirección lógica a física',
  idea: 'La paginación divide la memoria del proceso en páginas y la memoria física en marcos del mismo tamaño. Cualquier página puede ir en cualquier marco, así que ya no hace falta un bloque seguido. La tabla de páginas dice en qué marco está cada página.',
  tips: [
    'Mueve el control de la dirección y sigue los tres pasos: separar página y desplazamiento → buscar el marco en la tabla → juntar marco y desplazamiento.',
    'Recalca que el <b>desplazamiento no cambia</b>: solo se sustituye el número de página por el número de marco.',
    'Lleva la dirección a la página 4 (marcada como no válida): se produce un fallo de página, que es el punto de partida de la memoria virtual.'
  ],
  render(el) {
    const PT = [5, 12, 2, 9, null, 7, 0, 14]; let ps = 1024, addr = 2500;
    const out = h('div'), tb = h('tbody'), rng = h('input', { type: 'range', min: 0, style: { width: '100%' } }), nin = h('input', { type: 'number', min: 0 });
    const bin = (v, n) => v.toString(2).padStart(n, '0');
    function draw() {
      const ob = Math.log2(ps), max = 8 * ps - 1; addr = Math.min(addr, max);
      rng.max = max; nin.max = max; rng.value = addr; nin.value = addr;
      const p = Math.floor(addr / ps), d = addr % ps, f = PT[p];
      tb.innerHTML = ''; PT.forEach((fr, i) => tb.append(h('tr', { class: i === p ? 'hl' : '' }, h('td', { class: 'mono' }, i), h('td', { class: 'mono' }, fr === null ? '—' : fr), h('td', null, fr === null ? h('span', { class: 'bad' }, 'no válida') : 'válida'))));
      out.innerHTML = `
        <p><b>1. Separar la dirección lógica ${addr}</b> en número de página (3 bits) y desplazamiento (${ob} bits):</p>
        <div class="bits"><span class="pg">${bin(p, 3)}</span> <span class="of">${bin(d, ob)}</span></div>
        <p class="small muted">página = ${addr} ÷ ${ps} = <b>${p}</b> · desplazamiento = resto = <b>${d}</b></p>
        <p><b>2. Consultar la tabla de páginas:</b> ${f === null ? `la página ${p} no está en memoria.` : `la página ${p} está en el marco <b>${f}</b>.`}</p>` +
        (f === null ? `<div class="note bad"><b>Fallo de página.</b> La CPU avisa al sistema operativo, que debe traer la página desde el disco antes de continuar (tema 17).</div>` :
          `<p><b>3. Formar la dirección física:</b> número de marco + el mismo desplazamiento:</p>
        <div class="bits"><span class="pg">${bin(f, 4)}</span> <span class="of">${bin(d, ob)}</span></div>
        <div class="stats"><div class="stat"><small>Dirección física</small><b>${f * ps + d}</b></div><div class="stat"><small>Cálculo</small><b style="font-size:1rem">${f} × ${ps} + ${d}</b></div></div>`);
    }
    rng.addEventListener('input', () => { addr = +rng.value; draw(); });
    nin.addEventListener('input', () => { const v = parseInt(nin.value, 10); if (!isNaN(v) && v >= 0) { addr = v; draw(); } });
    el.append(panel('Traducir una dirección lógica', 'El proceso tiene 8 páginas y la memoria física 16 marcos.',
      h('div', { class: 'row' }, field('Tamaño de página', sel([[256, '256 bytes'], [1024, '1 KB (1024 bytes)'], [4096, '4 KB (4096 bytes)']], ps, v => { const old = ps; ps = +v; addr = Math.floor(addr / old * ps); draw(); })), field('Dirección lógica', nin)),
      h('div', { class: 'gap' }), rng, h('div', { class: 'gap' }),
      h('div', { class: 'grid2' }, out, h('div', null, h('b', null, 'Tabla de páginas del proceso'), h('table', null, h('thead', null, h('tr', null, ['Página', 'Marco', 'Bit de validez'].map(x => h('th', null, x)))), tb)))));
    draw();
  }
});

/* Algoritmos de reemplazo de páginas (se usa también en las pruebas) */
OS.pageReplace = function (refs, n, alg) {
  const fr = Array(n).fill(null), cols = []; let ptr = 0, faults = 0; const last = {}, loaded = {};
  refs.forEach((r, t) => {
    let fault = false, pos = fr.indexOf(r), victim = null;
    if (pos < 0) {
      fault = true; faults++;
      pos = fr.indexOf(null);
      if (pos < 0) {
        if (alg === 'FIFO') pos = fr.reduce((b, p, i) => loaded[p] < loaded[fr[b]] ? i : b, 0);
        else if (alg === 'LRU') pos = fr.reduce((b, p, i) => last[p] < last[fr[b]] ? i : b, 0);
        else { const nx = p => { const k = refs.indexOf(p, t + 1); return k < 0 ? Infinity : k; }; pos = fr.reduce((b, p, i) => nx(p) > nx(fr[b]) ? i : b, 0); }
        victim = fr[pos];
      }
      fr[pos] = r; loaded[r] = t;
    }
    last[r] = t;
    cols.push({ r, fr: [...fr], fault, pos, victim });
  });
  return { cols, faults };
};

OS.add({
  n: 17, sec: 'mem', title: 'Memoria virtual', url: 'memoria/memoria-virtual/',
  demo: 'Fallos de página: FIFO, LRU y Óptimo',
  idea: 'Con memoria virtual, un proceso puede ejecutarse sin tener todas sus páginas en memoria: se cargan solo cuando se usan (paginación bajo demanda). Si la memoria está llena, hay que elegir una página víctima para sacarla.',
  tips: [
    'Explica una columna: llega una referencia; si la página no está en ningún marco hay <b>fallo de página</b> (columna roja) y se carga desde el disco.',
    'Compara los tres algoritmos con la misma secuencia: <b>Óptimo</b> da el mínimo posible, pero necesita conocer el futuro; <b>LRU</b> se le acerca usando el pasado; <b>FIFO</b> es el más simple.',
    'Sube el número de marcos: con más memoria, menos fallos. Con la secuencia <code>1,2,3,4,1,2,5,1,2,3,4,5</code> y FIFO, pasar de 3 a 4 marcos da <i>más</i> fallos: es la anomalía de Belady.'
  ],
  render(el) {
    let txt = '7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1', n = 3, alg = 'FIFO';
    const A = { FIFO: 'FIFO: sale la página que lleva más tiempo cargada.', LRU: 'LRU: sale la página que lleva más tiempo sin usarse.', OPT: 'Óptimo: sale la página que más tardará en volver a usarse.' };
    const tab = h('table', { class: 'reftab', style: { width: 'auto' } }), stats = h('div', { class: 'stats' }), desc = h('div', { class: 'note' });
    const inp = h('input', { type: 'text', value: txt, style: { width: 'min(100%,460px)' }, oninput: e => { txt = e.target.value; draw(); } });
    function draw() {
      const refs = txt.split(/[\s,;]+/).map(Number).filter(x => Number.isInteger(x) && x >= 0).slice(0, 40);
      const r = OS.pageReplace(refs, n, alg);
      tab.innerHTML = '';
      tab.append(h('tr', null, h('th', null, 'Referencia'), r.cols.map(c => h('th', null, c.r))));
      for (let i = 0; i < n; i++) tab.append(h('tr', null, h('th', null, 'Marco ' + (i + 1)), r.cols.map(c => h('td', { class: (c.fault ? 'f' : '') + (c.fault && c.pos === i ? ' new' : '') }, c.fr[i] === null ? '' : c.fr[i]))));
      tab.append(h('tr', null, h('th', null, '¿Fallo?'), r.cols.map(c => h('td', { class: c.fault ? 'f' : '' }, c.fault ? 'F' : '·'))));
      tab.append(h('tr', null, h('th', null, 'Sale'), r.cols.map(c => h('td', null, c.victim === null ? '' : c.victim))));
      desc.textContent = A[alg];
      stats.innerHTML = ''; stats.append(stat('Fallos de página', r.faults), stat('Aciertos', refs.length - r.faults), stat('Tasa de fallos', refs.length ? Math.round(r.faults / refs.length * 100) + '%' : '—'));
      ['FIFO', 'LRU', 'OPT'].forEach(a => stats.append(stat('Total con ' + (a === 'OPT' ? 'Óptimo' : a), OS.pageReplace(refs, n, a).faults)));
    }
    el.append(panel('Reemplazo de páginas', 'Cada columna es un acceso a memoria. El recuadro rojo marca el marco donde se cargó la página nueva.',
      h('div', { class: 'row' }, field('Algoritmo', sel([['FIFO', 'FIFO'], ['LRU', 'LRU'], ['OPT', 'Óptimo']], alg, v => { alg = v; draw(); })), field('Marcos de memoria', sel([1, 2, 3, 4, 5, 6, 7], n, v => { n = +v; draw(); })),
        field('Secuencia de páginas referenciadas', inp), btn('Ejemplo: anomalía de Belady', () => { txt = inp.value = '1,2,3,4,1,2,5,1,2,3,4,5'; alg = 'FIFO'; el.querySelector('select').value = 'FIFO'; draw(); })),
      desc, h('div', { class: 'gap' }), h('div', { class: 'scroll' }, tab), stats));
    draw();
  }
});
