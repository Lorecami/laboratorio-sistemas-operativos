'use strict';
/* ===== Organización: temas 4 a 8 ===== */

OS.add({
  n: 4, sec: 'org', title: 'Componentes', url: 'organizacion/componentes-del-sistema/',
  demo: '¿Qué componente trabaja en cada acción?',
  idea: 'Un sistema operativo es demasiado grande para ser una sola pieza. Se divide en componentes, cada uno encargado de administrar un tipo de recurso.',
  tips: [
    'Pulsa una acción cotidiana (por ejemplo «Abrir un programa») y narra qué componente se enciende y por qué.',
    'Insiste en que <b>ninguna acción usa un solo componente</b>: todos colaboran.',
    'Si te preguntan, el componente que el usuario «ve» es la interfaz (intérprete de comandos o entorno gráfico).'
  ],
  render(el) {
    const C = {
      proc: ['Gestión de procesos', 'Crea y termina procesos, los suspende y reanuda, y ofrece mecanismos para que se comuniquen y sincronicen.'],
      mem: ['Gestión de la memoria principal', 'Lleva la cuenta de qué partes de la memoria están en uso y por quién, y asigna y libera memoria según se necesite.'],
      arch: ['Sistema de archivos', 'Ofrece la abstracción de archivo y directorio: crear, borrar, leer, escribir y controlar quién puede acceder.'],
      alm: ['Almacenamiento secundario', 'Administra discos y otros dispositivos: espacio libre, asignación de espacio y organización en volúmenes.'],
      es: ['Sistema de E/S', 'Oculta las particularidades de cada dispositivo mediante controladores (drivers), búferes y cachés.'],
      red: ['Gestión de red', 'Permite comunicarse con otros equipos: implementa los protocolos de red.'],
      seg: ['Protección y seguridad', 'Controla el acceso de procesos y usuarios a los recursos, y defiende el sistema de ataques.'],
      ui: ['Interfaz de usuario', 'Intérprete de comandos o entorno gráfico: es lo que traduce las órdenes del usuario en peticiones al sistema.']
    };
    const A = [
      ['Abrir un programa', ['ui', 'arch', 'alm', 'mem', 'proc'], 'La interfaz recibe el doble clic → el sistema de archivos localiza el ejecutable → se lee del disco → se reserva memoria para cargarlo → se crea el proceso.'],
      ['Guardar un documento', ['arch', 'seg', 'alm', 'es'], 'El sistema de archivos recibe la orden → se comprueban los permisos → se asignan bloques en el disco → el sistema de E/S envía los datos al dispositivo.'],
      ['Descargar un archivo', ['red', 'mem', 'arch', 'alm'], 'La red recibe los paquetes → se guardan en búferes de memoria → el sistema de archivos los escribe → se asigna espacio en el disco.'],
      ['Conectar una memoria USB', ['es', 'alm', 'arch', 'ui'], 'El sistema de E/S detecta el dispositivo y carga su controlador → se reconocen sus particiones → se monta su sistema de archivos → la interfaz muestra la unidad.'],
      ['Iniciar sesión', ['ui', 'seg', 'proc'], 'La interfaz pide usuario y contraseña → protección y seguridad los verifica → se crean los procesos de la sesión del usuario.']
    ];
    const grid = h('div', { class: 'boxes' }), info = h('div', { class: 'note' }, 'Haz clic en un componente para ver de qué se encarga, o elige una acción para ver cuáles participan.');
    const els = {};
    Object.keys(C).forEach(k => { els[k] = h('div', { class: 'box', tabindex: '0', onclick: () => { clear(); els[k].classList.add('on'); info.innerHTML = `<b>${C[k][0]}.</b> ${C[k][1]}`; } }, C[k][0]); grid.append(els[k]); });
    let run = null;
    function clear() { if (run) { OS.stop(run); run = null; } Object.values(els).forEach(e => { e.classList.remove('on'); const s = e.querySelector('small'); if (s) s.remove(); }); }
    const bar = h('div', { class: 'row' }, A.map(a => btn(a[0], () => {
      clear(); info.innerHTML = `<b>${a[0]}.</b> ${a[2]}`; let i = 0;
      const stepf = () => { if (i >= a[1].length) { OS.stop(run); run = null; return; } const e = els[a[1][i]]; e.classList.add('on'); e.append(h('small', null, `paso ${i + 1}`)); i++; };
      stepf(); run = OS.every(stepf, 700);
    })));
    el.append(panel('Los componentes y quién trabaja en cada acción', 'Elige una acción cotidiana y mira en qué orden se activan los componentes.', bar, h('div', { class: 'gap' }), grid, info));
  }
});

