'use strict';
/* ===== Gestión del almacenamiento: temas 18 a 20 ===== */

OS.add({
  n: 18, sec: 'alm', title: 'Almacenamiento secundario', url: 'almacenamiento/almacenamiento-secundario/',
  demo: 'RAID: escribe datos y rompe discos',
  idea: 'Los discos guardan los datos de forma permanente, pero fallan. Un RAID combina varios discos en un solo volumen para ganar velocidad, tolerancia a fallos o las dos cosas, según el nivel elegido.',
  tips: [
    'En <b>RAID 0</b> escribe varios bloques y rompe un disco: se pierde todo. Es rápido, pero no protege nada.',
    'En <b>RAID 1</b> rompe un disco: los datos siguen ahí porque el otro es una copia exacta. El precio: solo aprovechas la mitad del espacio.',
    'En <b>RAID 5</b> rompe uno: el bloque que falta se recalcula con la paridad. Rompe un segundo disco y ya no hay forma de recuperarlo; RAID 6 sí lo aguanta.'
  ],
  render(el) {
    const R = { 0: { n: 4, tol: 0, cap: n => n, d: 'Distribución en franjas (<i>striping</i>): los bloques se reparten entre todos los discos, sin redundancia. Máxima velocidad y capacidad.' },
      1: { n: 2, tol: 1, cap: () => 1, d: 'Espejo (<i>mirroring</i>): cada bloque se escribe igual en los dos discos.' },
      5: { n: 4, tol: 1, cap: n => n - 1, d: 'Franjas con un bloque de <b>paridad (P)</b> por franja, que va rotando de disco. Con la paridad se reconstruye lo que había en un disco averiado.' },
      6: { n: 4, tol: 2, cap: n => n - 2, d: 'Como RAID 5, pero con <b>dos bloques de paridad (P y Q)</b> por franja: soporta la avería de dos discos a la vez.' } };
    let lvl = 5, count = 6, fail = new Set();
    const view = h('div', { class: 'disks' }), stats = h('div', { class: 'stats' }), msg = h('div', { class: 'note' }), desc = h('div', { class: 'note' });
    const L = i => String.fromCharCode(65 + i % 26) + (i >= 26 ? Math.floor(i / 26) : '');
    function layout() {
      const r = R[lvl], disks = Array.from({ length: r.n }, () => []);
      if (lvl === 1) { for (let i = 0; i < count; i++) disks.forEach(d => d.push([L(i), ''])); return disks; }
      const per = r.cap(r.n); let i = 0, row = 0;
      while (i < count) {
        const pP = lvl >= 5 ? (r.n - 1 - row % r.n) : -1, pQ = lvl === 6 ? (pP + 1) % r.n : -1;
        const first = i, lastI = Math.min(count, i + per) - 1;
        for (let d = 0; d < r.n; d++) {
          if (d === pP) disks[d].push(['P ' + L(first) + (lastI > first ? '–' + L(lastI) : ''), 'par']);
          else if (d === pQ) disks[d].push(['Q ' + L(first) + (lastI > first ? '–' + L(lastI) : ''), 'q']);
          else disks[d].push(i < count ? [L(i++), ''] : ['·', 'empty']);
        }
        row++;
      }
      return disks;
    }
    function draw() {
      const r = R[lvl], disks = layout(); view.innerHTML = '';
      disks.forEach((d, k) => view.append(h('div', { class: 'disk' + (fail.has(k) ? ' fail' : ''), tabindex: '0', title: 'Clic para averiar o reparar', onclick: () => { fail.has(k) ? fail.delete(k) : fail.add(k); draw(); } },
        h('h5', null, `Disco ${k + 1}`, fail.has(k) ? h('span', { class: 'bad' }, ' ✗ averiado') : ''),
        d.map(b => h('div', { class: 'stripe ' + b[1], style: b[1] === 'empty' ? { background: 'var(--idle)', color: 'var(--muted)' } : null }, b[0])))));
      desc.innerHTML = `<b>RAID ${lvl}.</b> ${r.d}`;
      const f = fail.size;
      stats.innerHTML = ''; stats.append(stat('Discos', r.n), stat('Capacidad útil', `${r.cap(r.n)} de ${r.n} discos`), stat('Averías que soporta', r.tol), stat('Discos averiados', f));
      if (!f) { msg.className = 'note'; msg.textContent = 'Todo funciona. Haz clic en un disco para simular que se avería.'; }
      else if (f <= r.tol) { msg.className = 'note ok'; msg.innerHTML = lvl === 1 ? '<b>Los datos siguen disponibles:</b> se leen del disco espejo.' : '<b>Los datos siguen disponibles:</b> lo que había en el disco averiado se recalcula a partir de los otros discos y de la paridad. Al cambiar el disco, el RAID lo reconstruye.'; }
      else { msg.className = 'note bad'; msg.innerHTML = lvl === 0 ? '<b>Datos perdidos.</b> RAID 0 no tiene redundancia: al fallar un solo disco se pierde el volumen entero.' : '<b>Datos perdidos.</b> Hay más discos averiados de los que este nivel puede soportar.'; }
    }
    el.append(panel('Simulador de RAID', 'Cada letra es un bloque de datos. Haz clic sobre un disco para averiarlo (y otra vez para repararlo).',
      h('div', { class: 'row' }, field('Nivel', sel([[0, 'RAID 0 · franjas'], [1, 'RAID 1 · espejo'], [5, 'RAID 5 · paridad'], [6, 'RAID 6 · doble paridad']], lvl, v => { lvl = +v; fail.clear(); draw(); })),
        btn('Escribir un bloque', () => { if (count < 18) count++; draw(); }, 'pri'), btn('Borrar todo', () => { count = 0; draw(); }), btn('Reparar discos', () => { fail.clear(); draw(); })),
      desc, h('div', { class: 'gap' }), view, stats, msg));
    draw();

    el.append(panel('Del disco al sistema de archivos', 'Antes de guardar archivos, el espacio del disco se organiza en varios niveles.', h('div', { class: 'scroll' }, h('table', null,
      h('tr', null, h('th', null, 'Concepto'), h('th', null, 'Qué es')),
      h('tr', null, h('td', null, 'Dispositivo'), h('td', null, 'Disco magnético (platos, pistas y sectores; el acceso aleatorio es lento porque hay que mover el cabezal), disco óptico o memoria de estado sólido (flash, sin partes móviles).')),
      h('tr', null, h('td', null, 'Partición'), h('td', null, 'Cada una de las regiones en que se divide un dispositivo. La tabla de particiones puede ser MBR (la clásica, hasta 4 particiones primarias) o GPT (la actual, admite muchas más y discos más grandes).')),
      h('tr', null, h('td', null, 'Volumen'), h('td', null, 'Cualquier espacio capaz de contener un sistema de archivos: una partición, un RAID o un volumen dinámico creado por un gestor de volúmenes.')),
      h('tr', null, h('td', null, 'Sistema de archivos'), h('td', null, 'La estructura que se crea dentro del volumen para guardar archivos y sus metadatos (temas 19 y 20).'))))));
  }
});

