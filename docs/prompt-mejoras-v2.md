# Prompt de mejoras v2 — Kiosa: el imperio de las huertas

> Prompt autocontenido para que una IA implemente la versión 2 del juego. Parte del `index.html` v1 ya existente (adjúntalo junto con este documento). Generado el 2026-08-05.

---

Actúa como un desarrollador senior experto en juegos HTML5/canvas, game feel, rendimiento en móviles de gama baja y juegos hypercasual. Te entrego el archivo `index.html` de la versión 1 de **"Kiosa: el imperio de las huertas"**, un juego arcade idle 2D en un solo archivo (canvas + JS vanilla, sin dependencias). Tu tarea es entregar la **versión 2 completa y terminada**.

**No me hagas ninguna pregunta.** Toda decisión que no esté especificada aquí tómala tú con el mejor criterio de la industria y sigue adelante. No entregues fragmentos, pseudocódigo ni placeholders (nada de `// aquí iría...`): entrega cada archivo completo y funcional de principio a fin. Todo el código nuevo debe respetar el estilo del v1: `"use strict"`, clases, secciones numeradas con comentarios de banda, constantes de balance agrupadas en `CONFIG`, y contenido definido por datos en arreglos.

## Qué es el juego hoy (v1)

Corredor vertical de 720×1280 con cámara que sigue al jugador. Kiosa (agricultor con gorra con logo de mango) se mueve con joystick táctil o WASD/flechas. **Todo ocurre por proximidad, sin botones de acción:** acercarse a una planta cosecha 1 fruta cada 0.15 s dentro de 60 px, pararse en el mostrador VENDER descarga 1 fruta cada 0.12 s, y pararse en un círculo de mejora drena dinero de forma continua (precio completo en 1.5 s) con anillo de progreso que conserva el pago parcial si te sales.

Hay 3 frutas definidas por datos en `FRUITS` (mango $6, naranja $11, sandía $20), 3 círculos de mejora (+1 ÁRBOL, MOCHILA +5, AYUDANTE), 4 retos en cadena, ayudantes NPC con máquina de estados cosechar↔vender, confeti, textos flotantes, sonidos WebAudio generados, guardado en `localStorage` y un objeto global `game` para depurar.

## Objetivo de la v2

Cuatro metas, en orden de importancia:

1. **Que mucha gente pueda jugarlo de verdad**: que corra bien en celulares modestos, esté en varios idiomas, sea fácil de compartir e instalar, y enganche en el primer minuto.
2. **Meter tensión**: plagas que roban fruta y obligan a reaccionar. Hoy el juego no tiene ninguna fuente de dificultad.
3. **Mucho más contenido de retos**: 20 de campaña + opcionales + diarios.
4. **Que los retos se vean**: hoy viven en un banner chico que se ignora.

---

# PARTE A — Defectos actuales que debes corregir

Estos cuatro se detectaron probando el v1 en un viewport real de 390×844. Corrígelos todos.

**A1. La cámara recorta demasiado.** `view.scale` usa `Math.max(cw/460, ch/900)` (modo *cover*), así que en una pantalla de 390 px solo se ven 416 de los 720 px de ancho del mundo y los tres círculos de mejora nunca caben juntos: salen cortados por los lados.

*Regla nueva:* define una **banda segura central de 440 px** (x de 140 a 580). Todos los elementos que el jugador necesita ver **como grupo** —los círculos de mejora y el mostrador VENDER— deben caber completos dentro de esa banda. Las huertas y los árboles sí pueden usar los 720 px completos, porque a esos caminas de uno en uno. Además: cuando el jugador entre a la zona de mejoras (y > 1330), la cámara debe fijar `cam.x` al centro para encuadrar las dos filas de círculos completas.

**A2. El HUD tapa la huerta activa.** Al arrancar, las píldoras y el banner cubren el 30% superior de la pantalla, justo la franja donde asoman los mangos, que son lo único jugable al inicio.

*Regla nueva:* la cámara debe centrar al jugador al **58% de la altura de pantalla**, no al 50%, para dejar aire arriba. El HUD lleva un modo compacto: si `ch < 700`, reduce alturas y tipografías un 15%.

**A3. Los globos de tutorial se encinan con los letreros del mundo.** El globo "Camina hacia los árboles" se monta sobre el letrero VENDER y lo vuelve ilegible.

*Regla nueva:* antes de dibujar un globo de hint, comprueba solapamiento con los rectángulos de los letreros del mundo y de las píldoras del HUD; si se cruzan, desplaza el globo verticalmente hasta que no se crucen.

