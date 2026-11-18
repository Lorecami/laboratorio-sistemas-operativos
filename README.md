# Laboratorio de Sistemas Operativos

Material didáctico interactivo para la asignatura de Sistemas Operativos: un tablero (dashboard) con **20 temas**, cada uno con un simulador, una animación o un juego, basado en los [Apuntes de Sistemas Operativos](https://ull-esit-sistemas-operativos.github.io/ssoo-apuntes/).

**Autora:** Camila Vivas · **Asignatura:** Sistemas Operativos

## Cómo abrirlo

No hay que instalar nada. Está hecho solo con HTML, CSS y JavaScript, sin librerías externas.

1. Clonar o descargar el repositorio:
   ```
   git clone https://github.com/Lorecami/laboratorio-sistemas-operativos.git
   ```
2. Abrir el archivo `index.html` con cualquier navegador (doble clic).

Funciona sin conexión a Internet. Internet solo se necesita para abrir los enlaces a los apuntes originales.

## Contenido

| N.º | Tema | Qué incluye |
|---|---|---|
| 1 | Definiciones | Capas de un sistema informático y puntos de vista del usuario y del sistema |
| 2 | Tipos de sistemas | Uso de la CPU en lotes, multiprogramación y tiempo compartido; juego de clasificar |
| 3 | Historia | Línea de tiempo interactiva con las cinco generaciones |
| 4 | Componentes | Qué componentes participan en acciones cotidianas |
| 5 | Servicios | Juego de arrastrar y soltar: servicios al usuario y al sistema |
| 6 | Interfaz de programación | El viaje de una llamada al sistema, paso a paso (POSIX y Windows API) |
| 7 | Operación del sistema | Interrupciones, excepciones, modo dual y temporizador |
| 8 | Sistemas por su estructura | Monolítico, capas, microkernel y modular, con simulación de un fallo |
| 9 | Procesos | Diagrama de estados y bloque de control de proceso (PCB) |
| 10 | Planificación de la CPU | Simulador FCFS, SJF, SRTF, Round Robin y prioridades, con 1 a 4 núcleos y diagrama de Gantt |
| 11 | Paso de mensajes | Emisor, buzón y receptor, con bloqueos |
| 12 | Memoria compartida | Productor y consumidor sobre un búfer circular |
| 13 | Hilos | Qué comparten los hilos y modelos de hilos |
| 14 | Sincronización | Condición de carrera y mutex, instrucción por instrucción |
| 15 | Memoria principal | Asignación contigua, fragmentación externa y compactación |
| 16 | Paginación | Traductor de dirección lógica a dirección física |
| 17 | Memoria virtual | Reemplazo de páginas: FIFO, LRU y Óptimo |
| 18 | Almacenamiento secundario | Simulador de RAID 0, 1, 5 y 6 con avería de discos |
| 19 | Sistemas de archivos | Rutas absolutas y relativas en un árbol de directorios; permisos POSIX |
| 20 | Implementación de sistemas de archivos | Asignación contigua, enlazada e indexada; comparación de algoritmos de planificación de disco |

Cada tema incluye además una sección **«Cómo explicarlo en clase»** con un guion breve. En la barra superior hay un cronómetro de 5 minutos para ensayar la presentación y un botón para cambiar entre tema claro y oscuro.

## Estructura de archivos

```
index.html              Página principal
css/styles.css          Estilos
js/core.js              Navegación y componentes reutilizables
js/intro.js             Temas 1 a 3
js/organizacion.js      Temas 4 a 8
js/procesos.js          Temas 9 a 14
js/memoria.js           Temas 15 a 17
js/almacenamiento.js    Temas 18 a 20
```

## Nota

El desarrollo se apoyó en herramientas de inteligencia artificial, como permite la consigna de la actividad.
