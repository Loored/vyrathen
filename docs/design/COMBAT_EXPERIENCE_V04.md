# Combat Experience v0.4 — Nyra → Grim (candidata)

Base integrada: `4cf692798eef6f85d6bb466902a5b04f7259d540`, PR #9. Alcance cerrado a esta secuencia y dos reparaciones de Grim. No aprueba arte final, ampliación del elenco, merge ni auto-merge.

## Resultado y contrato

`pilotClip.ts` admite el clip sólo desde un `PilotFrame` validado: actor `h4`, objetivo `e3`, intento registrado `power`, resolución `power`, ambos participantes presentes y vivos después del evento. No consulta nombres, semilla, ordinal, texto ni catálogo. Patrulla/1024 es el fixture de revisión; otros resultados elegibles usan el mismo clip. Fallo, esquiva, bloqueo, básico, daño letal, consecuencia K.O., info y skip mantienen el piloto anterior. Un trace ausente/inválido mantiene el fallback táctico antiguo.

El renderer consume el resultado sin calcular daño, gastar MP o avanzar cursor. No hay cambios en motor, RNG, balance, trace, guardados, contador, resultado, HUD de diez participantes, marco, roster/ficha, Archivo ni Character Lab. HP/MP siguen siendo **posteriores al evento desde su inicio**, también durante la anticipación. La consecuencia K.O. no tiene intento y no puede iniciar otro ataque. HP cero conserva la pose tendida.

La autoridad de datos sigue siendo el timeout de 2500 ms de `CombatPlayback`. La secuencia CSS hereda el serial visual existente y un único índice discreto para cuerpos y efectos: no añade timers, callbacks de animación ni estado temporal React. Pausa congela esa misma animación; continuar conserva su tiempo y serial. Avance manual permite inspección estable. Salto, fin, reinicio, encuadre, cambio de vista, salida o nuevo resultado cancelan transitorios según el contrato existente. No cambian las reglas del timeout al continuar.

## Tiempos implementados

| Tiempo desde evento | Nyra | Grim / efectos |
|---|---|---|
| 0–150 ms | Reposo inicial | Reposo |
| 150–320 ms | Brazal sube; preparación | Reposo |
| 320–480 ms | Carga y torsión | Afirma la guardia |
| 480–620 ms | Sostiene la preparación | Apoyos preparados |
| 620–760 ms | Palma extendida, ejecución | Trazo mano → contacto del cuerpo renderizado |
| 760–900 ms | Comienza a recoger el brazo | Primer contacto; marca breve |
| 900–1080 ms | Continúa seguimiento | Reacción máxima; termina la marca de contacto |
| 1080–1260 ms | Recoge el brazal | Reacción sostenida |
| 1260–1440 ms | Asienta el peso | Flexión para recuperar equilibrio |
| 1440–1640 ms | Se endereza | Recupera guardia |
| 1640–1840 ms | Postura casi neutra | Baja los brazos |
| 1840–2050 ms | Asentamiento | Postura casi neutra |
| 2050–2500 ms | Reposo original estable | Reposo original estable |

La animación dura 2100 ms; resuelve reposo desde 2050 ms y lo mantiene mediante fill. La pausa legible hasta el evento siguiente es 450 ms. Son hipótesis artísticas del remake, no reglas ni tiempos históricos. Sin desplazamiento/escalado animado de imágenes completas, audio, nuevas mecánicas, estados, sacudidas ni destellos. Los cambios corporales son dibujos distintos sostenidos; no equivalen a animación final limpia a alta frecuencia.

## Arte, procedencia y geometría

Se conservan intactas las dos hojas 4×2 originales. Se añaden tres PNG RGBA:

- `nyra-sequence.png`: seis dibujos adicionales, 1536×1024, celdas 512×512, orden por filas: preparación, carga, extensión, seguimiento, recogida, asentamiento.
- `grim-sequence.png`: seis dibujos adicionales, mismo tamaño/celdas: afirmar apoyo, primer contacto, reacción, recuperar equilibrio, guardia, asentamiento.
- `grim-repaired.png`: 1024×512, dos celdas 512×512: esquiva y K.O. completos, con márgenes. El fallback para ambas poses pasa a estos recortes reparados, también fuera del clip.

