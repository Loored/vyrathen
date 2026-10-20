# Evolución hacia un Game UI System

Propuesta técnica/UX, 2026-10-20. Depende de cerrar la revisión visual y comparación local de Character Lab. La versión visual v0.5 no equivale a la versión mecánica v0.5 del roadmap anterior. Este documento propone una secuencia de trabajo; no declara nuevos sistemas de juego aprobados.

## Hito 1 — Game UI System v1.0

Extraer patrones de la implementación aprobada cuando exista un segundo consumidor real. No convertir todo el Lab en una biblioteca genérica ni rediseñar `App.tsx` completo.

| Incremento | Entrega | Criterio de salida |
|---|---|---|
| 1A: inventario y tokens | Separar tokens estructurales (superficie, texto, borde, espacio, foco, tipografía), semánticos (tipos, KO, aviso, coste) y acento del retrato. | Dos temas reproducen la vista aprobada. Color de personaje no determina tipo ni resultado. Capturas y contraste revisados. |
| 1B: componentes usados | Extraer `GameTabs`, control de acción/estado, filas de estadísticas y panel de información; adaptar primero la ficha de héroe. CSS Modules o prefijos propios; keyframes propios. | Dos pantallas usan cada patrón extraído; teclado, foco, estados vacío/error y movimiento reducido cubiertos. |
| 1C: lenguaje de feedback | Centralizar tokens de duración y estados de transición; separar ambiente, interacción y evento excepcional. | Cambiar de pestaña/personaje conserva la firma aprobada. Reducir o pausar movimiento nunca oculta información. |

Mantener tokens de dominio como nombres/símbolos además de colores. El SELECT del Lab es un patrón específico de selección; no debe aparecer en cada diálogo ni acción. React + Motion + CSS/SVG bastan para este hito. Medir antes de incorporar otro renderer.

## Hito 2 — Personajes con datos del juego

El modelo visual `Character` mezcla identidad, presentación y estadísticas formateadas. El modelo real `Hero` contiene `id`, `name`, `type`, `level`, `maxHp`, `maxMp`, `hit`, `block`, `dodge`, `mental`, `speed`, `power`, `powerLevel`. No son intercambiables.

| Información | Fuente real disponible | Decisión del adaptador |
|---|---|---|
| Identidad, tipo, nivel | `Hero` + `src/data/demo.ts` | ID de dominio estable; arte/acento en catálogo de presentación separado. Los héroes del motor actual también son demo, no personajes históricos recuperados. |
| Vida y MP máximos | `Hero.maxHp/maxMp` | Mostrar como máximos de configuración. No presentar `Fighter.hp/mp` del último combate como salud persistente. |
| Golpear, Bloquear, Esquivar, Mental, Velocidad | Campos numéricos de `Hero` | Etiquetas de dominio y valores sin convertirlos a ATK/DEF/CRIT. |
| Poder y nivel | `Hero.power/powerLevel`, catálogo de poderes, helpers de reglas | Diferenciar descripción documentada, magnitud nominal y comportamiento ejecutado por el simulador; varios poderes sólo tienen catálogo. |
| Pasiva asignada / entrenamiento / lesiones | No existen en el tipo `Hero` actual | No inventar valores, niveles ni acciones. Mostrar no disponible cuando aporte información; sin CTA ficticio. |
| Equipamiento e inventario | No hay modelo ni reglas ejecutables | No adaptar los slots A–D. Posponer interacción; las joyas documentadas requieren contrato, efectos y pruebas propios. |
| Retrato y animación | Catálogo de presentación original | No vincular automáticamente Selene/Kuroe/Orion con un `Hero`. Fallback accesible con nombre y símbolo, sin bloquear la ficha. |

Proponer un `HeroProfileViewModel` en `src/features/heroes/`, construido por función pura desde `Readonly<Hero>`, metadatos visuales y catálogo. Mantener valores numéricos hasta el formateo en UI. Usar una unión discriminada para poder disponible/descriptivo/no catalogado y para arte disponible/ausente. El motor no importa React, Motion, URLs de arte ni texto de interfaz.

### Siguiente vertical slice: «Inspeccionar un héroe y entender su poder»

1. Desde **Mis héroes**, seleccionar cualquiera de los cinco titulares actuales y abrir su ficha en español. Mantener la pantalla existente como punto de entrada.
2. Aplicar los primeros tokens/componentes compartidos a esa ficha; reutilizar la firma de selección aprobada sin convertir personajes conceptuales en datos reales.
3. Mostrar tipo con símbolo/etiqueta, nivel, HP/MP máximos y las cinco estadísticas reales. Dar prioridad a estos siete valores; ajustar la composición de datos al dominio requiere revisión artística, no recortar dos campos para mantener seis filas.
4. En «Poder», explicar nivel, coste MP conocido y si el efecto se ejecuta en esta demo. Diferenciar una fórmula nominal del daño final; no prometer efectos de pasivas ausentes.
5. Volver al roster sin perder selección; ofrecer acceso al simulador con su equipo actual. No permitir aún cambiar la titularidad, gastar recursos, entrenar ni equipar.

