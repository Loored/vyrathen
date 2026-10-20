# Character Lab — auditoría de consolidación

Fecha: 2026-10-20. Base remota: `main` en `b204fc1df3349b351180b74ddbb741653429cb52`.

## Estado real del repositorio

- PR #1: documentación y cinco skills, fusionado. PR #2: Character Lab, fusionado. Esta entrega propone correcciones posteriores en una rama nueva; no vuelve a integrar ni fusiona esos PRs.
- El directorio disponible al comenzar estaba vacío de código del proyecto. Se obtuvo una copia por el conector GitHub. Sus 63 blobs, incluidos los tres WebP, coinciden con los SHA del árbol remoto `430ed95d6d2bc8a8e914cd3c9f95845d1eaefac0`.
- **Comparación local confirmada por las salidas del propietario (2026-10-20):** `git status --short --untracked-files=all` y `git diff --stat` no mostraron cambios; `git rev-parse HEAD` devolvió `b204fc1df3349b351180b74ddbb741653429cb52`, el mismo commit base auditado. No se identifican archivos pendientes de seguimiento ni modificaciones que adjuntar. Esta confirmación procede de las salidas compartidas, sin acceso directo al Mac; los archivos ignorados por Git quedan fuera de esta comprobación.
- En el remoto están seguidos `src/features/character-lab/` (10 archivos), `public/character-lab/art/{selene,kuroe,orion}.webp`, `src/main.tsx`, `package.json` y `package-lock.json`.
- La dependencia de producción `motion` ya estaba incorporada por #2. Resoluciones comprobadas en el lock: React/React DOM 19.3.1, Motion 12.43.0, Vite 6.4.4 y TypeScript 5.9.3. Esta consolidación añade únicamente `jsdom` 26.1.0 como dependencia de desarrollo para pruebas DOM, con su lockfile; no actualiza las dependencias de producción.

## Hallazgos y correcciones

| Hallazgo | Corrección | Alcance |
|---|---|---|
| `main.tsx` importaba `App` estáticamente; `App` importaba CSS global aun al abrir el laboratorio. Reglas como `.brand` aportaban padding/borde ajenos al prototipo. | Ambos destinos se cargan de forma diferida; un reset documental mínimo queda en `base.css`. El laboratorio incluye sus propios resets. | Sin cambiar la apariencia aprobada deliberadamente; requiere comprobación visual de la eliminación de estilos accidentales. |
| Los selectores del Lab tenían prefijo, pero los nombres de `@keyframes` seguían siendo globales. | Prefijo `vyr-lab-` en animaciones y sus referencias. | Sin cambios de tiempos, curvas, ilustraciones ni coreografía. |
| Las pestañas tenían `role=tab`, pero faltaban flechas, Home/End, foco itinerante y asociación desde el panel. | Navegación automática de pestañas, una parada de Tab y `aria-labelledby` en panel enfocable. | Flechas sobre pestañas no cambian de personaje. |
| Atajos M/R se repetían al mantener la tecla. | Ignorar `repeat` en toggles y no interceptar edición de contenido. | Se conserva el resto de atajos. |
| La ruta era accesible sólo con URL y no ofrecía retorno al juego. | Enlace explícito al estudio desde navegación; enlace de retorno a `/`. | Navegación documental completa; cada destino carga sólo sus estilos. |
| No había regresiones DOM de esta integración. | Cinco pruebas de interacción con jsdom + React `act`, conservando las ocho del motor. | No reemplazan revisión de layout o animaciones en navegador real. |

## Conservación y fronteras

`src/engine/*`, `src/data/*`, `src/styles.css`, los ocho tests existentes, el formato de `SaveData` y la clave `vyrathen-v01` permanecen intactos. En `App.tsx` sólo se añade el enlace al estudio. Las pruebas usan un guardado de muestra y verifican misión, navegación, diez rondas, persistencia tras visitar el Lab y catálogo.

Selene, Kuroe y Orion siguen siendo fixtures. No se asignan sus ATK/DEF/CRIT a `Hero`, no se introducen seis habilidades reales ni cuatro ranuras de equipo. Las tres ilustraciones ya estaban en el repositorio; esta auditoría comprueba su integridad, **no certifica su autoría/licencia**. Falta registrar procedencia y permiso de distribución antes de publicar una build con ellas. El repositorio se observó como privado; no se cambia su visibilidad.

## Verificaciones ejecutadas

Entorno: Node 24.19.0, npm 11.9.0. El proyecto documenta Node 22.16+; no se ejecutó una segunda matriz de versiones.

| Verificación | Resultado |
|---|---|
| Base sin modificaciones: `npm ci --ignore-scripts --no-audit --no-fund` | Correcto |
| Base: `npm test` | 8/8 |
| Base: `npm run typecheck` y `npm run build` | Correctos |
| Consolidación: `npm test` | 13/13: 8 motor + 5 integración DOM |
| Consolidación: `npm run typecheck` | Correcto |
| Consolidación: `npm run build` | Correcto; CSS de `App` y del Lab en chunks separados |

En las pruebas DOM se verifican: cambio de personaje sin escribir el save; pestañas por teclado sin cambiar de héroe; reseteo del slot conceptual; atajo ambient; selección concurrente bloqueada; una sola pieza `.edge-select`; reducción de movimiento manual y del sistema durante transición; limpieza de listeners; secuencia de 315/800 ms; y regreso al juego con misión/combate persistidos.

**Navegador real: pendiente.** El navegador cloud no pudo acceder al servidor local (`ERR_CONNECTION_REFUSED`). El runtime Playwright estaba instalado pero no tenía Chromium; la descarga del proveedor produjo un ZIP inválido. No se afirman capturas, contraste medido, ausencia visual de overflow, rendimiento de frames ni aprobación visual de esta rama. El PR se deja como borrador.

## Puerta de revisión antes de fusionar

1. **Completado por evidencia del propietario:** árbol de trabajo limpio y HEAD idéntico al commit base auditado. Para revisar las correcciones, descargar y abrir la rama `fix/character-lab-consolidation`; todavía no están en `main`.
2. Abrir `/` y `/character-lab` directamente y por enlaces, recargar `/character-lab/` y volver con historial; comprobar que el hosting da fallback SPA a rutas profundas.
3. Revisar 1366×768, 1440×900, 1920×1080 y 320 px: seis estadísticas completas sin scroll de panel en desktop; sin scroll horizontal global. Comprobar también zoom 200% y altura reducida.
4. Validar retratos, nombre fill/glitch, una sola pieza SELECT vertical viajando derecha→izquierda, tabs y ambiente; no aprobar cambios artísticos implícitos por retirar CSS ajeno.
5. Teclado, foco visible, lector de pantalla, preferencia reducida inicial/dinámica, toggle de ambiente, art missing/error y contraste de textos pequeños. El foco de botones deshabilitados durante la animación merece revisión en navegador.
6. Probar con una copia de una partida real, incluyendo combate guardado; nunca borrar el save para hacer pasar la integración.

El siguiente trabajo está propuesto en [GAME_UI_ROADMAP.md](GAME_UI_ROADMAP.md); ninguna propuesta amplía por sí sola el canon del motor.
