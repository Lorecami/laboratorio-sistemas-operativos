'use strict';
/* ===== Introducción: temas 1 a 3 ===== */

OS.add({
  n: 1, sec: 'intro', title: 'Definiciones', url: 'introduccion/definiciones/',
  demo: 'Capas de un sistema informático',
  idea: 'Un sistema operativo es el software que hace de intermediario entre los programas y el hardware: reparte los recursos (CPU, memoria, discos) y les da a los programas una forma sencilla y segura de usarlos.',
  tips: [
    'Empieza por la capa de abajo (hardware) y sube: cada capa usa los servicios de la inferior.',
    'Recalca que el <b>núcleo (kernel)</b> es la parte del sistema operativo que siempre está en ejecución.',
    'Cierra con los dos puntos de vista: para el usuario es comodidad; para el sistema es un repartidor de recursos.'
  ],
  render(el) {
    const L = [
      ['Usuarios', 'Personas, otras máquinas u otros ordenadores que usan el sistema para resolver un problema.'],
      ['Programas de aplicación', 'Navegador, editor de texto, juegos, compiladores… Definen cómo se usan los recursos del equipo para resolver los problemas de los usuarios.'],
      ['Sistema operativo', 'Controla y coordina el uso del hardware entre los distintos programas y usuarios. Su parte central es el núcleo (kernel), que siempre está en ejecución.'],
      ['Hardware', 'CPU, memoria y dispositivos de entrada/salida. Son los recursos básicos de cómputo del sistema.']
    ];
    const info = h('div', { class: 'note' });
    const box = h('div', { class: 'layers' });
    const pick = i => { [...box.children].forEach((c, j) => c.classList.toggle('on', i === j)); info.innerHTML = `<b>${L[i][0]}.</b> ${L[i][1]}`; };
    L.forEach((l, i) => box.append(h('div', { class: 'layer', tabindex: '0', onclick: () => pick(i), onkeydown: e => e.key === 'Enter' && pick(i) }, l[0])));
    el.append(panel('Las cuatro capas de un sistema informático', 'Haz clic en cada capa para ver qué papel cumple.', h('div', { class: 'grid2' }, box, info)));
    pick(2);

    const V = {
      'Punto de vista del usuario': 'Al usuario le importa la <b>facilidad de uso</b> y el rendimiento de lo que hace. No le preocupa cómo se reparten los recursos por dentro. En un móvil importa además la batería; en un servidor compartido, que nadie acapare los recursos.',
      'Punto de vista del sistema': 'Para el ordenador, el sistema operativo es un <b>asignador de recursos</b> (decide quién usa la CPU, la memoria y los dispositivos, y cuándo) y un <b>programa de control</b> (vigila la ejecución de los programas para evitar errores y usos indebidos).'
    };
    const out = h('div', { class: 'note' }), bar = h('div', { class: 'row' });
    Object.keys(V).forEach((k, i) => bar.append(btn(k, e => { [...bar.children].forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); out.innerHTML = V[k]; }, i ? '' : 'on')));
    out.innerHTML = V['Punto de vista del usuario'];
    el.append(panel('¿Qué hace un sistema operativo? Depende de quién mire', null, bar, out));
  }
});