OS.add({
  n: 19, sec: 'alm', title: 'Sistemas de archivos', url: 'almacenamiento/sistema-de-archivos/',
  demo: 'Rutas en el árbol de directorios y permisos',
  idea: 'El sistema de archivos ofrece al usuario una vista lógica y ordenada del almacenamiento: archivos con nombre y atributos, organizados en directorios y protegidos con permisos.',
  tips: [
    'Escribe una ruta relativa como <code>../luis/notas.txt</code> y muestra cómo se resuelve a partir del directorio de trabajo: <code>..</code> sube un nivel.',
    'Diferencia: la ruta <b>absoluta</b> empieza en la raíz (/); la <b>relativa</b> parte del directorio de trabajo actual.',
    'Con los permisos, marca casillas y lee el resultado: tres grupos (propietario, grupo, otros), y cada dígito es la suma de lectura 4 + escritura 2 + ejecución 1.'
  ],
  render(el) {
    const FS = { home: { ana: { docs: { 'informe.txt': 1, 'tesis.pdf': 1 }, fotos: { 'playa.jpg': 1 } }, luis: { 'notas.txt': 1 } }, etc: { passwd: 1, hosts: 1 }, usr: { bin: { ls: 1, cp: 1 } } };
    const dirs = []; (function walk(o, p) { dirs.push(p || '/'); for (const k in o) if (o[k] !== 1) walk(o[k], p + '/' + k); })(FS, '');
    let cwd = '/home/ana', path = '../luis/notas.txt';
    const tree = h('div', { class: 'tree' }), res = h('div', { class: 'note' });
    const lookup = parts => { let o = FS; for (const p of parts) { if (o === 1 || !(p in o)) return undefined; o = o[p]; } return o; };
    function draw() {
      const stack = path.startsWith('/') ? [] : cwd.split('/').filter(Boolean), steps = [];
      path.split('/').filter(Boolean).forEach(p => { if (p === '.') steps.push('<code>.</code> = quedarse en el mismo directorio'); else if (p === '..') { stack.pop(); steps.push('<code>..</code> = subir a /' + stack.join('/')); } else { stack.push(p); steps.push(`entrar en <code>${p}</code>`); } });
      const abs = '/' + stack.join('/'), node = lookup(stack);
      tree.innerHTML = '';
      (function show(o, p, depth, name) {
        const full = p || '/', cls = (full === abs && node !== undefined ? 'hit' : (full === cwd ? 'cwd' : ''));
        tree.append(h('div', null, '   '.repeat(depth), h('span', { class: cls }, (o === 1 ? '📄 ' : '📁 ') + name), full === cwd ? h('span', { class: 'small muted' }, ' ← directorio de trabajo') : null));
        if (o !== 1) for (const k in o) show(o[k], p + '/' + k, depth + 1, k);
      })(FS, '', 0, '/');
      res.className = 'note ' + (node === undefined ? 'bad' : 'ok');
      res.innerHTML = `<b>${path.startsWith('/') ? 'Ruta absoluta' : 'Ruta relativa'}</b>${path.startsWith('/') ? ': se resuelve desde la raíz.' : `: se resuelve desde <code>${cwd}</code>.`}<br>` +
        (steps.length ? steps.join(' → ') + '<br>' : '') + `Ruta absoluta resultante: <b class="mono">${abs}</b><br>` +
        (node === undefined ? 'No existe ningún archivo o directorio con esa ruta.' : (node === 1 ? 'Es un archivo.' : 'Es un directorio.'));
    }
    el.append(panel('Árbol de directorios y nombres de ruta', 'Elige el directorio de trabajo, escribe una ruta y mira a dónde lleva.',
      h('div', { class: 'row' }, field('Directorio de trabajo', sel(dirs, cwd, v => { cwd = v; draw(); })), field('Ruta', h('input', { type: 'text', value: path, oninput: e => { path = e.target.value.trim(); draw(); } })),
        ['../luis/notas.txt', 'docs/informe.txt', '/etc/passwd', '../../usr/bin/ls'].map(x => btn(x, () => { path = x; el.querySelector('input[type=text]').value = x; draw(); }))),
      h('div', { class: 'gap' }), h('div', { class: 'grid2' }, tree, res)));
    draw();

    const who = ['Propietario', 'Grupo', 'Otros'], bits = [[1, 1, 1], [1, 0, 1], [0, 0, 0]], out = h('div', { class: 'note' }), grid = h('div', { class: 'perm' });
    const paint = () => {
      const str = bits.map(b => (b[0] ? 'r' : '-') + (b[1] ? 'w' : '-') + (b[2] ? 'x' : '-')).join(''), oct = bits.map(b => b[0] * 4 + b[1] * 2 + b[2]).join('');
      const say = b => [b[0] && 'leer', b[1] && 'escribir', b[2] && 'ejecutar'].filter(Boolean).join(', ') || 'nada';
      out.innerHTML = `<div class="bits">-${str} &nbsp; → &nbsp; ${oct}</div><p class="mono">chmod ${oct} archivo</p>` + who.map((w, i) => `<b>${w}:</b> puede ${say(bits[i])} (${bits[i][0] * 4} + ${bits[i][1] * 2} + ${bits[i][2]} = ${bits[i][0] * 4 + bits[i][1] * 2 + bits[i][2]})`).join('<br>');
    };
    grid.append(h('span'), ...['Leer', 'Escribir', 'Ejecutar'].map(x => h('span', { class: 'small muted' }, x)));
    who.forEach((w, i) => { grid.append(h('b', null, w)); [0, 1, 2].forEach(j => grid.append(h('label', null, h('input', { type: 'checkbox', checked: !!bits[i][j], 'aria-label': `${w}: ${'rwx'[j]}`, onchange: e => { bits[i][j] = e.target.checked ? 1 : 0; paint(); } }), 'rwx'[j]))); });
    el.append(panel('Permisos de archivo en POSIX', 'Es una lista de control de acceso condensada: tres clases de usuario y tres permisos para cada una.', h('div', { class: 'grid2' }, grid, out)));
    paint();
  }
});