Herramienta: OpenAI ImageGen integrado, modo edición con transparencia, usando exclusivamente la hoja original del personaje correspondiente como referencia. No hay arte externo ni recursos del Lab. La primera propuesta de Nyra con un brazal duplicado fue descartada. Los prompts pidieron conservar silueta adulta, orientación, atuendo, paleta, iluminación, cuerpo completo y continuidad anatómica. Se pidieron sólo dibujos adicionales o los dos recortes dañados; nunca regeneración de las hojas completas.

Después de la edición se empaquetaron los dibujos generados mediante canvas, con calibración uniforme de origen .84 por hoja de secuencia y .48 para la pareja reparada, sin normalizar bounds individualmente. En ejecución todas las poses comparten la escala del actor/encuadre existente (.60 ampliado; .31 compacto). No existe una cuadrícula global ni pipeline/editor universal. `PilotDrawing` describe únicamente estos recursos pequeños y preserva el contrato de las ocho poses anteriores.

`pilotClip.ts` declara orden, apoyo, mano, contacto y bounds en píxeles locales de la celda empaquetada. `projectPose` usa las mismas transformaciones para arte, debug y efectos. K.O. toma apoyo debajo del cuerpo tendido. Los hashes/dimensiones, referencias, orden y tiempos están en `manifest.json`. Las marcas de recorte se retiran de las **anclas efectivas reparadas**, después de inspeccionar manos, botas, armadura y margen; el manifiesto conserva constancia del clipping en las hojas originales sin alterarlas ni presentarlas como reparadas.

La reparación reconstruye manos/extremos de armadura y da margen transparente. Sigue siendo arte generado provisional: pequeñas variaciones en cabello, pliegues, volumen, separación de apoyos y posición del brazal necesitan limpieza artística. No se afirma continuidad perfecta, autorización comercial ni aprobación por pasar tests. La procedencia propia reduce dependencia de recursos externos; no sustituye revisión de parecidos o contenido antes de distribuir.

## Accesibilidad y evidencia

Movimiento reducido elimina toda animación y muestra una reacción estable completa (paso 6), conservando números, nombres, resultado y controles. Las nuevas fases de inspección Contacto y Recuperación son opciones del select nativo existente; no anuncian cada fotograma ni escriben datos. Se conserva foco/teclado y el anuncio del reproductor.

Si falla una hoja adicional, ese participante muestra HeroSigil y «Arte no disponible», con recursos/controles completos. El error es estable; una carga concurrente exitosa no oculta el fallo del recurso. No se mueve un símbolo como si fuera cuerpo animado.

`sequence-evidence.spec.ts` captura base/head con iguales fixtures y viewport 1366×768, 1440×900, 1920×1080 y 320×720. Incluye preparación, ejecución, contacto, reacción, recuperación, reposo, esquiva/K.O. de Grim, anclas, movimiento reducido y arte ausente. Cada JSON registra SHA, fixture, evento, acción, serial, estado y bounds de píxeles opacos transformados por el SVG. En la base, Contacto usa Reacción y Recuperación usa Reposo por carecer de esas fases; queda indicado en su estado visual. No se finge que la base contiene el clip.

`frameFullScene` centra la escena completa y mide los píxeles reales de cada dibujo, no sólo etiquetas/contenedores. Se usa antes de reproducir cada cruce, también después de seleccionar rondas en el vídeo anterior. `sequence.html` enlaza la comparación, vídeo normal completo y fotogramas **decodificados del vídeo** mediante `sequence-video-frames.mjs`. Se decodifica la grabación completa a 10 fps (cada 100 ms), sin depender del offset aproximado del test para localizar el inicio del ataque. La herramienta registra explícitamente ausencia/fallo de decodificador.

El workflow existente captura el SHA base del PR y el head en Linux/Chromium de producción y conserva galerías/metadatos siete días. Capturas candidatas, sin baselines automáticas. Las pruebas de 13 pasos verifican el reloj visual único, bounds de píxeles, transparencia/anclas, pausa/continuación sin reinicio, datos/persistencia, recurso adicional ausente y reducción dinámica. Se conserva la suite anterior y las 60 proyecciones del motor.

## Decisiones del propietario (máximo tres)

1. Aprobar o ajustar la preparación de 620 ms y el retorno a reposo desde 2050 ms.
2. Aceptar para este candidato la reacción escalonada de Grim y la limpieza pendiente de volumen/brazal de Nyra.
3. Aprobar las dos reparaciones de Grim como sustitutos provisionales, manteniendo las hojas fuente archivadas sin cambios.

La producción de otros personajes o clips requiere una decisión posterior.
