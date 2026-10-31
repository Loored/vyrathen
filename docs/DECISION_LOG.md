# Decisiones arquitectónicas y de producto

| ID | Decisión | Estado | Razón / reconsideración |
|---|---|---|---|
| ADR-001 | UI moderna, no clon visual del navegador 2009 | Aceptada (usuario, 2026-10-19) | Mejor legibilidad, accesibilidad y uso móvil sin perder mecánicas. |
| ADR-002 | Motor de reglas separado de React | Aceptada / v0.1 | Independencia y tests reproducibles. |
| ADR-003 | TS/React/Vite como base de v0.2 | Aceptada provisionalmente | Evitar reescritura innecesaria; revaluar backend más adelante. |
| ADR-004 | `ruleOrigin` y procedencia explícita | Aceptada | No confundir archivos históricos con simulación nueva. |
| ADR-005 | Primera versión local, sin autenticación ni multijugador | Aceptada para MVP | Minimizar infraestructura para iterar sobre sistemas de juego. |
| ADR-006 | Tema oscuro sci-fi sobrio como continuidad de v0.1 | Provisional / ajustable | Paleta y jerarquía a validar visualmente; modernidad no equivale a interfaz sobrecargada. |
| ADR-007 | Reglas desconocidas parametrizadas como `remake_assumption` | Aceptada | Permite corregirlas cuando aparezcan evidencias. |

| ADR-008 | Marca Vyrathen; repositorio público sin arte ni archivos Wayback | Aceptada (usuario, 2026-10-19) | IP propia, referencias históricas privadas, sin afiliación |
| ADR-009 | Dirección visual RPG sci-fi, no dashboard de IA/SaaS | Aceptada como objetivo; estilo final pendiente | Ver `docs/VISUAL_DIRECTION.md` |

Para nuevas decisiones sustantivas: fecha, problema, opciones, decisión, impacto, fuente/feedback y condición de revisión. No añadir ADR por cada bugfix.

## 2026-10-20 — Aislamiento del laboratorio visual

ADR-010: cargar ambas pantallas completas (`App` y `CharacterLabRoute`) de forma diferida con CSS propio. La importación estática de `App` cargaba estilos globales de la alfa incluso dentro del laboratorio. Se conserva un reset documental mínimo compartido; navegar entre destinos usa enlaces documentales y conserva `vyrathen-v01`. No cambia el motor ni canoniza fixtures. Alternativa descartada: duplicar overrides para cada colisión CSS. Reconsiderar una navegación SPA compartida sólo cuando haya un sistema UI con estilos aislados y regresiones de recorrido en navegador. La dirección artística aprobada sigue en `docs/design/DECISIONS_V05.md`; el roadmap UI nuevo es una propuesta, no una aprobación de mecánicas o arte adicional.

## 2026-10-20 — Game UI System v1 y ficha de consulta

ADR-011: tokens y primitivas pequeñas se comparten desde `src/ui/`, con CSS apto para ambas rutas y navegación de pestañas reutilizada. La ficha consume un adaptador puro de `Hero`; HP/MP son máximos de configuración y el catálogo sólo describe poderes, sin inferir ejecución. SELECT, shards y retrato permanecen específicos del Lab. La composición provisional sin arte no canoniza personajes ni equipamiento; requiere revisión visual del propietario antes de escalarla.

## 2026-10-21 — Reproducción de combate independiente

ADR-012: Combat Experience v0.1 presenta CombatResult con adaptador y transiciones puras, cursor único y reloj de UI. No cambia motor ni SaveData v1. Configuración futura conserva lastBattle; replay no escribe guardado. Salir desmonta y cancela el reloj; regresar empieza listo desde el inicio. Datos finales se separan de los eventos sin snapshots intermedios. Composición y ritmo son candidatos pendientes del propietario; contrato futuro aditivo y límites en [propuesta](design/COMBAT_EXPERIENCE_V01.md).

## 2026-10-30 — Registro aditivo y recursos de reproducción

ADR-013: tras la aprobación e integración de Combat Experience v0.1 (PR #7), v0.2 añade `CombatResult.trace?` con versión propia, estado inicial por ID y una entrada por evento. La resolución registra intento y recursos before/after; K.O. sólo enlaza la acción y al derrotado. Se conserva SaveData v1 y la proyección anterior del motor. Alternativa descartada: reconstruir estados desde mensajes, fórmulas o equipos finales. Un adaptador puro valida el registro completo antes de ofrecer frames por cursor; si falta o es incompatible, vuelve íntegramente a v0.1. Nuevas barras y coste explícito pendientes de revisión visual; contrato, equivalencia y límites en [v0.2](design/COMBAT_EXPERIENCE_V02.md).