/* Algoritmos de planificación de disco (se usa también en las pruebas) */
OS.diskSeq = function (alg, head, q, max, up) {
  const s = [...q].sort((a, b) => a - b), lo = s.filter(x => x < head), hi = s.filter(x => x >= head);
  const loD = [...lo].reverse(), hiD = [...hi].reverse();
  let seq;
  if (alg === 'FCFS') seq = [...q];
  else if (alg === 'SSTF') { seq = []; const rest = [...q]; let h0 = head; while (rest.length) { let k = 0; rest.forEach((x, i) => { if (Math.abs(x - h0) < Math.abs(rest[k] - h0)) k = i; }); h0 = rest.splice(k, 1)[0]; seq.push(h0); } }
  else if (alg === 'SCAN') seq = up ? [...hi, ...(lo.length ? [max - 1] : []), ...loD] : [...loD, ...(hi.length ? [0] : []), ...hi];
  else if (alg === 'C-SCAN') seq = up ? [...hi, ...(lo.length ? [max - 1, 0] : []), ...lo] : [...loD, ...(hi.length ? [0, max - 1] : []), ...hiD];
  else if (alg === 'LOOK') seq = up ? [...hi, ...loD] : [...loD, ...hi];
  else seq = up ? [...hi, ...lo] : [...loD, ...hiD];
  let total = 0, p = head; seq.forEach(x => { total += Math.abs(x - p); p = x; });
  return { seq, total };
};