**A4. El arranque es confuso.** El jugador nace en (360, 700), pegado al mostrador, y la pantalla la dominan dos zonas grises bloqueadas.

*Regla nueva:* el jugador nace **dentro de la huerta de mangos**, en (360, 360), rodeado de árboles con fruta lista. Ver fruta y cosechar debe pasar en los primeros 3 segundos.

---

# PARTE B — Plagas (la fuente de tensión)

Nueva entidad `Plaga`: un pájaro de caricatura que baja a un árbol y se come la fruta madura. Es el corazón de la v2.

## Comportamiento

Máquina de tres estados:

- **`volando`** — aparece fuera del borde del mundo por un lado aleatorio y vuela a 260 px/s hacia una planta objetivo elegida al azar entre las que tienen fruta. Alas aleteando, sombra en el suelo que la sigue.
- **`comiendo`** — aterriza, espera **1.2 s de gracia** (tu ventana para reaccionar) y luego se come **1 fruta cada 2.5 s**. Si deja la planta en cero, esa planta queda **marchita 15 s**: se dibuja caída y descolorida y **no regenera** en ese tiempo.
- **`huyendo`** — sale volando hacia el borde más cercano y se elimina.

## Cómo se espanta

Basta **acercarse a 70 px**, coherente con el resto del juego: sin botones. Al espantarla: puff de plumas, sonido corto, `+1` al contador `plagasEspantadas` y un flotante amarillo **"¡Fuera!"**.

Los **ayudantes también espantan** plagas que pasen a menos de 70 px de ellos, pero no las persiguen. Eso les da valor defensivo además del económico.

## Aparición y escalado

| Constante | Valor |
|---|---|
| `PLAGA_INTERVALO_BASE` | 18 s |
| `PLAGA_INTERVALO_MIN` | 7 s |
| Reducción por capítulo completado | −1.5 s |
| `PLAGA_MAX_SIMULTANEAS` | `1 + capítulo`, tope 4 |
| `PLAGA_VEL` | 260 px/s |
| `PLAGA_GRACIA` | 1.2 s |
| `PLAGA_MORDIDA` | 2.5 s por fruta |
| `PLAGA_RADIO_ESPANTO` | 70 px |
| `PLAGA_MARCHITA` | 15 s |

**Las plagas no aparecen hasta que se completa el reto 1.** El tutorial no se debe pisar con una amenaza.

## Que se vean aunque estén fuera de pantalla

Como la cámara no abarca todo el mundo, una plaga puede estar robando sin que la veas. Es obligatorio:

- Un **marcador de alerta en el borde de la pantalla** apuntando hacia cada plaga fuera de vista: triángulo rojo pulsante con un 🐦, colocado sobre el borde en la dirección correcta.
- Un **globo "!"** rebotando sobre la planta afectada, visible en el mundo.
- Un **pulso rojo sutil en el marco de la pantalla** mientras haya al menos una plaga comiendo.
- Sonido de alerta corto y discreto al aterrizar una plaga (dos notas descendentes), respetando el mute.

---

# PARTE C — Contenido nuevo

## C1. Dos frutas más

Añádelas **solo como objetos del arreglo `FRUITS`**, sin tocar lógica —esa es la prueba de que el sistema de datos funciona.

| Fruta | Precio | Tipo | Zona |
|---|---|---|---|
| Papaya | $34 | árbol | x44 y758 w292 h292 |
| Piña | $55 | rastrera | x384 y758 w292 h292 |

- **Papaya** — posiciones `[112,852] [268,830] [188,972]`, extras `[96,1012] [300,982] [240,912] [142,792]`. Copa verde amarillenta, fruta naranja-amarilla alargada.
- **Piña** — posiciones `[452,854] [612,840] [532,974]`, extras `[424,986] [650,982] [542,790] [470,918]`. Rastrera con hojas puntiagudas en roseta, fruta ovalada dorada con retícula.

## C2. Mapa ampliado

El mundo crece a **720 × 1620** (el ancho no cambia). Distribución vertical:

| Franja | y | Contenido |
|---|---|---|
| Mangos | 48–414 | 5 árboles (sin cambios) |
| Naranjas / Sandías | 440–732 | 3 + 3 (sin cambios) |
| Papayas / Piñas | 758–1050 | 3 + 3 (nuevas) |
| Mostrador VENDER | 1090–1288 | letrero en 1090–1156, zona pisable 1170–1288, centro (360, 1229) |
| Círculos fila A | y = 1380 | +1 ÁRBOL (x 195) · MOCHILA +5 (x 360) · AYUDANTE (x 525) |
| Círculos fila B | y = 1520 | RIEGO (x 277) · ESPANTAPÁJAROS (x 443) |

