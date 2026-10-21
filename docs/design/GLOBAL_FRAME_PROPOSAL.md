# Marco global e Inicio — propuesta para revisión

2026-10-20. Base: `95641db` (`main`). Estado: **implementada para revisión; sin aprobación artística automática**. Continúa Neon Elegance + Cyberpunk Expression, con Arcane Cyberpunk reservado para eventos futuros que lo justifiquen. No modifica `DECISIONS_V05.md` ni el canon del motor.

## Intención y composición

El jugador reconoce laboratorio y recursos, lee su equipo y entiende el objetivo antes de actuar. En 1366×768, el HUD, los cinco símbolos, la misión completa y ambos accesos de acción están en el primer viewport.

```text
Navegación   | ubicación          fondos / turnos / combates
compacta    | nombre del laboratorio
            | escuadrón simbólico (5)     | objetivo / progreso
            | nombres / tipos / poderes  | recompensa / coste / avanzar
            | simulador 5 × 5 / explicación / iniciar combate
            | tipos y procedencia (desplegable) / Archivo
```

En 320 px el HUD precede al contenido; el menú se abre sobre un fondo inerte. El escuadrón pasa a lista vertical para conservar nombres y poderes legibles, seguido de misión y simulador. Esta primera propuesta prioriza lectura sobre densidad móvil; la prioridad de misión frente a equipo en móvil queda como elección artística/UX para el propietario.

La marca retoma Georgia, blanco y espaciado del Lab; los titulares usan Space Grotesk y la interfaz la pila Inter/system. Los cinco símbolos y colores proceden del adaptador de héroes real, sin asociar ilustraciones conceptuales. Diagonales, cifras de posición y planos oscuros dan presencia al equipo. La tipografía ambiental es estática y no oculta datos. No se introduce SELECT ni wipe en navegación.

## Estados e interacción

| Estado | Información / acción | Foco y feedback |
|---|---|---|
| Sección activa | Blanco y corte angular; nombre visible | `aria-current=page`; foco menta separado; navegación por Tab/Enter |
| Menú móvil abierto | Navegación y Lab accesibles; contenido inerte | Foco inicial en cerrar; Tab contenido; Escape/cierre vuelve al disparador; elegir sección enfoca contenido |
| Menú abierto al crecer viewport | Retorna al marco de escritorio | Se retira `inert`, se libera scroll y se enfoca contenido |
| Misión incompleta con turnos | Progreso, coste −1 turno y recompensa visibles | Avance inmediato; región de estado confirma progreso y turnos restantes |
| Sin turnos | Botón de avance deshabilitado y explicación | Información completa, sin acción ficticia de recarga |
| Diez pasos | Recompensa lista para reclamar | Confirmación de +$12M; se conserva reinicio de misión del motor actual |
| Ficha / retorno | Mismo héroe y datos reales | Se conserva el foco del botón de origen |
| Movimiento reducido | Todos los valores finales disponibles | Sin entrada, wipe ni dependencia de animaciones |

## Procedencia conservada

| Información | Fuente | Clasificación |
|---|---|---|
| Nombre, fondos, turnos, combates, progreso | `SaveData` / `vyrathen-v01` | Estado de demo; guardado v1 sin migración |
| Cinco héroes, niveles, tipos, poderes | `PLAYER_TEAM`, adaptador `toHeroProfile` | `remake_assumption` para personajes/estadísticas; catálogo referencial |
| Misión Pekín, diez pasos y $12M por nivel | `STARTER_QUEST`, `docs/ORIGEN_REGLAS.md` | `historical_document`; nivel 1 fijo de demo |
| Un turno por paso y repetición de la demo | `advanceStarterQuest`, `claimStarterQuest` | `remake_assumption`; funciones sin cambios |
| Ciclo y 5v5 / diez rondas / K.O. | `docs/HISTORICAL_RULES.md` | `historical_document`; bonus de tipos desconocido |
| Simulación, iniciativa, IA, precisión, daño | Motor existente | `remake_assumption`; sin cambios a RNG/semilla/resultados |
| Selene, Kuroe, Orion | Sandbox aislado | No canónicos, sin vínculo a datos del juego |

No hay nuevos recursos raster, fuentes descargadas, dependencias ni material histórico incorporado. Los símbolos son los existentes y la geometría es CSS. La documentación previa mantiene pendiente la procedencia de las ilustraciones del Lab; esta entrega no las modifica ni certifica sus derechos.

## Evidencia y límites de revisión

Base local: 15 tests, typecheck, build y 4 recorridos Playwright correctos antes de modificar. Inicio antes/después usa `INITIAL_SAVE`, Chromium y producción en macOS, en 1366×768, 1440×900, 1920×1080 y 320×720. Imágenes fuera de Git en `output/playwright/`. El workflow repite la comparación en Linux desde base y head del PR, registra SHA y publica un artefacto candidato por siete días.

La inspección visual local incluye Inicio en las cuatro resoluciones, marco en roster/ficha/combate/archivo, menú móvil abierto y conservación del Lab. Las pruebas añaden axe sin exclusiones, persistencia de coste/recompensa, teclado y movimiento reducido. No equivalen a una prueba con lector de pantalla ni a aprobación del propietario. Resultados finales, SHA y ejecución se entregan en el PR y su informe generado.

## Tres decisiones prioritarias del propietario

1. **Jerarquía misión / simulador:** misión como acción primaria blanca y simulador como banda independiente. La comparación 1366×768 permite evaluar ambos sin scroll.
2. **Presencia del escuadrón:** cinco paneles simbólicos con nombres grandes, conservando ausencia de ilustraciones asignadas; lista en móvil. Revisar si la abstracción expresa suficiente carácter antes de producir arte.
3. **Densidad del marco:** rail de 200 px, marca serif del Lab, activo blanco, HUD compacto. Revisar el equilibrio de personalidad y lectura en las cuatro resoluciones.