**Aceptación:** cada valor rastreable a dominio/catálogo; adaptador no muta entradas; jamás usa fixtures del Lab; navegable por teclado; selección y retorno estables; caso de arte ausente/poder desconocido; guardados v1 legibles sin migración; 1366×768 legible y 320 px sin overflow. Tests de correspondencia de campos y estados, no snapshots gigantes. Este slice conecta presentación y juego con poco riesgo antes de abordar combate cinematográfico.

## Hito 3 — Combat Experience v1.0

El motor ya es determinista y produce diez `RoundSnapshot`, pero los snapshots sólo contienen eventos y contadores de vivos. `CombatResult` contiene los combatientes **finales**. `CombatEvent` usa nombres en `actor/target`, tiene `damage` opcional y un `message`; no incluye IDs estables, coste MP efectivo, cambios HP/MP, posiciones ni versión del motor. No se puede obtener un replay fiel parseando el texto o repartiendo el estado final hacia atrás.

| Incremento | Cambio necesario | Verificación |
|---|---|---|
| 3A: contrato de replay | Añadir versión y estado inicial, IDs de actor/target y cambios numéricos HP/MP en acciones; registrar gasto MP también cuando hay miss/dodge. Conservar campos antiguos mientras existan saves v1. | Mismo estado/semilla/versión → mismos eventos; no mutación ni cambio de outcome por enriquecer logs; replay reconstruye el resultado final. |
| 3B: visor explicable | Reducer de presentación desde eventos; ronda/acción actual, pausar, avanzar, velocidad, saltar, repetir; HP/MP y KO con registro textual. | Pausar, saltar, cambiar velocidad o reducir movimiento no cambia combate ni recompensas. Saves antiguos ofrecen su log, sin fingir replay exacto. |
| 3C: escena 2D | Un set original coherente de sprites; idle/acción/impacto/KO, VFX por evento; feedback preciso antes de cámaras complejas. PixiJS sólo si el perfilado lo justifica. | Sin sprites solapados ilegibles; nombres/tipos/objetivo claros; alternativa DOM/texto usable; frames y memoria medidos en equipo objetivo. |
| 3D: expansión mecánica | Tablero, alcance, Push, Preparar y pasivas en slices independientes, con hipótesis y procedencia. | Tests de límites, duración, stacking/redondeos y semilla. Revisión de reglas antes de diseñar efectos que sugieran comportamientos inexistentes. |

El reloj de presentación reproduce eventos inmutables; no consume RNG del motor. El resultado se calcula una vez; un replay no otorga recompensas adicionales. Efectos de impacto resaltan quién actuó, sobre quién y qué cambió. Reservar Arcane Cyberpunk para poderes/eventos importantes; evitar flashes y cámaras en cada golpe.

## Matriz de fidelidad

| Regla/dato | Procedencia | Tratamiento |
|---|---|---|
| 5v5, diez rondas, KO, empate al defensor, ciclo de tipos | `historical_document` | Preservar helpers y regresiones deterministas. No convertir puntos de tipos en un bonus desconocido. |
| Costes MP documentados y magnitudes nominales recuperadas | `historical_document` | Referenciar catálogo/helpers; no confundirlos con algoritmo completo. |
| Estadísticas iniciales, iniciativa, IA, precisión y mitigación actuales | `remake_assumption` | Etiquetar en documentación y explicación de combate; no atribuir a servidor histórico. |
| Selene/Kuroe/Orion, CRIT/ATK y slots del Lab | Fixture visual no canónico | Separados del adaptador y del motor. |
| Datos observados de páginas históricas | Docs: `observed_runtime`; enum actual: `observed_on_page` | No cambiar el enum silenciosamente; definir migración si se normaliza en un trabajo futuro. |

## Decisiones artísticas pendientes

Antes de diseñar la ficha real: aprobar composición de siete estadísticas + poder, tratamiento de arte ausente y si los personajes conceptuales llegarán a tener identidad oficial (sin importar sus números demo). Antes del combate: aprobar escala/estilo de sprites, encuadre y jerarquía de efectos con un animatic breve. No se propone rehacer las pestañas aprobadas del sandbox para resolver contratos de gameplay.

El orden recomendado es consolidación → sistema UI mínimo + ficha real de consulta → eventos/replay → escena con sprites → nuevas mecánicas. Las versiones mecánicas de `docs/ROADMAP.md` siguen siendo referencia de alcance; no se añaden gacha, cuatro slots, árboles de seis nodos ni nuevas fórmulas por parecerse a otro juego.