Radio de los círculos: **52 px**. Con eso la fila A ocupa de x=143 a x=577, dentro de la banda segura de 440 px. Redibuja los caminos de tierra para conectar mangos → zonas medias → zonas nuevas → VENDER → las dos filas de círculos.

## C3. Cinco mejoras

| Círculo | Precio | Tope | Efecto |
|---|---|---|---|
| **+1 ÁRBOL** 🌳 | $50 × 1.35ⁿ | 13 compras | Agrega planta a la huerta desbloqueada más reciente |
| **MOCHILA +5** 🎒 | $80 × 1.6ⁿ | capacidad 40 | +5 de capacidad |
| **AYUDANTE** 🧑‍🌾 | $250 / $500 / $900 | 3 | NPC que cosecha, vende y espanta plagas |
| **RIEGO** 💧 | $400 × 2.0ⁿ | 4 niveles | Regeneración global: 2.0 → 1.7 → 1.45 → 1.23 → 1.05 s |
| **ESPANTAPÁJAROS** 🪧 | $600 × 1.8ⁿ | 3 | Ver abajo |

**Espantapájaros:** cada compra planta uno en la huerta desbloqueada más reciente que no tenga; si todas tienen, "MÁX". Efecto: las plagas descartan esa zona como objetivo el **70%** de las veces, y si una aterriza ahí igual, el espantapájaros la espanta solo a los **6 s**. Se dibuja en el mundo como un poste con camisa y sombrero, meciéndose.

**Corrige de paso un problema heredado del v1:** hoy `+1 ÁRBOL` siempre planta en la huerta más reciente, así que al desbloquear una zona nueva pierdes para siempre los cupos de las anteriores. En la v2, el círculo debe plantar en la **huerta desbloqueada con cupos libres que tenga menos plantas**, de modo que ningún cupo se pierda, y solo mostrar "MÁX" cuando **todas** estén llenas.

---

# PARTE D — Sistema de retos

Tres carriles simultáneos. Toda la definición vive en datos, igual que `FRUITS`.

## D1. Campaña: 20 retos en 5 capítulos

Cada reto lleva `{ id, capitulo, texto, meta, progreso(state), recompensa, desbloquea? }`. La recompensa se paga en dinero al completarlo.

**Capítulo 1 — Primeros brotes** ($100 cada uno)
1. Vende 25 mangos → **desbloquea naranjas**
2. Espanta 5 plagas
3. Gana $500 en total → **desbloquea sandías**
4. Compra tu primera mejora

**Capítulo 2 — La huerta crece** ($300 cada uno)
5. Contrata un ayudante
6. Vende 150 frutas en total
7. Ten 12 plantas al mismo tiempo
8. Gana $2 000 en total → **desbloquea papayas**

**Capítulo 3 — Defiende la cosecha** ($700 cada uno)
9. Espanta 25 plagas
10. Compra un espantapájaros
11. Aguanta 3 minutos sin que se marchite ninguna planta
12. Vende 100 naranjas

**Capítulo 4 — Imperio en marcha** ($1 500 cada uno)
13. Contrata el segundo ayudante
14. Sube la mochila a 25
15. Gana $8 000 en total → **desbloquea piñas**
16. Vende 60 sandías

**Capítulo 5 — El imperio** ($3 000 cada uno)
17. Ten 20 plantas al mismo tiempo
18. Vende 40 papayas
19. Espanta 60 plagas
20. Vende 1 000 frutas en total → **"¡Imperio completo!"** + confeti masivo + modo libre

## D2. Opcionales: 8, sin orden

Visibles siempre, se completan cuando se cumplan.

| Reto | Recompensa |
|---|---|
| Llena la mochila a tope y véndela completa sin parar | $150 |
| Espanta 3 plagas en 10 segundos | $200 |
| Ten $1 000 de saldo al mismo tiempo | $250 |
| Cosecha 500 frutas en total | $300 |
| Compra 10 árboles | $400 |
| Sube la mochila al máximo (40) | $500 |
| Ten 2 ayudantes y 15 plantas a la vez | $600 |
| Desbloquea las 5 huertas | $1 000 |

## D3. Diarios: 3 al día, de un pozo de 10