OS.add({
  n: 2, sec: 'intro', title: 'Tipos de sistemas', url: 'introduccion/tipos-de-sistemas-operativos/',
  demo: 'Juego de clasificar + uso de la CPU',
  idea: 'No todos los sistemas operativos persiguen lo mismo: un mainframe busca aprovechar al máximo la CPU, un móvil cuidar la batería, y un sistema de tiempo real cumplir plazos.',
  tips: [
    'Usa las tres barras para contar la evolución: en <b>lotes</b> la CPU se queda parada durante la E/S; la <b>multiprogramación</b> aprovecha ese hueco; el <b>tiempo compartido</b> reparte la CPU en turnos cortos para que varios usuarios trabajen a la vez.',
    'Juega dos o tres tarjetas del clasificador y explica por qué va cada una en su casilla.',
    'Diferencia clave: en tiempo real lo importante no es ser rápido, sino <b>cumplir el plazo</b>.'
  ],
  render(el) {
    const A = OS.colors[0], B = OS.colors[1], C = OS.colors[2];
    const rows = [
      ['Procesamiento por lotes', 'Un monitor ejecuta un trabajo tras otro. Mientras el trabajo A espera la E/S, la CPU no hace nada.',
        [['A', 3, A], ['CPU parada (E/S de A)', 4, 0], ['A', 2, A], ['B', 3, B], ['CPU parada (E/S de B)', 4, 0], ['B', 2, B]]],
      ['Multiprogramación', 'Hay varios trabajos en memoria. Cuando A pide E/S, la CPU pasa a B: casi no hay tiempo muerto.',
        [['A', 3, A], ['B', 3, B], ['A', 2, A], ['B', 2, B], ['parada', 1, 0]]],
      ['Tiempo compartido', 'La CPU se reparte en ventanas de tiempo muy cortas. Cada usuario siente que tiene el ordenador para él.',
        [['A', 1, A], ['B', 1, B], ['C', 1, C], ['A', 1, A], ['B', 1, B], ['C', 1, C], ['A', 1, A], ['B', 1, B], ['C', 1, C], ['A', 1, A], ['B', 1, B]]]
    ];
    const p = panel('Evolución en los mainframes: ¿cómo se aprovecha la CPU?', 'Cada barra es el tiempo de la CPU. Lo gris rayado es tiempo desperdiciado.');
    rows.forEach(r => p.append(h('b', null, r[0]), h('div', { class: 'small muted' }, r[1]),
      h('div', { class: 'tl' }, r[2].map(s => h('div', { class: s[2] ? '' : 'idle', style: { flex: s[1], background: s[2] || '' } }, s[0])))));
    el.append(p);

    const g = panel('Juego: ¿qué tipo de sistema es?', 'Coloca cada caso en el tipo de sistema que le corresponde.');
    classify(g, [
      { id: 'main', label: 'Mainframe' }, { id: 'esc', label: 'Escritorio' }, { id: 'mano', label: 'De mano' },
      { id: 'multi', label: 'Multiprocesador' }, { id: 'dist', label: 'Distribuido' }, { id: 'tr', label: 'Tiempo real' }
    ], [
      { t: 'Ordenador central de un banco que procesa millones de transacciones', c: 'main', why: 'Gran capacidad de E/S y fiabilidad.' },
      { t: 'Laptop con Windows o GNU/Linux', c: 'esc', why: 'Ordenador personal de propósito general.' },
      { t: 'Smartphone con Android', c: 'mano', why: 'Recursos limitados; importa la batería.' },
      { t: 'Servidor con dos CPU que comparten memoria y reloj', c: 'multi', why: 'Varios procesadores en un mismo equipo.' },
      { t: 'Red P2P donde cada equipo es cliente y servidor', c: 'dist', why: 'Equipos autónomos conectados por red.' },
      { t: 'Clúster de servidores web con alta disponibilidad', c: 'dist', why: 'Varios ordenadores trabajando juntos.' },
      { t: 'Control de los frenos ABS de un auto', c: 'tr', why: 'Debe responder dentro de un plazo estricto.' },
      { t: 'Marcapasos', c: 'tr', why: 'Sistema empotrado con plazos estrictos.' }
    ]);
    el.append(g);
  }
});

