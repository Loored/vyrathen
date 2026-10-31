# Combat Experience v0.1 — presentación aprobada

Base: main 2739e4f (PR #6 fusionado). El propietario aprobó visualmente la composición actual y el intervalo de 2500 ms del SHA `8ce440c1a16642ee395177f492cf19706958821a` y autorizó fusionar el PR #7. Este cierre documental no cambia esa implementación. No sustituye Character Lab, marco, roster ni ficha. Sin arte, audio, dependencias ni reglas nuevas.

## Auditoría y separación

`simulateCombat` calcula una sola vez por acción Iniciar/Nueva simulación en App. Conserva RNG, orden, fórmulas, poderes y desempate. `CombatResult` registra semilla, diez RoundSnapshot, eventos ordenados, equipos finales y resultado. SaveData v1 y `lastBattle` conservan su forma. Seleccionar rival ya no elimina el informe: configuración futura y encuentro almacenado son independientes. Nueva simulación incrementa battles como antes; reproducción no recibe setter de SaveData ni escribe almacenamiento.

`features/combat/playback.ts` adapta cada evento en orden sin ordenar ni analizar message. Una ronda vacía ocupa un punto de navegación sin fabricar CombatEvent. `transition` es una función pura; el único cursor empieza en -1. React usa un reducer y un timeout de 2500 ms, intervalo solicitado por el propietario. Cada cambio de estado cancela el timeout anterior; desmontar cancela el pendiente. El componente se monta sólo en Combate y su key cambia con el contador de simulaciones. No hay reproducción invisible al salir; al regresar vuelve al inicio, sin autoplay. Los controles no mueven el foco.

| Estado | Entrada / salida |
|---|---|
| Sin resultado | Configuración y explicación existentes; no reproductor |
| Sin eventos | Resultado disponible; controles de avance deshabilitados |
| Listo | Cursor -1; iniciar explícitamente o inspeccionar una ronda |
| Reproduciendo | Un avance cada 2500 ms; Pausar conserva cursor |
| Pausado | Avance manual pausa también; seleccionar ronda siempre pausa |
| Finalizado | Último punto; avanzar/continuar deshabilitados; reinicio disponible |

Reiniciar sólo restablece cursor/estado. Ir al final termina inmediatamente. Consultar resultado es un enlace a una sección siempre disponible y no cambia el cursor. El registro textual muestra la ronda inspeccionada, o todas antes de iniciar; sus cifras de supervivientes se etiquetan al cierre. Anuncio accesible sólo de estado, nunca cada evento. Select nativo para rondas, botones para acciones, foco compartido y datos completos sin animación. Movimiento reducido no necesita otra secuencia: conserva toda la información sin las transiciones de presentación.

## Límites y procedencia

Actor/target son nombres. Actor se resuelve únicamente dentro del bando indicado; target sólo si es único entre todos los participantes. Sistema, ausente y ambiguo conservan texto sin resaltar símbolos. `side` en K.O. identifica al actor: sólo target recibe «Objetivo · K.O.». La marca es del evento actual, no un estado acumulado inferido.

Equipos finales no sirven de snapshot inicial. No se muestran barras ni HP/MP intermedios. Valores finales se consultan en un desplegable rotulado; K.O. finales y conteo están separados de la reproducción. blocked/miss/dodged no se enriquecen con poder o consumo inferido. message se conserva literalmente como descripción, nunca se analiza con regex. Ningún fixture de Selene/Kuroe/Orion entra al combate.

| Dato | Fuente / procedencia |
|---|---|
| Eventos, daño, semilla, resultado | CombatResult existente, ruleOrigin conservado |
| Cinco por bando, diez rondas, criterio K.O./empate | historical_document existente |
| Iniciativa, targeting, precisión, daño final | remake_assumption existente |
| Símbolo y acento de tipo | Adaptador de héroes existente; presentación visual aprobada para v0.1 |
| Cursor, reloj, composición | UI nueva, no regla de combate |

## Composición y responsive

Dos formaciones verticales de cinco participantes flanquean una acción central. Actor: borde sólido y etiqueta; objetivo: borde discontinuo y etiqueta; K.O.: borde doble y texto; reposo: «En espera». Neon Elegance aporta estructura y lectura; diagonal estática y tipografía aportan Cyberpunk Expression sin efectos intensos. A 1366×768 se priorizan participantes, evento y controles; resultado y configuración continúan debajo. En móvil se mantienen ambos bandos en dos columnas y el evento debajo; controles se apilan. No representa casillas, distancias ni posiciones mecánicas.

Game UI System aporta tokens, game-action, foco y HeroSigil compartido con roster/ficha. La escena, reloj, roles, registro y select de rondas son específicos de Combate; CSS acotado a `vyr-combat`. No se extraen abstracciones sin consumidores reales. Configuración se pliega con resultado presente y queda disponible para una nueva simulación.

## Contrato aditivo futuro (no implementado)

La aprobación de v0.1 no abarca estas ampliaciones. Combat Experience v0.2 requiere una rama y un PR separados; sprites, VFX y nueva telemetría quedan fuera del cierre actual.

Añadir versión opcional de telemetría al resultado, snapshot inicial por ID, event sequence estable y actorId/targetId opcionales; acción con actionId y powerId explícitos, resultado discriminado y recursos antes/después (HP/MP), coste realmente consumido y efectos/estados aplicados por participante. Emitir estos campos desde el motor en el punto de resolución, no desde la UI. Para acciones bloqueadas/fallidas/esquivadas registrar igualmente habilidad intentada y consumo efectivo. Para K.O. registrar defeatedId independiente del actor. Sprites/VFX consumirían esta telemetría sin gobernar la simulación.

Mantener los campos actuales y su lectura; resultados v1 antiguos carecen de los campos nuevos y usan exactamente el fallback textual/simbólico de esta versión. No reconstruir snapshots de guardados antiguos, ni resimularlos silenciosamente. Versionar y probar ambas capacidades antes de habilitar recursos animados.

## Evidencia y revisión

`combat-evidence.spec.ts`: guardado v1 con patrulla, semilla 1024, un combate. Cuatro viewports (1366×768, 1440×900, 1920×1080, 320×720), initial comparable con base, paused-event-1 y final mediante controles reales. Cada estado produce viewport/full y JSON con SHA, fixture, evento y dimensiones. Vídeo normal: reproducir, pausar, avanzar, ronda 5 y reiniciar. CI usa el mismo spec en base/head, build de producción y workflow actual. `node scripts/ui-evidence-index.mjs` genera `output/playwright/combat.html`. No baselines automáticas.

Pruebas puras cubren orden, inmutabilidad, límites, rondas vacías y participantes ambiguos/sistema. Playwright comprueba entrada rápida con mouse/teclado reales, espera sin avance tras pausa/salida, guardado idéntico, nueva simulación, accesibilidad y overflow. La revisión automática no equivale a aprobación artística ni prueba con lector de pantalla humano.

Decisiones visuales aprobadas por el propietario para la composición actual:
1. Formación vertical enfrentada con acción central y símbolos actuales.
2. Tratamiento de actor/objetivo/K.O. mediante bordes y etiquetas, sin VFX.
3. Configuración plegada después de simular e intervalo de 2500 ms por evento.

Contenido: se reutilizan exclusivamente datos demo y recursos de código existentes. El catálogo alfa conserva la revisión de nombres/contenido pendiente antes de distribución comercial; no se añaden recursos de terceros.

## Iteración de feedback — 2026-10-30

El propietario solicita más fluidez, énfasis en acción/daño/defensa y 2500 ms por evento. Se mantiene un único timeout de UI: los 280 ms de entrada y 420 ms de aparición del daño son animaciones CSS de presentación, sin callbacks ni cambios del cursor. No se animan HP/MP. El foco y los controles permanecen fuera de la entrada animada. Movimiento reducido elimina transiciones y animaciones sin ocultar datos.

Cada kind lleva un icono de código, categoría textual y acento: ataque/poder, defensa (bloqueo parcial/esquiva), fallo, K.O., sin acción y sistema. Las etiquetas del actor y objetivo reflejan el evento, no el nombre del bando: un defensor puede atacar. Bloqueo no identifica la habilidad intentada; K.O. no atribuye daño adicional. El daño numérico se muestra sólo cuando existe en el evento. Hover refuerza filas/símbolos y controles; la información sigue visible sin hover. La posición se expone con progress semántico, sin animación continua ni anuncios por evento. Estas mejoras forman parte de la presentación visual aprobada de v0.1; las capturas se conservan como evidencia, sin convertirlas en baselines automáticas.

Verificación de la implementación `8ce440c` (anterior al cierre documental): 17 pruebas Node/DOM y 27 pruebas Playwright aprobadas localmente en macOS/Chromium, typecheck y build aprobados; la ejecución Linux [41163994852](https://github.com/Loored/vyrathen/actions/runs/41163994852) también aprobó esos checks y subió evidencia. Evidencia en cuatro resoluciones sin overflow global, con controles visibles a 1366×768; inspección de capturas de escritorio/móvil. Las pruebas cubren espera mayor al intervalo anterior, cancelación a 2500 ms, entrada rápida real y señales de ataque desde el bando defensor, bloqueo, esquiva, poder, fallo y K.O. Estos resultados pertenecen a ese SHA; la verificación del commit documental final se registra por separado en el PR #7.
