# Personajes v1 — propuesta para revisión

**Candidata pendiente de aprobación visual del propietario.** Base: PR #5 fusionado, `bd674a489520f665d44e67a5921079fcddc465c0`. No modifica la identidad aprobada.

## Composición

```text
Roster: identidad del escuadrón / consulta, no edición
        cinco paneles: estado de consulta → símbolo → nombre/nivel/tipo
        máximos HP/MP → poder → Consultar ficha
        nota provisional / simulador / referencia de tipos desplegable
Ficha:  Volver
        nombre / tipo / nivel | cinco estadísticas
        símbolo / HP/MP       | poder / coste / magnitud nominal si existe
        nota provisional      | alcance real de implementación
        nota de consulta / Abrir simulador
```

Neon Elegance aporta estructura y lectura; Cyberpunk Expression, nombres grandes, geometría diagonal y tipografía ambiental. Consultar no justifica Arcane VFX. SELECT, shards y reveal siguen siendo exclusivos del Lab.

Desktop compara cinco héroes sin repetir toda la ficha. En 1366×768 se ven las cinco acciones y los siete valores de la ficha. Tablet pasa a tres columnas y móvil a una lista; la ficha se apila a 320 px. Información secundaria y simulador siguen disponibles con scroll. No se añaden filtros ni pestañas.

## Contratos y procedencia

| Dato | Fuente y significado |
|---|---|
| Nombre, nivel, tipo, poder | PLAYER_TEAM → toHeroProfile; demo, remake_assumption |
| HP/MP | maxHp/maxMp: máximos configurados, no valores actuales de Fighter |
| Golpear, Bloquear, Esquivar, Mental, Velocidad | Cinco campos reales; no ATK/DEF/CRIT ni puntuación total inventada |
| Coste y magnitud nominal | Adaptador puro, catálogo y funciones documentadas existentes; nominal no es daño final |
| Poder sin catálogo | Estado uncatalogued, sin coste o efecto supuesto |
| Tipo y símbolo | Presentación provisional del adaptador; no rareza ni ilustración |

Motor, RNG, semilla, resultado, guardado v1, economía, misiones y formación no cambian. Último héroe consultado conservado en memoria al volver y entre secciones, no al recargar; no hay nuevos campos persistidos. Selene, Kuroe y Orion siguen aislados en el sandbox.

## Estados

| Estado | Comportamiento |
|---|---|
| Reposo | Identidad, máximos, poder y acciones visibles |
| Último consultado | Etiqueta textual, check, borde/acento y consulta blanca; sin control de selección ni cambio de formación |
| Hover | Respuesta geométrica breve, sin datos exclusivos |
| Teclado | Tab recorre un botón de consulta por héroe; Enter/Espacio abre; foco menta |
| Entrada | Foco en h1, scroll al inicio, valores inmediatos |
| Volver | Último consultado resaltado y foco al botón de consulta de origen |
| Clics repetidos | Estado inmediato, sin overlay, bloqueo ni callback atrasado |
| Movimiento reducido | Contenido final completo sin animación |

Entradas de 260 ms y microfeedback de 160 ms reutilizan tokens. Ambiente estático, sin necesidad de pausa.

## Patrones y provisionalidad

HeroSigil y HeroVitals tienen consumidores reales en ambas pantallas; reutilizan game-action y game-section-kicker. El adaptador permanece intacto. characters.css acota estilos; no cambia GameFrame, Home, Archivo, Combate o Lab.

Símbolos y geometría son provisionales. La repetición ambiental del nombre es un gráfico SVG decorativo separado del encabezado legible y de la acción de consulta; no contiene datos exclusivos. Sin nuevos raster, arte asignado, fuentes o dependencias. No certifica derechos pendientes del arte preexistente del Lab.

Se retiran familias heredadas de roster/ficha, no se acumulan overrides. hero-card permanece sólo como gancho de compatibilidad DOM sin estilos antiguos.

## Evidencia y límites

Antes/después con INITIAL_SAVE y Vesper en 1366×768, 1440×900, 1920×1080 y 320×720, viewport y página completa; incluye retorno con el último consultado resaltado. Comparación sólo dentro del mismo entorno. Galería: output/playwright/index.html. Candidatos, nunca baselines.

Se extiende el workflow existente: base aislada, mismo capturador, build de producción, SHA real y artefacto por siete días. Resultados y enlaces finales se entregan en el PR. No equivale a revisión con lector de pantalla ni aprobación artística.

En la primera iteración, axe detectó discrepancia texto/nombre del selector y contraste del texto ambiental. Se corrigieron y el nombre repetido se modeló como gráfico decorativo. En la revisión del propietario se elimina por completo el selector independiente. No se excluyeron reglas de axe ni elementos informativos.

## Tres decisiones del propietario

1. Cinco paneles con una sola acción «Consultar ficha» por héroe; el último consultado queda resaltado al volver (ajuste solicitado por el propietario).
2. Presencia simbólica y nombre ambiental mientras no exista arte asignado.
3. Dossier asimétrico: identidad y máximos a la izquierda; estadísticas y poder a la derecha.


## Ajuste del PR #6

Se retira «Seleccionar» y su callback/estilos. Antes de la primera consulta no se resalta ningún héroe; abrir la ficha actualiza el último consultado en memoria. Volver recupera su botón de origen. La etiqueta «Último consultado» no es un control ni depende sólo del color. Se mantienen composición, símbolos, ficha asimétrica, marco y contratos.

La cobertura rápida usa `page.mouse.click` con hit-testing real y `page.keyboard.press` (Enter y Shift+Tab), sin dispatchEvent, force ni esperas artificiales. Registra eventos confiables (`isTrusted`) y exige que al menos uno llegue durante la animación de entrada real de 260 ms. Verifica varias fichas consecutivas, datos, foco, resaltado y guardado intacto. El registro JSON se adjunta al reporte Playwright. No prueba todos los dispositivos o velocidades de hardware.