OS.add({
  n: 5, sec: 'org', title: 'Servicios', url: 'organizacion/servicios-del-sistema/',
  demo: 'Arrastrar y soltar: ¿para quién es cada servicio?',
  idea: 'El sistema operativo ofrece servicios. Unos existen para hacerle la vida más fácil al usuario y a sus programas; otros, para que el propio sistema funcione de forma eficiente y segura cuando hay muchos usuarios y procesos.',
  tips: [
    'Arrastra dos o tres tarjetas en vivo y explica el criterio: «¿esto lo nota el usuario, o es trabajo interno del sistema?».',
    'Servicios al usuario: interfaz, ejecutar programas, E/S, archivos, comunicaciones y detección de errores.',
    'Servicios para el sistema: asignación de recursos, contabilidad (monitorización) y protección y seguridad.'
  ],
  render(el) {
    const g = panel('Clasifica los servicios', 'Cada tarjeta es un servicio del sistema operativo. ¿A quién sirve principalmente?');
    classify(g, [{ id: 'u', label: 'Servicios útiles para el usuario' }, { id: 's', label: 'Servicios para el funcionamiento eficiente del sistema' }], [
      { t: 'Interfaz de usuario', c: 'u', why: 'Línea de comandos o entorno gráfico para dar órdenes.' },
      { t: 'Ejecución de programas', c: 'u', why: 'Cargar un programa en memoria, ejecutarlo y terminarlo.' },
      { t: 'Operaciones de E/S', c: 'u', why: 'Los programas no acceden al dispositivo: se lo piden al sistema.' },
      { t: 'Manipulación de archivos', c: 'u', why: 'Crear, leer, escribir, borrar y buscar archivos y directorios.' },
      { t: 'Comunicaciones', c: 'u', why: 'Intercambiar información entre procesos, en el mismo equipo o por red.' },
      { t: 'Detección de errores', c: 'u', why: 'Fallos de hardware o de los programas, para actuar ante ellos.' },
      { t: 'Asignación de recursos', c: 's', why: 'Repartir CPU, memoria y dispositivos entre muchos procesos.' },
      { t: 'Contabilidad', c: 's', why: 'Registrar qué recursos usa cada usuario y cuánto.' },
      { t: 'Protección y seguridad', c: 's', why: 'Controlar el acceso a los recursos y autenticar a los usuarios.' }
    ]);
    el.append(g);
  }
});

