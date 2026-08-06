# Prompt de implementación — Huerta de Mangos

> Prompt autocontenido para que una IA implemente el juego completo. Generado del spec aprobado el 2026-08-05.

---

Crea un juego móvil 2D estilo **arcade idle** (como los anuncios jugables de Township) llamado **"Huerta de Mangos"**. Entrega **un solo archivo `index.html` autocontenido**: HTML5 + canvas + JavaScript vanilla (clases), **sin dependencias externas ni build step**, optimizado para pantalla vertical de celular y funcional en PC. **Todo el texto del juego en español.**

## Personaje

El protagonista es **Kiosa**, la mascota de la marca: joven agricultor alegre, estilo caricatura plana, que **siempre lleva una gorra con un logotipo de mango** (óvalo naranja con hojita verde), camisa de color y animación de caminado con bamboleo. NO lleva sombrero de paja.

## Controles

- **Táctil:** joystick virtual que aparece donde el jugador apoya el dedo (arrastrar para mover), dibujado como base + perilla semitransparentes.
- **PC:** WASD y flechas.
- Sin botones de acción: **todo ocurre por proximidad** (acercarse a un árbol cosecha, pararse en la zona de venta vende, pararse en un círculo de compra paga).

## Mapa (corredor vertical)

Mundo lógico de 720×1280, **más grande que la pantalla**, con cámara que sigue al jugador con suavizado (y se centra si la vista es mayor que el mundo):

- **Arriba:** huerta de MANGOS (activa desde el inicio, 5 árboles).
- **Zona media izquierda:** huerta de NARANJAS (bloqueada, 3 árboles).
- **Zona media derecha:** parche de SANDÍAS (bloqueado, 3 plantas rastreras a ras de suelo — las sandías crecen en el piso, no en árboles).
- **Centro-abajo:** mostrador de madera con letrero **"VENDER"**.
- **Abajo:** tres círculos de mejora en el piso: **"+1 ÁRBOL"**, **"MOCHILA +5"**, **"AYUDANTE"**.
- Camino de tierra conectando huertas → venta → círculos; cercas de madera alrededor de cada huerta.
- Zonas bloqueadas: en gris, cercadas, con candado 🔒 y letrero **"Cumple el reto"**.

## Mecánicas (números exactos)

**Movimiento:** velocidad base 180 px/s; cada fruta cargada resta 1% de velocidad, con piso del 60% (a tope de 40 frutas).

**Recolección:** radio ~60 px; toma 1 fruta cada 0.15 s, una por una, apilándolas en una **torre sobre la espalda que se bambolea proporcionalmente a su altura** al caminar. Cada árbol muestra hasta 3 frutas visibles como puntos de color y regenera 1 cada 2 s; hace **"pop"** (escala rápida con decaimiento) al soltar fruta. Capacidad inicial: 10; al llegar al tope aparece **"¡LLENO!"** sobre la cabeza.

**Venta:** al pararse en la zona VENDER descarga 1 fruta cada 0.12 s; cada una genera un texto flotante **"+$X" verde con contorno blanco** y suma al contador de dinero siempre visible arriba.

**Círculos de mejora:** al pararse encima, el dinero **se drena de forma continua** (precio completo en ~1.5 s si hay fondos) con **anillo de progreso** alrededor del círculo. Si el jugador se sale a medio pago, **el progreso se conserva**. Al completarse: compra + confeti + sonido.

- **"+1 ÁRBOL":** $50 inicial, +35% por compra (redondeado). Agrega una planta a la huerta desbloqueada más reciente (árbol o rastrera según esa huerta), en posiciones predefinidas libres; si no quedan posiciones, muestra "MÁX".
- **"MOCHILA +5":** $80 inicial, +60% por compra; tope de capacidad 40 (luego "MÁX").
- **"AYUDANTE":** primero $250, segundo $500; máximo 2 (luego "MÁX"). NPC granjero con camisa de color distinto por ayudante, camina al 70% de la velocidad base, carga hasta 6 frutas. Máquina de estados: ir a la huerta desbloqueada con frutas más cercana → cosechar → ir a VENDER → vender → repetir.

## Retos y desbloqueos

Banner de reto activo **siempre visible** arriba al centro, con barra de progreso. Secuencia:

1. **"Vende 25 mangos"** → desbloquea NARANJAS.
2. **"Gana $500 en total"** (dinero acumulado histórico) → desbloquea SANDÍAS.
3. **"Contrata un ayudante"**.
4. **"Vende 150 frutas en total"** → mensaje grande **"¡Huerta completa!"** + confeti masivo y modo libre (el banner pasa a "Modo libre").

Al desbloquear una zona: confeti en la zona, la cerca gris y el candado se desvanecen con animación, y los árboles aparecen con frutas listas (pop).

**Sistema extensible:** cada fruta se define SOLO con datos en un arreglo `FRUITS` — `{ id, nombre, precio, tipoPlanta: 'arbol'|'rastrera', colores, zona, posiciones, posicionesExtra }` — de modo que agregar papaya, guayaba o piña sea añadir un objeto sin tocar lógica.

## Economía

- Mango: **$6** · Naranja: **$11** · Sandía: **$20** (cada fruta nueva vale más, para que desbloquear se sienta premio).

## Estilo visual

Colores planos y alegres tipo caricatura móvil: pasto verde brillante (con franjas sutiles), caminos de tierra, cercas de madera, árboles de copa redonda en dos tonos de verde con frutas como puntos de color. Personaje simple de formas básicas (cabeza redonda, gorra roja con logo de mango, camisa, piernas que alternan al caminar, sombra elíptica). HUD con **píldoras redondeadas oscuras** semitransparentes: 💰 dinero (arriba-izquierda), 🎒 carga x/capacidad (arriba-derecha), banner de reto (arriba-centro), botones discretos 🔊/🔇 (silencio) y ↺ (reinicio con `confirm()` en español).

## Juice (imprescindible)

- Pop de árboles al soltar fruta; bamboleo de la pila proporcional a la altura.
- Confeti al completar compras y retos; sacudida sutil de cámara al completar reto.
- Textos flotantes de dinero verdes con contorno blanco que suben y se desvanecen.
- Tutorial mínimo con hints contextuales que aparecen solo cuando aplican, no vuelven una vez cumplidos y se guardan en el save: **"Camina hacia los árboles"** (con flecha al árbol más cercano) → **"Lleva la pila a VENDER"** → **"Párate en un círculo para mejorar"**.

## Audio

Efectos generados con **WebAudio** (sin archivos): pop al cosechar (tono con variación aleatoria), "cha-ching" de dos notas al vender, fanfarria corta de 4 notas al completar retos/compras. El `AudioContext` se inicializa/reanuda en el primer gesto del usuario. Botón de silencio persistente.

## Persistencia

Guardado automático en `localStorage` (cada ~3 s, al comprar, al completar retos y en `visibilitychange`): dinero, dinero total ganado, ventas totales y por fruta, capacidad, mejoras compradas, árboles extra, ayudantes, reto actual, progreso parcial de pagos, hints vistos y silencio. Botón ↺ pide confirmación, borra el save y recarga.

**Robustez:** si `localStorage` no está disponible (modo privado), el juego corre sin guardar y sin errores; si el save está corrupto o es de otra versión, se descarta y se inicia partida nueva; usa una clave con versión (p. ej. `huertaMangos.v1`).

## Arquitectura y calidad

- Game loop con `requestAnimationFrame` y delta-time acotado (máx 0.05 s); canvas escalado con `devicePixelRatio` (tope 2) y `resize` reactivo; `touch-action: none` y sin selección de texto.
- Código organizado en secciones/clases: `CONFIG` (todas las constantes de balance juntas), `FRUITS`, `CHALLENGES`, `Player`, árboles, `Helper`, zonas/círculos, retos, HUD, partículas (confeti + flotantes), `SFX`, guardado, input, loop.
- Expón un objeto global `game` con acceso al estado y un helper `game.dinero(n)` para sumar dinero desde consola (facilita probar el balance).
- Sin dependencias, sin imágenes externas ni fuentes remotas: todo dibujado con canvas y emojis del sistema.

## Criterios de aceptación

1. En un celular vertical se juega completo con un dedo; en PC con WASD/flechas.
2. El bucle cosechar → vender → mejorar → reto → desbloquear funciona de inicio a fin hasta "¡Huerta completa!" y modo libre.
3. Recargar la página conserva el progreso; el reinicio lo borra tras confirmar.
4. Sin errores en consola durante una partida completa.
5. Agregar una fruta nueva requiere únicamente añadir un objeto al arreglo `FRUITS`.