OS.add({
  n: 3, sec: 'intro', title: 'Historia', url: 'introduccion/historia-de-los-sistemas-operativos/',
  demo: 'Línea de tiempo interactiva',
  idea: 'La historia de los sistemas operativos va de la mano de la del hardware: cada generación de ordenadores trajo una forma nueva de trabajar, desde máquinas sin sistema operativo hasta los móviles de hoy.',
  tips: [
    'Recorre la línea con el botón «Siguiente» y di una sola frase por hito.',
    'Hilo conductor: <b>sin sistema operativo → lotes → multiprogramación y tiempo compartido → UNIX → ordenadores personales → móviles</b>.',
    'Destaca UNIX (1969): de ahí vienen las ideas de GNU/Linux, macOS, Android e iOS.'
  ],
  render(el) {
    const G = [null,
      { n: 'Primera generación', r: '1945–1955', c: '#8a8f98', a: 1945, b: 1955, d: 'Tubos de vacío. <b>No había sistema operativo</b>: se programaba en lenguaje máquina, cableando paneles o con tarjetas perforadas, y cada programador reservaba la máquina por turnos.' },
      { n: 'Segunda generación', r: '1955–1964', c: '#b08900', a: 1955, b: 1964, d: 'Transistores y mainframes. Nace el <b>procesamiento por lotes</b>: un programa monitor carga y ejecuta un trabajo tras otro sin que el operador intervenga.' },
      { n: 'Tercera generación', r: '1965–1968', c: '#0f8a7e', a: 1964, b: 1968, d: 'Circuitos integrados. Llegan la <b>multiprogramación</b> (varios trabajos en memoria) y el <b>tiempo compartido</b> (varios usuarios con terminales).' },
      { n: 'Cuarta generación', r: '1965–1980', c: '#d9541a', a: 1968, b: 1980, d: 'Grandes sistemas de tiempo compartido: Multics, VM/CMS, <b>UNIX</b>, VMS. Aparecen ideas que siguen vigentes: sistema de archivos jerárquico, máquinas virtuales, portabilidad.' },
      { n: 'Quinta generación', r: 'Desde 1980', c: '#6d4bd8', a: 1980, b: 2010, d: 'Ordenadores personales, interfaces gráficas, redes e Internet y, finalmente, los dispositivos móviles.' }
    ];
    const E = [
      [1945, 1, 'ENIAC', 'Uno de los primeros ordenadores electrónicos de propósito general. Se programaba moviendo cables e interruptores: no existía sistema operativo.'],
      [1956, 2, 'GM-NAA I/O', 'Considerado el primer sistema operativo: un monitor de lotes para el IBM 704 que encadenaba los trabajos automáticamente.'],
      [1957, 2, 'FORTRAN', 'Primer lenguaje de alto nivel de uso amplio. Los trabajos por lotes pasan a ser «compilar, cargar y ejecutar».'],
      [1966, 3, 'IBM OS/360', 'Un mismo sistema operativo para toda una familia de ordenadores (System/360). Populariza la multiprogramación.'],
      [1969, 4, 'Multics', 'Sistema de tiempo compartido muy ambicioso (MIT, Bell Labs y General Electric). Demasiado complejo, pero inspiró a UNIX.'],
      [1969.7, 4, 'UNIX', 'Nace en Bell Labs en 1969 (Thompson y Ritchie). Sencillo, multiusuario y, al reescribirse en C, portable a muchas máquinas.'],
      [1972, 4, 'IBM VM/CMS', 'Introduce las máquinas virtuales: cada usuario cree tener un ordenador completo para él.'],
      [1977, 4, 'VMS', 'Sistema de DEC para los VAX, con memoria virtual. Muchas de sus ideas llegarían después a Windows NT.'],
      [1974, 5, 'CP/M', 'Sistema para los primeros microordenadores de 8 bits; precursor directo de MS-DOS.'],
      [1981, 5, 'MS-DOS', 'Sistema del IBM PC: monousuario, monotarea y manejado por línea de comandos.'],
      [1984, 5, 'Macintosh', 'Lleva al gran público la interfaz gráfica con ventanas, iconos y ratón.'],
      [1985, 5, 'Windows 1.0', 'Entorno gráfico de Microsoft que al principio funcionaba encima de MS-DOS.'],
      [1991, 5, 'Linux', 'Linus Torvalds publica su núcleo, que junto a las herramientas del proyecto GNU forma un sistema libre tipo UNIX.'],
      [1993, 5, 'Windows NT', 'Núcleo nuevo de 32 bits, multitarea y multiusuario: es la base de los Windows actuales.'],
      [2001, 5, 'Mac OS X', 'Apple cambia a un sistema de base UNIX (hoy macOS).'],
      [2007, 5, 'iPhone OS', 'Sistema de Apple para móviles con pantalla táctil (hoy iOS).'],
      [2008, 5, 'Android', 'Sistema para móviles basado en el núcleo Linux; hoy es el más usado del mundo.']
    ].sort((a, b) => a[0] - b[0]);
    const x = y => ((y - 1943) / (2011 - 1943) * 100) + '%';
    let cur = 0, gen = 0;
    const axis = h('div', { class: 'axis' }), card = h('div', { class: 'note' }), gbar = h('div', { class: 'row' }), ginfo = h('div', { class: 'note' });
    G.slice(1).forEach((g, i) => axis.append(h('div', { class: 'band', style: { left: x(g.a), width: `calc(${x(g.b)} - ${x(g.a)})`, top: (i % 2 ? 22 : 4) + 'px', background: g.c }, title: `${g.n} (${g.r})` }, `${i + 1}ª`)));
    for (let y = 1950; y <= 2010; y += 10) axis.append(h('span', { class: 'tick', style: { left: x(y) } }, y));
    const dots = E.map((e, i) => { const d = h('button', { class: 'dot', title: `${Math.floor(e[0])} · ${e[2]}`, 'aria-label': `${Math.floor(e[0])} ${e[2]}`, style: { left: x(e[0]), background: G[e[1]].c }, onclick: () => go(i) }); axis.append(d); return d; });
    function go(i) {
      cur = (i + E.length) % E.length; const e = E[cur];
      dots.forEach((d, j) => { d.classList.toggle('on', j === cur); d.classList.toggle('dim', gen && E[j][1] !== gen); });
      card.innerHTML = `<span class="mono muted">${Math.floor(e[0])} · ${G[e[1]].n}</span><br><b style="font-size:1.25rem">${e[2]}</b><br>${e[3]}`;
    }
    function setGen(g) {
      gen = g; [...gbar.children].forEach((b, j) => b.classList.toggle('on', j === g));
      ginfo.innerHTML = g ? `<b>${G[g].n} (${G[g].r}).</b> ${G[g].d}` : 'Elige una generación para ver qué la caracteriza, o haz clic en los puntos de la línea de tiempo.';
      if (g) { const k = E.findIndex(e => e[1] === g); go(k); } else go(cur);
    }
    gbar.append(btn('Todas', () => setGen(0)), ...G.slice(1).map((g, i) => btn(`${i + 1}ª generación`, () => setGen(i + 1))));
    el.append(panel('De las máquinas sin sistema operativo al móvil', 'Las bandas de color son las cinco generaciones; cada punto es un hito.',
      gbar, ginfo, h('div', { class: 'scroll' }, h('div', { style: { minWidth: '640px', paddingBottom: '26px' } }, axis)),
      card, h('div', { class: 'gap' }), h('div', { class: 'row' }, btn('◀ Anterior', () => go(cur - 1)), btn('Siguiente ▶', () => go(cur + 1), 'pri'))));
    setGen(0); go(0);
  }
});