OS.add({
  n: 6, sec: 'org', title: 'Interfaz de programación', url: 'organizacion/interfaz-de-programacion-de-aplicaciones/',
  demo: 'El viaje de una llamada al sistema',
  idea: 'Un programa no puede tocar el hardware directamente. Pide los servicios al sistema operativo mediante llamadas al sistema, casi siempre a través de una API (POSIX o Windows API) y de varias capas de librerías.',
  tips: [
    'Sigue el viaje de <code>printf("Hola")</code> paso a paso: aplicación → librería estándar → librería del sistema → núcleo.',
    'El momento clave es el salto de <b>modo usuario a modo núcleo</b>: solo ocurre con una instrucción especial (syscall o trap).',
    'Cambia a «Windows API» para mostrar que la idea es la misma, solo cambian los nombres de las funciones.'
  ],
  render(el) {
    const N = {
      posix: [['app', 'Aplicación', 'printf("Hola")'], ['std', 'Librería estándar de C', 'libc: printf()'], ['sys', 'Librería del sistema', 'libc: write(1, buf, 4)'], ['int', 'Interfaz de llamadas al sistema', 'tabla de llamadas'], ['ker', 'Núcleo', 'sys_write()'], ['hw', 'Controlador y dispositivo', 'driver del terminal']],
      win: [['app', 'Aplicación', 'printf("Hola")'], ['std', 'Librería estándar de C', 'CRT: printf()'], ['sys', 'Librería del sistema', 'kernel32.dll: WriteFile() → ntdll.dll: NtWriteFile()'], ['int', 'Interfaz de llamadas al sistema', 'tabla de servicios'], ['ker', 'Núcleo', 'ntoskrnl.exe: NtWriteFile'], ['hw', 'Controlador y dispositivo', 'driver de consola']]
    };
    const S = {
      posix: [
        ['app', 'u', 'El programa llama a <code>printf("Hola")</code>. Sigue siendo código normal en <b>modo usuario</b>.'],
        ['std', 'u', 'La <b>librería estándar</b> da formato al texto y lo guarda en un búfer. Cuando toca vaciarlo, llama a <code>write()</code>.'],
        ['sys', 'u', 'La función <code>write()</code> de la <b>librería del sistema</b> prepara la llamada: pone el número de la llamada y los argumentos en registros de la CPU.'],
        ['int', 'k', 'Ejecuta la instrucción <code>syscall</code>. La CPU <b>cambia a modo núcleo</b> y salta a un punto de entrada fijo del sistema operativo.'],
        ['ker', 'k', 'El núcleo usa el número para buscar en su <b>tabla de llamadas</b> y ejecuta <code>sys_write()</code>, que comprueba los argumentos y los permisos.'],
        ['hw', 'k', 'El núcleo pasa los datos al <b>controlador</b> del dispositivo, y «Hola» aparece en el terminal.'],
        ['sys', 'u', 'El núcleo deja el resultado en un registro y la CPU <b>vuelve a modo usuario</b>. <code>write()</code> devuelve el número de bytes escritos.'],
        ['app', 'u', '<code>printf()</code> retorna y el programa continúa con su siguiente instrucción.']
      ]
    };
    S.win = S.posix.map(s => [...s]);
    S.win[1][2] = 'La <b>librería estándar</b> (CRT) da formato al texto y lo guarda en un búfer. Cuando toca vaciarlo, llama a <code>WriteFile()</code> de la Windows API.';
    S.win[2][2] = '<code>WriteFile()</code> (kernel32.dll) llama a <code>NtWriteFile()</code> en ntdll.dll, que pone el número del servicio y los argumentos en registros.';
    S.win[4][2] = 'El núcleo (ntoskrnl.exe) busca el número en su <b>tabla de servicios</b> y ejecuta la rutina <code>NtWriteFile</code>, que comprueba argumentos y permisos.';
    S.win[6][2] = 'El núcleo deja el resultado y la CPU <b>vuelve a modo usuario</b>. <code>WriteFile()</code> informa de cuántos bytes se escribieron.';
    let api = 'posix', ctl;
    const lanes = h('div', { class: 'lanes' }), mode = h('span', { class: 'badge u' });
    const draw = () => {
      lanes.innerHTML = '';
      const u = h('div', { class: 'zoneU' }, h('small', null, 'Modo usuario')), k = h('div', { class: 'zoneK' }, h('small', null, 'Modo núcleo (privilegiado)'));
      N[api].forEach((n, i) => (i < 3 ? u : k).append(h('div', { class: 'node', 'data-id': n[0] }, h('b', null, n[1]), ' ', h('code', null, n[2]))));
      lanes.append(u, k);
    };
    const p = panel('¿Qué pasa cuando un programa escribe «Hola» en pantalla?', 'Avanza paso a paso y fíjate en qué momento se cruza la frontera entre modo usuario y modo núcleo.',
      h('div', { class: 'row center' }, field('API', sel([['posix', 'POSIX (GNU/Linux, macOS)'], ['win', 'Windows API']], api, v => { api = v; draw(); ctl.reset(); })), h('span', null, 'Modo de la CPU: ', mode)),
      h('div', { class: 'gap' }));
    const g = h('div', { class: 'grid2' }, lanes, h('div'));
    p.append(g); draw();
    ctl = stepper(g.lastChild, () => S[api].map(s => ({ id: s[0], m: s[1], t: s[2] })), s => {
      lanes.querySelectorAll('.node').forEach(n => n.classList.toggle('on', n.dataset.id === s.id));
      mode.className = 'badge ' + s.m; mode.textContent = s.m === 'u' ? 'usuario' : 'núcleo';
    });
    el.append(p);
  }
});