Se eligen de forma **determinista a partir de la fecha local** (`YYYY-MM-DD` como semilla), de modo que todos los jugadores del mismo día tengan los mismos. Al cambiar el día se reinician progreso y cobro. Recompensas por ranura: **$200 / $350 / $500**.

Pozo: vende 60 frutas hoy · espanta 15 plagas hoy · gana $1 200 hoy · cosecha 100 frutas hoy · vende 20 naranjas hoy · compra 2 mejoras hoy · vende 10 sandías hoy · aguanta 2 minutos sin marchitas · vende 5 papayas hoy · llena la mochila 5 veces hoy.

## D4. Que se vean (esto es requisito, no adorno)

- **Lista permanente en pantalla**, arriba bajo el HUD: hasta **3 filas compactas** con barra de progreso — el reto de campaña actual, el opcional más cerca de completarse y el diario más cerca. Cada fila: ícono, texto corto, barra y `12/25`.
- **Banner de capítulo** con el nombre del capítulo y `Reto 7 de 20`.
- **Panel completo de retos** que se abre tocando la lista o el botón 📋: overlay que atenúa el fondo (el juego sigue corriendo) con tres pestañas —Campaña, Opcionales, Diarios—, cada una con tarjetas de progreso, recompensa y palomita en las cumplidas. Se cierra tocando fuera o la ✕.
- **Toast** cuando un reto cruza el 50% ("Vas a la mitad") y cuando se completa (tarjeta que entra desde arriba con el nombre y la recompensa, 2.2 s).
- **La barra del reto actual parpadea** en verde cuando le falta menos del 10%.

---

# PARTE E — Alcance: que lo pueda jugar mucha gente

## E1. Rendimiento en celulares modestos

El v1 redibuja todo el fondo cada frame: pasto con dos bucles anidados, 70 rectángulos de textura en los caminos, todas las cercas y rótulos. Es el mayor desperdicio del juego.

- **Fondo pre-renderizado**: dibuja pasto, caminos, bases de zonas, cercas y rótulos **una sola vez** en un canvas fuera de pantalla del tamaño del mundo, y en cada frame solo haz `drawImage` de la porción visible. Rehazlo únicamente cuando se desbloquee una zona o se plante un espantapájaros.
- **Calidad adaptativa**: mide el tiempo medio de frame en ventanas de 90 frames. Si supera **22 ms**, baja a modo bajo (`devicePixelRatio` forzado a 1, confeti máximo 60, sin sombras suaves). Si baja de **14 ms** durante 180 frames, sube de nuevo. Nunca oscilar más de una vez cada 5 s.
- **Tope de partículas**: 240 confetis simultáneos con reciclaje por pool; descarta las que quedan fuera de la vista.
- **Cachea los anchos de texto** del HUD en vez de llamar `measureText` cada frame.
- **Pools de objetos** para plagas y flotantes: nada de crear y descartar objetos por frame.
- Objetivo medible: **55+ FPS estables** en un móvil de gama media y sin fugas de memoria en 10 minutos de juego continuo.

## E2. Idiomas

Objeto `I18N` con **español (por defecto), inglés y portugués**. Cada texto del juego pasa por `t('clave')` — no debe quedar ni una cadena suelta en el código de dibujo. Detección automática con el prefijo de `navigator.language`, con respaldo a español. Botón 🌐 en el HUD que cicla idioma, guardado en el save. Cuida que los textos más largos (alemán no aplica, pero el portugués sí crece) no rompan los anchos: mide y reduce tipografía si no cabe.

## E3. Compartir e instalar

Estos archivos son **adicionales**; `index.html` debe seguir siendo jugable por sí solo aunque falten.

- **`manifest.webmanifest`** — `name`, `short_name: "Kiosa"`, `start_url: "."`, `display: "standalone"`, `orientation: "portrait"`, `theme_color: "#2f8f3d"`, `background_color: "#16241a"`, íconos 192 y 512.
- **`sw.js`** — service worker cache-first con nombre de caché versionado (`kiosa-v2`), `skipWaiting` + `clients.claim`, y limpieza de cachés viejos al activar. Regístralo solo si `location.protocol === 'https:'`, dentro de `try/catch`.
- **Etiquetas Open Graph y Twitter Card** en el `<head>`, con URL absoluta `https://kiosa7.github.io/kiosa-el-imperio-de-las-huertas/og.png`, título, descripción y `og:image:width/height` 1200×630.
- **`iconos.html`** — página auxiliar que dibuja en canvas y descarga los tres PNG que faltan: `icon-192.png`, `icon-512.png` y `og.png` (1200×630, con Kiosa, el nombre del juego y una huerta de fondo). Así se generan sin depender de imágenes externas.
- **Botón de compartir 📤** en el HUD: usa `navigator.share` si existe; si no, copia el enlace con `navigator.clipboard.writeText` y muestra un toast "Enlace copiado". Comparte con el texto del récord: *"Llevo $X y N frutas vendidas en Kiosa: el imperio de las huertas"*.

