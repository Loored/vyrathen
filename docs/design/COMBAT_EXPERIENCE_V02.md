# Combat Experience v0.2 — estado por acción y recursos sincronizados

Base: `c03c8b5702f947196b86ffa7bb30f7f256f66da2` (PR #7). La composición, iconos, controles y ritmo de 2500 ms de v0.1 están aprobados. Las barras, cifras actuales y consumo explícito de este incremento son candidatos a revisión del propietario. Sin sprites, audio, velocidades nuevas, dependencias ni VFX avanzados. Este PR no autoriza merge ni auto-merge.

## Contrato aditivo

`CombatResult.trace?: CombatTrace` es opcional y tiene su propia `version: 1`. No es la versión de la experiencia ni la del guardado: `SaveData.version` sigue siendo 1. No se añaden campos ni se cambian mensajes en los CombatEvent existentes. Se eligió un registro paralelo pequeño para mantener íntegra su proyección anterior y poder rechazar telemetría incompleta como una sola capacidad, sin mezclar fuentes.

| Campo | Contenido |
|---|---|
| `initial` | Diez entradas `{id, hp, mp}` copiadas antes de resolver acciones; máximos e identidad permanecen en los equipos existentes. |
| `events` | Una entrada por CombatEvent, mismo orden, sin ordenar de nuevo. |
| `eventId`, `sequence` | ID existente y posición global desde 1; correspondencia verificable. |
| `actorId`, `targetId` | IDs reales cuando existen, independientes de nombres duplicados. |
| `actionId` | ID estable local al resultado, generado sin RNG; resolución y consecuencia K.O. comparten ID. |
| `attempt` | Sólo en la resolución: `{kind: 'basic', mpSpent: 0}` o `{kind: 'power', power, mpSpent}`. `power` referencia exactamente el identificador string usado por el motor y Hero.power. |
| `changes` | Actor y objetivo con `{id, before: {hp,mp}, after: {hp,mp}}`, incluso si no variaron. Son copias numéricas, nunca Fighter ni referencias mutables a él. |
| `defeatedId` | Participante derrotado en el evento K.O. |

El motor captura los valores donde calcula la acción. El snapshot anterior se toma antes de descontar MP; el posterior se copia al emitir la resolución, incluso para miss/dodged. `mpSpent` es la diferencia efectiva del actor, sin consultar fórmulas desde la UI. blocked registra el intento real, que puede ser básico o poder. No se ejecutan habilidades que sólo existen en el catálogo.

El evento K.O. contiene IDs y `actionId`, pero **no attempt y changes vacío**: el daño y el consumo ya se registraron en la resolución anterior. skip sólo identifica al actor y no tiene acción, objetivo, intento ni cambios; info no identifica participantes ni fabrica acciones/costes. Los campos adicionales representan instrumentación de la simulación del remake, no recuperación del servidor histórico. `ruleOrigin` de los eventos no cambia.

## Adaptación y compatibilidad

`resourcePlayback.ts` es puro, sin React, DOM, almacenamiento, catálogo de fórmulas ni simulación. Valida primero el registro completo: versión/forma, IDs únicos, correspondencia exacta, bandos, continuidad before/after, valores finitos y dentro de máximos, intentos/costes coherentes, consecuencias K.O. sin doble aplicación y estado final idéntico a Fighter. Rechaza duplicados, datos parciales, referencias ajenas y versiones desconocidas. Los snapshots de recursos expuestos se copian y congelan; las colecciones son de sólo lectura en tipos.

Tras validar, construye una vista por evento. Sólo aplica los valores `after` registrados, sin inferir recursos desde damage ni message. La validación puede contrastar damage/coste con la diferencia registrada, pero no genera estado desde esos campos. La adaptación se memoriza por resultado; React únicamente consulta el frame del cursor.

| Punto de reproducción | Recursos |
|---|---|
| Listo, cursor -1 | Estado inicial registrado. |
| Evento N | Estado posterior a ese evento. |
| Pausa / avance manual | Mismo frame; no escrituras ni simulación. |
| Salto de ronda | Frame posterior al primer evento de esa ronda, como en v0.1. |
| Ronda vacía | Estado del último evento anterior; no se fabrica ninguno. |
| Reinicio | Estado inicial. |
| Ir al final | Recursos iguales a los equipos finales del motor. |
| Salir y regresar | Se desmonta/cancela el timeout y se vuelve al inicio, sin autoplay. |

Sin trace, con versión desconocida o cualquier inconsistencia se deshabilita **toda** la capacidad nueva. Se usa v0.1: roles por nombres sólo si son inequívocos, texto original, ningún HP/MP actual ni consumo estructurado. El desplegable de HP/MP finales sigue rotulado como final. No se interpolan ni se reconstruyen guardados antiguos, no se resimulan ni se migran silenciosamente. El fixture `tests/fixtures/combat-v01-1024.json` es un resultado realmente generado antes de instrumentar, no un resultado nuevo con campos borrados.

La versión 1 del registro describe sólo los cambios que el motor actual resuelve. Nuevos efectos, curación o telemetría incompatible exigirán revisar/versionar el contrato y sus validadores; este incremento no los implementa.

## Presentación y movimiento

Dos barras compactas por participante, con etiquetas HP/MP y cifras actuales/máximas, reutilizan los tokens y símbolos. En escritorio comparten una fila; a 320 px se apilan. Los nombres, tipos y roles permanecen visibles. A 1366×768 se compacta la cabecera de Combate y se distribuye la identidad de cada fila para conservar escena y controles sin ocultar información. No se cambia el marco global ni el resto de secciones.

El número cambia inmediatamente; la longitud visual de la barra transiciona 220 ms. El reloj sigue siendo un único timeout de 2500 ms y ninguna animación avanza el estado. Movimiento reducido elimina transiciones y mantiene todos los valores. Las barras son decorativas (`aria-hidden`), acompañadas de etiquetas/cifras accesibles; no tienen regiones live ni reciben foco. El anuncio de estado y el foco de los controles se conservan.

HP 0 muestra K.O. persistente desde el evento que lo registra, incluido el daño anterior al mensaje K.O.; se mantiene al avanzar y cambia correctamente al retroceder o reiniciar. Doble contorno, nombre tachado y etiqueta distinguen K.O. sin depender del color. Actor/objetivo se conservan como roles del evento, separados de la condición persistente. El centro muestra tipo y referencia del intento y MP realmente consumido sólo en la resolución. K.O. no repite ese consumo.

Game UI System aporta tokens, acciones, foco y HeroSigil existentes. Las barras actuales, adaptación, coste y condición K.O. permanecen específicos de Combate; no se extraen primitivas sin otro consumidor real. La presentación simbólica y el catálogo siguen siendo referenciales; no se añaden recursos de terceros ni se resuelve aquí la revisión de contenido previa a distribución comercial.

## Pruebas y evidencia

Antes de cambiar el motor se capturaron 60 SHA-256 de `JSON.stringify(CombatResult)` en `tests/fixtures/combat-v01-projections.json`, procedentes de `c03c8b5`: ambos rivales, diez semillas (0, 1, 2, 7, 42, 1024, 2026, -1, 2147483647, 4294967295) y tres escenarios (demo, sin MP, HP 30/nombres duplicados). Los inputs se declaran en `combat-scenarios.ts`. No se mantiene una segunda implementación del motor en las pruebas.

`combat-trace.test.ts` elimina **sólo trace** del resultado nuevo y compara el hash de todos los campos anteriores con cada referencia. Incluye igualdad profunda con el fixture v0.1 de semilla 1024. Se verifica así la proyección completa: orden, mensajes, tipos, daño, resultado, K.O., valores finales y semilla. La instrumentación no añade ni reordena llamadas RNG; no se cambia ningún cálculo. La prueba genera `output/playwright/combat-equivalence.json` con SHA probado, base, casos y hashes esperados/obtenidos. Estos fixtures de lógica no son baselines visuales.

Las pruebas comprueban continuidad, independencia de snapshots, MP insuficiente, intentos acertados/bloqueados/fallidos/esquivados, skip/info, IDs duplicados de nombre, K.O. sin doble cambio, navegación y fallback incompleto/desconocido. Playwright usa producción, mouse/teclado reales, movimiento normal/reducido, lectura de cifras, K.O. en un evento posterior, persistencia idéntica y entrada/salida repetida; conserva las regresiones anteriores.

La galería existente `output/playwright/combat.html` compara base/head a 1366×768, 1440×900, 1920×1080 y 320×720. Semilla 1024, patrulla, guardado v1: initial; power-mp (evento 1); damage-hp (evento 2); ko-persistent (evento posterior al primer K.O.); final; legacy-fallback con el fixture anterior. `paused-event-1` conserva el enlace anterior y coincide con power-mp. Estados fijados con selección real de ronda/avance y pausa, nunca una fase temporal aleatoria. JSON por viewport registra SHA, fixture, cursor/eventId, texto, dimensiones medidas y versión del registro. Comparación base sin telemetría; head con trace v1; fallback sin trace en ambos.

El workflow copia el mismo spec y fixture antiguo al checkout base, genera capturas viewport/full y vídeo normal de reproducir/pausar/avanzar/saltar/reiniciar, y sube galería, prueba de equivalencia y metadatos con el SHA final. No crea ni actualiza baselines automáticamente. La revisión automática no equivale a aprobación artística ni evaluación humana con lector de pantalla.

Pendiente del propietario: densidad/lectura de HP/MP en las filas y énfasis del consumo registrado. La aprobación de v0.1 no se extiende automáticamente a estas adiciones.