OS.add({
  n: 7, sec: 'org', title: 'Operación del sistema', url: 'organizacion/operacion-del-sistema-operativo/',
  demo: 'Interrupciones, modo dual y temporizador',
  idea: 'El sistema operativo no está ejecutándose todo el tiempo: está «dormido» hasta que ocurre un evento (una interrupción, una excepción o una llamada al sistema). El modo dual y el temporizador garantizan que siempre pueda recuperar el control.',
  tips: [
    'Lanza una <b>interrupción de teclado</b> y cuenta el ciclo: guardar el estado → modo núcleo → vector de interrupciones → rutina de servicio → restaurar.',
    'Lanza la <b>instrucción privilegiada</b> para mostrar para qué sirve el modo dual: un programa de usuario no puede saltarse al sistema operativo.',
    'Lanza el <b>temporizador</b>: sin él, un programa en bucle infinito se quedaría con la CPU para siempre.'
  ],
  render(el) {
    const V = ['0 · División por cero', '1 · Instrucción no permitida', '2 · Temporizador', '3 · Teclado', '4 · Llamada al sistema'];
    const EV = {
      'Interrupción del teclado': [
        ['u', 'prog', -1, 'El programa de usuario se está ejecutando con normalidad.'],
        ['u', 'cpu', -1, 'El usuario pulsa una tecla. El teclado activa una <b>interrupción</b> para avisar a la CPU.'],
        ['k', 'cpu', -1, 'La CPU termina la instrucción en curso, <b>guarda el estado</b> del programa (contador de programa y registros) y cambia a <b>modo núcleo</b>.'],
        ['k', 'vec', 3, 'Con el número de la interrupción consulta el <b>vector de interrupciones</b>, que dice dónde está la rutina que la atiende.'],
        ['k', 'ker', 3, 'Se ejecuta la <b>rutina de servicio</b>: el núcleo lee la tecla y la guarda en un búfer.'],
        ['u', 'prog', -1, 'Se <b>restaura el estado</b> guardado y la CPU vuelve a modo usuario. El programa sigue como si nada hubiera pasado.']],
      'Llamada al sistema': [
        ['u', 'prog', -1, 'El programa necesita un servicio del sistema operativo, por ejemplo leer un archivo.'],
        ['k', 'cpu', -1, 'Ejecuta una instrucción especial (<code>syscall</code>). Es una interrupción provocada a propósito por el software: la CPU guarda el estado y pasa a <b>modo núcleo</b>.'],
        ['k', 'vec', 4, 'Se localiza el punto de entrada de las llamadas al sistema.'],
        ['k', 'ker', 4, 'El núcleo comprueba los argumentos, realiza el servicio pedido y prepara el resultado.'],
        ['u', 'prog', -1, 'La CPU vuelve a modo usuario y el programa recibe el resultado.']],
      'Excepción: división por cero': [
        ['u', 'prog', -1, 'El programa ejecuta una división cuyo divisor vale 0.'],
        ['k', 'cpu', -1, 'La propia CPU detecta el error y genera una <b>excepción</b>: guarda el estado y pasa a modo núcleo.'],
        ['k', 'vec', 0, 'Se consulta el vector: entrada de «división por cero».'],
        ['k', 'ker', 0, 'El núcleo no puede arreglar el error: <b>termina el proceso</b> (o le envía una señal) y libera sus recursos.'],
        ['x', 'prog', -1, 'El programa ha sido abortado. El resto del sistema sigue funcionando: el error quedó aislado.']],
      'Instrucción privilegiada en modo usuario': [
        ['u', 'prog', -1, 'El programa intenta ejecutar una instrucción privilegiada, por ejemplo desactivar las interrupciones.'],
        ['k', 'cpu', -1, 'El bit de modo indica <b>modo usuario</b>, así que la CPU se niega a ejecutarla y genera una excepción.'],
        ['k', 'vec', 1, 'Se consulta el vector: entrada de «instrucción no permitida».'],
        ['k', 'ker', 1, 'El núcleo trata el intento como un error y termina el proceso.'],
        ['x', 'prog', -1, 'Gracias al <b>modo dual</b>, un programa no puede tomar el control del hardware saltándose al sistema operativo.']],
      'Temporizador': [
        ['u', 'prog', -1, 'El programa A está en un bucle infinito y nunca devuelve el control por su cuenta.'],
        ['k', 'cpu', -1, 'Antes de cederle la CPU, el sistema operativo programó un <b>temporizador</b>. Al llegar a cero genera una interrupción.'],
        ['k', 'vec', 2, 'Se consulta el vector: entrada del temporizador.'],
        ['k', 'ker', 2, 'El núcleo recupera el control y el <b>planificador</b> decide que ya le toca a otro proceso.'],
        ['u', 'prog', -1, 'La CPU pasa a ejecutar el programa B. Nadie puede quedarse con la CPU para siempre.']]
    };
    let cur = Object.keys(EV)[0], ctl;
    const mode = h('span', { class: 'badge u' }, 'usuario');
    const nodes = { prog: h('div', { class: 'node' }, h('b', null, 'Programa de usuario')), cpu: h('div', { class: 'node' }, h('b', null, 'CPU'), ' · bit de modo: ', mode), ker: h('div', { class: 'node' }, h('b', null, 'Núcleo del sistema operativo')) };
    const vt = h('table', null, h('tbody', null, V.map(v => h('tr', null, h('td', { class: 'mono' }, v)))));
    nodes.vec = h('div', { class: 'node' }, h('b', null, 'Vector de interrupciones'), vt);
    const bar = h('div', { class: 'row' }, Object.keys(EV).map((k, i) => btn(k, e => { cur = k; [...bar.children].forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); ctl.reset(); }, i ? '' : 'on')));
    const right = h('div');
    const p = panel('¿Cuándo entra en acción el sistema operativo?', 'Elige un evento y avanza paso a paso.', bar, h('div', { class: 'gap' }),
      h('div', { class: 'grid2' }, h('div', { class: 'lanes' }, h('div', { class: 'zoneU' }, h('small', null, 'Modo usuario'), nodes.prog), nodes.cpu, h('div', { class: 'zoneK' }, h('small', null, 'Modo núcleo'), nodes.vec, nodes.ker)), right));
    ctl = stepper(right, () => EV[cur].map(s => ({ m: s[0], id: s[1], v: s[2], t: s[3] })), s => {
      Object.keys(nodes).forEach(k => nodes[k].classList.toggle('on', k === s.id));
      nodes.prog.classList.toggle('crash', s.m === 'x');
      mode.className = 'badge ' + (s.m === 'k' ? 'k' : 'u'); mode.textContent = s.m === 'k' ? 'núcleo' : 'usuario';
      [...vt.rows].forEach((r, i) => r.classList.toggle('hl', i === s.v));
    });
    el.append(p);
  }
});