OS.add({
  n: 20, sec: 'alm', title: 'Implementación de sistemas de archivos', url: 'almacenamiento/implementacion-de-sistemas-de-archivos/',
  demo: 'Asignación de bloques y carrera de algoritmos de disco',
  idea: 'Por dentro, el sistema de archivos tiene que decidir qué bloques del disco le da a cada archivo, llevar la cuenta de los bloques libres y, en discos magnéticos, en qué orden atender las peticiones para mover el cabezal lo menos posible.',
  tips: [
    'Carga el «Escenario con huecos» en <b>contigua</b> y crea un archivo de 6 bloques: no cabe aunque hay 10 libres. Cambia a <b>enlazada</b> o <b>indexada</b> y repite: ahora sí cabe.',
    'Explica el precio de cada método: la enlazada obliga a recorrer la cadena para llegar a un bloque; la indexada gasta un bloque extra para el índice.',
    'En la carrera de disco, compara las barras: FCFS es el que más mueve el cabezal; SSTF y LOOK lo reducen muchísimo. Haz clic en una barra para ver su recorrido.'
  ],
  render(el) {
    const N = 32; let method = 'cont', blocks, files, nf, size = 3;
    const grid = h('div', { class: 'blocks' }), dir = h('table'), msg = h('div', { class: 'note' }), bitmap = h('div', { class: 'mono small', style: { wordBreak: 'break-all' } });
    const M = { cont: ['Contigua', 'Cada archivo ocupa bloques seguidos. Acceso muy rápido, pero sufre fragmentación externa y hay que saber el tamaño de antemano.'],
      enl: ['Enlazada', 'Cada bloque guarda un puntero al siguiente. No hay fragmentación externa, pero para llegar al bloque n hay que recorrer los anteriores (FAT reúne esos punteros en una tabla).'],
      idx: ['Indexada', 'Un bloque de índices guarda la lista de bloques del archivo. Permite acceso directo sin fragmentación externa, a cambio de gastar bloques en índices (como los inodos de ext2).'] };
    const freeList = () => blocks.map((b, i) => b ? -1 : i).filter(i => i >= 0);
    function create(sz, quiet) {
      const free = freeList(), need = sz + (method === 'idx' ? 1 : 0), name = String.fromCharCode(65 + nf % 26), f = { name, c: OS.colors[nf % 8], sz };
      const fail = t => { if (!quiet) { msg.className = 'note bad'; msg.innerHTML = t; } return false; };
      if (free.length < need) return fail(`<b>No hay espacio:</b> se necesitan ${need} bloques y solo quedan ${free.length} libres.`);
      let use;
      if (method === 'cont') {
        let start = -1; for (let i = 0; i + sz <= N; i++) if (blocks.slice(i, i + sz).every(b => !b)) { start = i; break; }
        if (start < 0) return fail(`<b>No cabe un archivo de ${sz} bloques</b>, aunque hay ${free.length} libres: no hay ${sz} bloques <b>seguidos</b>. Es la fragmentación externa de la asignación contigua.`);
        use = Array.from({ length: sz }, (_, i) => start + i); f.info = `inicio ${start}, longitud ${sz}`;
      } else if (method === 'enl') { use = free.slice(0, sz); f.info = `primer bloque ${use[0]}, último ${use[sz - 1]}`; }
      else { use = free.slice(1, sz + 1); f.index = free[0]; blocks[f.index] = { f, t: 'IDX' }; f.info = `bloque de índices ${f.index} → [${use.join(', ')}]`; }
      use.forEach((b, i) => blocks[b] = { f, t: method === 'enl' ? (i < sz - 1 ? '→' + use[i + 1] : 'fin') : (method === 'idx' ? 'dato' : '') });
      f.use = use; files.push(f); nf++;
      if (!quiet) { msg.className = 'note ok'; msg.innerHTML = `Archivo <b>${name}</b> creado: ${f.info}.`; }
      return true;
    }
    const remove = f => { blocks = blocks.map(b => b && b.f === f ? null : b); files = files.filter(x => x !== f); };
    function draw() {
      grid.innerHTML = '';
      blocks.forEach((b, i) => grid.append(h('div', { class: 'blk' + (b ? '' : ' free'), style: b ? { background: b.f.c, outline: b.t === 'IDX' ? '3px solid var(--ink)' : '' } : null }, h('i', null, i), b ? h('b', null, b.f.name) : '', b && b.t ? h('span', null, b.t) : '')));
      dir.innerHTML = ''; dir.append(h('tr', null, ['Archivo', 'Bloques', 'Lo que guarda el directorio', ''].map(x => h('th', null, x))));
      files.forEach(f => dir.append(h('tr', null, h('td', null, h('span', { class: 'badge', style: { background: f.c } }, f.name)), h('td', null, f.sz), h('td', { class: 'small' }, f.info), h('td', null, btn('Borrar', () => { remove(f); msg.className = 'note'; msg.innerHTML = `Archivo <b>${f.name}</b> borrado: sus bloques quedan libres.`; draw(); })))));
      if (!files.length) dir.append(h('tr', null, h('td', { colspan: 4, class: 'muted' }, 'No hay archivos todavía.')));
      bitmap.textContent = blocks.map(b => b ? 1 : 0).join('');
    }
    const reset = () => { blocks = Array(N).fill(null); files = []; nf = 0; msg.className = 'note'; msg.innerHTML = `<b>${M[method][0]}.</b> ${M[method][1]}`; draw(); };
    const scen = () => { const keep = method; method = 'cont'; reset(); [5, 4, 6, 4, 6, 5].forEach(s => create(s, true)); [files[1], files[3]].forEach(remove); method = keep;
      msg.className = 'note'; msg.innerHTML = 'Disco casi lleno con dos huecos de 4 bloques y 2 bloques al final (10 libres en total). Intenta crear un archivo de <b>6 bloques</b> con cada método.'; draw(); };
    el.append(panel('Métodos de asignación de bloques', 'El disco tiene 32 bloques. Crea y borra archivos, y cambia de método para comparar.',
      h('div', { class: 'row' }, field('Método', sel(Object.keys(M).map(k => [k, M[k][0]]), method, v => { const had = files.length; method = v; if (!had) reset(); else { msg.className = 'note'; msg.innerHTML = `<b>${M[method][0]}.</b> ${M[method][1]} Los archivos nuevos usarán este método.`; } })),
        field('Tamaño (bloques)', sel([1, 2, 3, 4, 5, 6, 7, 8], size, v => size = +v)), btn('Crear archivo', () => { create(size); draw(); }, 'pri'), btn('Escenario con huecos', scen), btn('Vaciar disco', reset)),
      h('div', { class: 'gap' }), h('div', { class: 'grid2' }, h('div', null, grid, h('p', { class: 'small muted', style: { marginBottom: '2px' } }, 'Gestión del espacio libre con vector de bits (1 = ocupado, 0 = libre):'), bitmap), h('div', { class: 'scroll' }, dir)), msg));
    reset();

    // Carrera de algoritmos de planificación de disco
    let qtxt = '98,183,37,122,14,124,65,67', head = 53, up = true, pick = 'SSTF'; const MAX = 200;
    const bars = h('div', { class: 'bars' }), path = h('div', { class: 'scroll' }), pinfo = h('div', { class: 'note' });
    const D = { FCFS: 'atiende en orden de llegada', SSTF: 'atiende siempre la petición más cercana al cabezal', SCAN: 'barre hasta el extremo y vuelve (ascensor)', 'C-SCAN': 'barre en un solo sentido; al llegar al extremo vuelve al principio', LOOK: 'como SCAN, pero da la vuelta en la última petición', 'C-LOOK': 'como C-SCAN, pero sin llegar a los extremos' };
    function drawD() {
      const q = qtxt.split(/[\s,;]+/).map(Number).filter(x => Number.isInteger(x) && x >= 0 && x < MAX).slice(0, 20);
      const R = Object.keys(D).map(a => [a, OS.diskSeq(a, head, q, MAX, up)]), mx = Math.max(1, ...R.map(r => r[1].total)), best = Math.min(...R.map(r => r[1].total));
      bars.innerHTML = '';
      R.forEach(([a, r]) => bars.append(h('b', null, a), h('div', null, h('div', { class: 'bar' + (a === pick ? ' on' : ''), tabindex: '0', title: 'Ver recorrido', style: { width: (r.total / mx * 100) + '%', opacity: r.total === best ? 1 : .6 }, onclick: () => { pick = a; drawD(); } })), h('span', { class: 'mono' }, r.total + ' cil.' + (r.total === best ? ' ★' : ''))));
      const r = OS.diskSeq(pick, head, q, MAX, up), pts = [head, ...r.seq], W = 640, H = 34 + pts.length * 24, X = c => 20 + c / (MAX - 1) * (W - 40);
      path.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:480px" role="img" aria-label="Recorrido del cabezal con ${pick}">
        <line x1="20" y1="14" x2="${W - 20}" y2="14" stroke="var(--line)" stroke-width="2"/>${[0, 50, 100, 150, 199].map(c => `<text class="lbl" x="${X(c)}" y="10" text-anchor="middle">${c}</text>`).join('')}
        <polyline fill="none" stroke="var(--sec)" stroke-width="2" points="${pts.map((c, i) => `${X(c)},${30 + i * 24}`).join(' ')}"/>
        ${pts.map((c, i) => `<circle cx="${X(c)}" cy="${30 + i * 24}" r="4" fill="${i ? 'var(--sec)' : 'var(--warn)'}"/><text class="lbl" x="${X(c) + 8}" y="${34 + i * 24}">${c}</text>`).join('')}</svg>`;
      pinfo.innerHTML = `<b>${pick}:</b> ${D[pick]}. Orden de atención: <span class="mono">${head} → ${r.seq.join(' → ')}</span>. Total: <b>${r.total} cilindros</b>.`;
    }
    el.append(panel('Carrera de algoritmos de planificación de disco', 'Las mismas peticiones, atendidas por los seis algoritmos a la vez. La barra más corta gana (★). Haz clic en una barra para ver el recorrido del cabezal.',
      h('div', { class: 'row' }, field('Cola de peticiones (cilindros 0–199)', h('input', { type: 'text', value: qtxt, style: { width: 'min(100%,300px)' }, oninput: e => { qtxt = e.target.value; drawD(); } })),
        field('Posición inicial', num(head, 0, MAX - 1, v => { head = v; drawD(); })), field('Sentido inicial', sel([['1', 'Hacia cilindros mayores'], ['0', 'Hacia cilindros menores']], '1', v => { up = v === '1'; drawD(); })),
        btn('Peticiones aleatorias', e => { qtxt = Array.from({ length: 8 }, () => Math.floor(Math.random() * MAX)).join(','); e.currentTarget.closest('.panel').querySelector('input[type=text]').value = qtxt; drawD(); })),
      h('div', { class: 'gap' }), bars, pinfo, path));
    drawD();
  }
});
