# Game UI System v1

`src/ui/game-ui.css` es la fuente compartida de tokens estructurales (superficies, texto, borde, espacio, foco y duraciones), semánticos de tipo y primitivas de panel, acción, pestañas y estadística. `GameTabs.tsx` concentra teclado de pestañas y lo consumen Archivo y Character Lab; el Lab mantiene su composición y SELECT propios.

La aplicación adopta paneles/acciones compartidos y la ficha de héroe. Inicio, Combate y Archivo conservan su lógica actual y su siguiente modernización se limita a adoptar gradualmente estas primitivas; no se rediseñan reglas ni simulación.

`src/features/heroes/heroProfile.ts` adapta `Hero` de forma pura. Los cinco héroes son datos demo: los colores, símbolos y fallback sin arte son presentación provisional. La ficha muestra máximos de configuración, nunca el estado final de `Fighter`, y separa poderes catalogados de poderes sin catálogo. Selene, Kuroe y Orion no participan en este adaptador.

Pendiente de revisión del propietario: composición final de siete valores y tratamiento final de arte original para héroes reales. No se altera la identidad ni coreografía aprobada del Lab.
