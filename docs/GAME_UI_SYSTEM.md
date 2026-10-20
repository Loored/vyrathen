# Game UI System v1

`src/ui/game-ui.css` es la fuente compartida de tokens estructurales (superficies, texto, borde, espacio, foco y duraciones), semánticos de tipo y primitivas de panel, acción, pestañas y estadística. `GameTabs.tsx` concentra teclado de pestañas y lo consumen Archivo y Character Lab; el Lab mantiene su composición y SELECT propios.

La aplicación adopta paneles/acciones compartidos y la ficha de héroe. Inicio, Combate y Archivo conservan su lógica actual y su siguiente modernización se limita a adoptar gradualmente estas primitivas; no se rediseñan reglas ni simulación.

`src/features/heroes/heroProfile.ts` adapta `Hero` de forma pura. Los cinco héroes son datos demo: los colores, símbolos y fallback sin arte son presentación provisional. La ficha muestra máximos de configuración, nunca el estado final de `Fighter`, y separa poderes catalogados de poderes sin catálogo. Selene, Kuroe y Orion no participan en este adaptador.

Pendiente de revisión del propietario: composición final de siete valores y tratamiento final de arte original para héroes reales. No se altera la identidad ni coreografía aprobada del Lab.

## Revisión automatizada

Ejecuta `npm run review:ui`. Playwright inicia Vite aislado en `127.0.0.1:4173`, usa Chromium, datos de prueba por contexto y deja reporte HTML en `output/playwright/report/index.html`; las capturas estables van a `output/playwright/screenshots/` y vídeos/trazas útiles a `output/playwright/test-results/`. Estos artefactos están ignorados: son candidatos de revisión, no baselines aprobados.

No se comparan píxeles entre macOS y Linux ni se aumentan tolerancias automáticamente: fuentes, rasterizado y GPU pueden variar. La entrega actual comprueba recorridos, foco, reducción de movimiento, overflow y accesibilidad con axe-core. Cualquier baseline o CI se decide en un incremento posterior tras revisión humana de capturas en ambos entornos.