OS.add({
  n: 8, sec: 'org', title: 'Sistemas por su estructura', url: 'organizacion/sistemas-operativos-por-su-estructura/',
  demo: 'Compara estructuras y provoca un fallo',
  idea: 'La gran decisión de diseño es qué funcionalidad se ejecuta dentro del núcleo (rápido, pero un fallo lo tumba todo) y qué se ejecuta fuera, como procesos normales (más seguro, pero más lento).',
  tips: [
    'Compara <b>monolítico</b> y <b>microkernel</b>: fíjate en cuántas piezas quedan dentro del núcleo en cada uno.',
    'Pulsa «Provocar fallo en un controlador» en ambos: en el monolítico cae todo el sistema; en el microkernel solo se reinicia ese servicio.',
    'Conclusión: los sistemas actuales (Linux, Windows, macOS) son <b>modulares o híbridos</b>, porque buscan un equilibrio entre rendimiento y fiabilidad.'
  ],
  render(el) {
    const T = {
      sen: { n: 'Estructura sencilla', ej: 'MS-DOS, el UNIX original', k: [], u: [], all: ['Aplicaciones', 'Sistema de archivos', 'Controladores', 'Gestión de memoria', 'Planificador'],
        d: 'No hay componentes bien separados. En MS-DOS ni siquiera había modo dual: las aplicaciones podían acceder directamente al hardware.', pro: 'Pequeño y simple.', con: 'Un programa con errores puede corromper todo el sistema.', crash: 1 },
      cap: { n: 'En capas', ej: 'OS/2', k: ['Capa 4 · Sistema de archivos', 'Capa 3 · Controladores', 'Capa 2 · Gestión de memoria', 'Capa 1 · Planificador', 'Capa 0 · Hardware'], u: ['Aplicaciones'],
        d: 'El núcleo se divide en capas; cada una solo usa los servicios de la capa inferior a través de una interfaz definida.', pro: 'Fácil de depurar: se verifica capa por capa.', con: 'Es difícil decidir el orden de las capas, y cruzarlas todas resta rendimiento.', crash: 1 },
      mon: { n: 'Monolítico', ej: 'Linux, FreeBSD, OpenBSD, Solaris', k: ['Sistema de archivos', 'Controladores', 'Pila de red', 'Gestión de memoria', 'Planificador', 'Comunicación entre procesos'], u: ['Aplicaciones'],
        d: 'Toda la funcionalidad del sistema operativo se ejecuta dentro del núcleo, en modo privilegiado.', pro: 'Muy rápido: los componentes se llaman entre sí directamente.', con: 'Un fallo en cualquier componente (por ejemplo un controlador) puede tumbar todo el sistema.', crash: 1 },
      mic: { n: 'Microkernel', ej: 'QNX, MINIX 3, ThreadX, Fuchsia', k: ['Planificador', 'Comunicación entre procesos', 'Gestión de memoria básica'], u: ['Aplicaciones', 'Servidor de archivos', 'Controladores', 'Servidor de red'],
        d: 'En el núcleo queda solo lo mínimo. El resto son procesos de usuario que se comunican mediante paso de mensajes.', pro: 'Fiable y seguro: un servicio que falla se reinicia sin afectar al resto.', con: 'Más lento, por el coste de tantos mensajes entre procesos.', crash: 0 },
      mod: { n: 'Modular / híbrido', ej: 'Linux (módulos), Windows actuales, macOS', k: ['Planificador', 'Gestión de memoria', 'Comunicación entre procesos', 'Módulo: sistema de archivos', 'Módulo: controladores', 'Módulo: pila de red'], u: ['Aplicaciones'],
        d: 'El núcleo tiene una parte central y módulos que se cargan y descargan en tiempo de ejecución. Los módulos se ejecutan dentro del núcleo.', pro: 'Flexible como un microkernel y casi tan rápido como un monolítico.', con: 'Los módulos siguen dentro del núcleo: uno defectuoso puede tumbar el sistema.', crash: 1 }
    };
    let cur = 'mon';
    const dia = h('div', { class: 'lanes' }), info = h('div'), msg = h('div', { class: 'note' });
    const draw = () => {
      const t = T[cur]; dia.innerHTML = ''; msg.className = 'note'; msg.textContent = 'Pulsa el botón para ver qué pasa si un controlador (driver) tiene un error.';
      if (t.all) dia.append(h('div', { class: 'zoneK' }, h('small', null, 'Un único espacio, sin protección'), t.all.map(x => h('div', { class: 'node' }, x))));
      else dia.append(h('div', { class: 'zoneU' }, h('small', null, 'Espacio de usuario'), t.u.map(x => h('div', { class: 'node' }, x))),
        h('div', { class: 'zoneK' }, h('small', null, 'Espacio del núcleo'), t.k.map(x => h('div', { class: 'node' }, x))));
      info.innerHTML = `<p>${t.d}</p><p><b class="ok">Ventaja:</b> ${t.pro}</p><p><b class="bad">Inconveniente:</b> ${t.con}</p><p><b>Ejemplos:</b> ${t.ej}</p>`;
    };
    const fail = () => {
      draw(); const t = T[cur];
      const ns = [...dia.querySelectorAll('.node')], drv = ns.find(n => /ontrolador/.test(n.textContent));
      if (t.crash) { ns.forEach(n => n.classList.add('crash')); msg.className = 'note bad'; msg.innerHTML = '<b>Caída total.</b> El controlador se ejecuta en el mismo espacio que el resto del sistema, así que su error lo arrastra todo (pantalla azul o <i>kernel panic</i>).'; }
      else { drv.classList.add('crash'); msg.className = 'note ok'; msg.innerHTML = '<b>Fallo aislado.</b> El controlador es un proceso de usuario: solo cae él. El microkernel lo reinicia y el resto del sistema ni se entera.'; }
    };
    const bar = h('div', { class: 'row' }, Object.keys(T).map(k => btn(T[k].n, e => { cur = k; [...bar.children].forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); draw(); }, k === cur ? 'on' : '')));
    el.append(panel('¿Qué va dentro del núcleo?', 'Elige una estructura para ver dónde se ejecuta cada pieza.', bar, h('div', { class: 'gap' }),
      h('div', { class: 'grid2' }, dia, h('div', null, info, btn('Provocar fallo en un controlador', fail, 'pri'), msg))));
    draw();
  }
});