## E4. Enganchar en el primer minuto

- Nacer entre los mangos (ver A4), con árboles llenos.
- **Sin plagas hasta completar el reto 1.**
- Cuarto hint nuevo, encadenado tras los tres actuales: **"¡Corre, espanta la plaga!"** con flecha a la plaga, la primera vez que aparezca una.
- La primera venta debe dar un flotante más grande y una fanfarria corta: el primer dinero tiene que sentirse.
- Los tres primeros retos ya son cortos a propósito; no los alargues.

---

# PARTE F — Persistencia

Sube la clave a **`kiosaImperio.v2`** con `SAVE_VERSION: 2`.

**Migración desde v1:** si existe `kiosaImperio.v1` y no hay save v2, conserva dinero, dinero total, ventas totales y por fruta, capacidad, compras, plantas extra y ayudantes; recalcula el estado de retos desde esos números; borra la clave v1 al terminar.

Campos nuevos a guardar: `plagasEspantadas`, `retosCampana` (índice + ids cumplidos), `opcionalesCumplidos`, `diarios { fecha, ids, progreso, cobrados }`, `idioma`, `nivelRiego`, `espantapajaros` (zonas), `hints`, `mute`, `calidad`.

Mantén toda la robustez del v1 y no la aflojes: probar que `localStorage` funciona antes de usarlo, correr sin guardar si no está disponible, descartar saves corruptos o de otra versión, y **sanear cada campo al cargar** con `num()` y `clamp()` para que un save manipulado no pueda meter valores imposibles.

---

# PARTE G — Arquitectura

- Mantén la organización en secciones numeradas y agrega las nuevas: `I18N`, `Plaga`, `Espantapajaros`, `RETOS` (campaña/opcionales/diarios), `PanelRetos`, `Rendimiento`, `Compartir`.
- **Todo el balance en `CONFIG`.** Ningún número mágico disperso en la lógica.
- Amplía el objeto global `game` con: `game.plagas`, `game.spawnPlaga()`, `game.completarReto(id)`, `game.idioma('en')`, `game.calidad('bajo'|'alto')` y `game.fps()`. Deja intactos `game.dinero(n)`, `game.desbloquear(id)`, `game.guardar()` y `game.reiniciar()`.
- Sigue sin dependencias, sin build, sin imágenes ni fuentes remotas: todo dibujado en canvas y emojis del sistema.
- Delta-time acotado a 0.05 s y `requestAnimationFrame`, como hoy.

---

# Criterios de aceptación

Repásalos mentalmente antes de entregar y verifica que tu código los cumple todos.

1. En un celular vertical de 390×844 se ven **las dos filas de círculos completas** cuando el jugador está en la zona de mejoras, y el HUD no tapa la huerta al arrancar.
2. Aparece una plaga, se lleva fruta si la ignoras, deja la planta marchita 15 s, y se espanta acercándose. Si está fuera de pantalla, un marcador en el borde te dice dónde.
3. Los 20 retos de campaña, los 8 opcionales y los 3 diarios progresan, pagan recompensa y se ven en la lista permanente y en el panel completo.
4. El juego se puede terminar de principio a fin hasta **"¡Imperio completo!"** y modo libre.
5. Cambiar a inglés o portugués traduce **todos** los textos, sin cadenas sueltas ni desbordes.
6. Recargar conserva el progreso; un save v1 existente se migra sin perder dinero ni compras; el reinicio borra tras confirmar.
7. Sin errores en consola durante una partida completa, y 55+ FPS sostenidos en gama media.
8. Agregar una fruta nueva sigue requiriendo únicamente añadir un objeto al arreglo `FRUITS`.

# Reglas de entrega

- Entrega **`index.html` completo** más los archivos auxiliares `manifest.webmanifest`, `sw.js` e `iconos.html`, cada uno en su propio bloque de código, listos para guardar y abrir.
- `index.html` debe funcionar solo, aunque falten los auxiliares.
- Sin pasos de instalación ni instrucciones largas.
- No preguntes nada ni pidas confirmación: si algo es ambiguo, decide tú y entrega.
