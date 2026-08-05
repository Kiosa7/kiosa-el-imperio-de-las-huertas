# Huerta de Mangos — Diseño del juego

**Fecha:** 2026-08-05 · **Estado:** aprobado en brainstorming, pendiente de plan de implementación

## Resumen

Juego móvil 2D estilo *arcade idle* (como los anuncios jugables de Township) protagonizado por **Kiosa**, la mascota de la marca. HTML5/canvas en **un solo archivo autocontenido** (`index.html`), sin dependencias externas, pantalla vertical, todo el texto en español. Bucle central: **cosechar → vender → comprar mejoras → cumplir retos → desbloquear frutas → repetir**. Sin botones de acción: todo ocurre por proximidad.

## Personaje

El protagonista **es Kiosa** (identidad de marca): joven agricultor con **gorra con logo de mango**, camisa de color, apariencia amigable estilo caricatura plana. Animación de caminado con bamboleo; la pila de frutas viaja en una torre sobre su espalda y se bambolea proporcionalmente a su altura.

## Plataforma y controles

- HTML5 canvas, optimizado para pantalla vertical de celular; funciona también en desktop.
- **Táctil:** joystick virtual que aparece donde el jugador pone el dedo (arrastrar para mover).
- **PC:** WASD y flechas.
- Cámara con seguimiento suave; el mundo es más grande que la pantalla.

## Mapa (Layout A — corredor vertical, elegido en companion visual)

- **Arriba:** huerta de mangos (activa desde el inicio).
- **Media:** huerta de naranjas (izquierda, bloqueada) y parche de sandías (derecha, bloqueado). Zonas bloqueadas: grises, cercadas, con candado y letrero "Cumple el reto".
- **Centro-abajo:** mostrador con zona "VENDER".
- **Abajo:** tres círculos de mejora: "+1 ÁRBOL", "MOCHILA +5", "AYUDANTE".

## Mecánicas y balance

Todos los números viven en un bloque `CONFIG` para ajuste fácil.

### Movimiento
- Velocidad base ~180 px/s; cada fruta cargada resta ~1% (a tope de 40 frutas: ~60% de velocidad).

### Recolección
- Radio de recolección ~60 px; toma 1 fruta cada 0.15 s, una por una, volando a la pila.
- Árboles: hasta 3 frutas visibles; regeneran 1 cada ~2 s; hacen "pop" (escala rápida) al soltar fruta.
- Capacidad inicial de carga: 10; al tope aparece "¡LLENO!" sobre la cabeza.
- Sandías: plantas rastreras a ras de suelo (parches de 2 frutas), misma lógica de respawn, distinto dibujo.

### Venta
- Zona "VENDER": descarga 1 fruta cada 0.12 s; cada una genera texto flotante "+$X" y el dinero vuela al contador del HUD (siempre visible arriba).

### Mejoras (círculos con drenado de dinero y anillo de progreso)
- El dinero se drena de forma continua al pararse encima (~precio completo en 1.5 s con fondos suficientes).
- Si el jugador se sale a medio pago, **el progreso se conserva** (el anillo queda donde iba).
- **"+1 ÁRBOL":** $50 inicial, +35% por compra; agrega un árbol a la huerta desbloqueada más reciente.
- **"MOCHILA +5":** $80 inicial, +60% por compra; tope de capacidad: 40.
- **"AYUDANTE":** $250; máximo 2. NPC que camina al 70% de la velocidad del jugador, carga 6 frutas, va a la huerta desbloqueada con frutas disponibles más cercana → vende → repite. Camisas de colores distintos para distinguirlos.

## Retos y desbloqueo de frutas

Banner de reto activo siempre visible con barra de progreso. Secuencia:

1. **"Vende 25 mangos"** → desbloquea huerta de NARANJAS.
2. **"Gana $500 en total"** → desbloquea parche de SANDÍAS.
3. **"Contrata un ayudante"**.
4. **"Vende 150 frutas en total"** → "¡Huerta completa!" + confeti grande y modo libre.

Al desbloquear: confeti, la cerca se abre con animación y los árboles aparecen con frutas listas.

### Sistema de frutas extensible

Cada fruta se define solo con datos; agregar papaya/guayaba/piña = añadir un objeto:

```js
{ id: 'mango', nombre: 'Mango', precio: 6, colores: {...},
  tipoPlanta: 'arbol' | 'rastrera', posiciones: [...], reto: {...} }
```

### Economía
- Mango: **$6** · Naranja: **$11** · Sandía: **$20**. Cada fruta nueva vale más que la anterior.

## Estilo visual

Colores planos y alegres tipo caricatura móvil: pasto verde brillante, caminos de tierra, cercas de madera, árboles de copa redonda con frutas como puntos de color. Textos flotantes de dinero en verde con contorno blanco. HUD de píldoras redondeadas oscuras: 💰 dinero (arriba-izq), 🎒 carga x/cap (arriba-der), banner de reto (arriba-centro), botones discretos 🔊/🔇 y reinicio en una esquina.

## Juice

- Pop de árboles al soltar fruta; bamboleo de pila proporcional a la altura.
- Confeti al completar compras y retos; vibración sutil de cámara al completar reto.
- Tutorial contextual de 3 hints que aparecen solo cuando aplican y no vuelven (persisten en el save): "Camina hacia los árboles" → "Lleva la pila a VENDER" → "Párate en un círculo para mejorar".

## Audio

Efectos generados con WebAudio (sin archivos): pop al cosechar (tono con variación aleatoria), "cha-ching" al vender, fanfarria corta en retos y compras. Botón de silencio en el HUD.

## Persistencia

Guardado automático en `localStorage`: dinero, mejoras compradas, árboles agregados, retos completados, hints vistos. Botón discreto de reinicio (con confirmación) borra el save.

## Arquitectura

Un `index.html` (~2,000 líneas) organizado en secciones:

| Sección | Responsabilidad |
|---|---|
| `CONFIG` | Constantes de balance + arreglo `FRUITS` (datos puros) |
| `Player` | Movimiento, carga, pila con bamboleo |
| `Tree` / planta | Respawn, pop, frutas visibles |
| `Helper` | Máquina de estados: ir-a-cosechar → ir-a-vender |
| `Zone` | Venta y círculos de compra (drenado + anillo) |
| `ChallengeSystem` | Retos secuenciales y desbloqueos |
| `HUD` | Píldoras, banner de reto, hints de tutorial |
| `Particles` | Confeti y textos flotantes |
| `SFX` | WebAudio generado, silencio |
| `Save` | localStorage (guardar/cargar/reiniciar) |
| Game loop | `requestAnimationFrame` + delta-time, cámara, input unificado |

JS vanilla con clases; sin build step ni dependencias.

## Manejo de errores

- `localStorage` inaccesible (modo privado): el juego corre sin guardar, sin romper.
- WebAudio bloqueado hasta gesto del usuario: el audio se inicializa en la primera interacción.
- Save corrupto o de versión vieja: se descarta y se inicia partida nueva.

## Pruebas

- El estado del juego se expone en un objeto global `game` para inspección/ajuste de balance desde consola.
- Verificación manual con checklist en móvil vertical y PC (controles, retos completos de inicio a fin, persistencia al recargar, reinicio).
- Sin suite automatizada: entregable de un solo archivo sin toolchain.

## Fuera de alcance (v1)

- Más frutas que mango/naranja/sandía (el sistema queda listo para agregarlas por datos).
- Skins de Kiosa, mejoras visuales de ropa por nivel (spec de marca, no de esta v1).
- Backend, ranking, monetización o integración con Kiosa Shop.
