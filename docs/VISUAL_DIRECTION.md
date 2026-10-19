# Vyrathen — Visual Direction v0.1 (propuesta, no diseño final)

## Objetivo de experiencia
Debe sentirse como un **videojuego de estrategia RPG de ciencia ficción**, no una herramienta administrativa con tema oscuro. Dirección: *tactical sci-fi, laboratorio clandestino, anomalías, poder y conflicto*. Escena y personajes primero; telemetría y tablas después. Narrativa y marca propias.

## Referencias (sólo principios)
Se puede estudiar el nivel de pulido de interfaces de juegos contemporáneos como Wuthering Waves, Zenless Zone Zero, Honkai: Star Rail o Neverness to Everness: jerarquías de HUD, anticipación de recompensas, transiciones, identidad de personaje. **No copiar** artes, personajes, logotipos, layouts distintivos, fuentes comerciales, iconos ni composiciones exactas.

## Pilares
1. **Centro de operaciones vivo:** contexto de laboratorio y ciudad, recursos como telemetría de juego; no una homepage SaaS con gráficas de negocio.
2. **Los héroes importan:** perfil visual original, jerarquía de rol/poder, rareza sólo si se diseña más adelante; evitar colecciones de tarjetas idénticas sin identidad.
3. **Combate legible y emocionante:** arena discreta, peligro inminente, impacto y log accesible, pausa/replay por ronda; el espectáculo no debe ocultar las reglas.
4. **Decisiones con consecuencias:** energía, tiempo, riesgo, botín y desbloqueos con feedback en contexto antes/después de actuar.
5. **Identidad consistente:** lenguaje geométrico, siluetas e iconografía originales; microinteracciones que expliquen sistema, no decoración.

## Sistema inicial de estilo (tentativo)
- Superficies: carbón/obsidiana, contraste alto, capas discernibles.
- Acentos: cian para interacción/foco, ámbar para energía/riesgo, violeta para anomalías; cuatro tipos con colores + icono + nombre. Los tokens actuales de v0.1 son transitorios; migrar por iteraciones.
- Tipografía: título expresivo sin sacrificar legibilidad, interfaz y números con fuentes abiertas autorizadas; cuerpo >=14–16px como objetivo, nada de microtexto permanente.
- Imágenes: arte **propio o licenciado**, inicialmente siluetas, formas SVG originales o ilustraciones encargadas. De momento NO hay sprites ni arte histórico redistribuible.
- Movimiento: transición rápida, propósito claro, respetar `prefers-reduced-motion`; evitar flash y patrones agresivos.

## Componentes prioritarios
`CommandHUD`, `HeroIdentityPanel`, `SquadFormation`, `CombatArena`, `RoundTimeline`, `MissionBriefing`, `RewardReveal`, `LabUpgradeTree`, `BattleResult`.
Son nombres de diseño, no requerimiento para crear módulos vacíos. Definir estados vacíos/error, hover/foco y escala móvil para cada feature.

## Entregables de diseño por fases
- **D0 / Define:** documento de visión (éste), 3 referencias por pilar, anti-referencias (qué evitar), paleta y tipografía aprobables.
- **D1 / Explore:** 2–3 direcciones visuales *originales*, key screen de Centro de operaciones y Combate, revisión de jerarquía y tono.
- **D2 / Systemize:** tokens, biblioteca de componentes, iconografía y patrones de interacción versionados.
- **D3 / Validate:** flujo jugable, pruebas con teclado/móvil, onboarding y análisis de comprensión del combate.
No pedir a Codex rediseñar todo antes de que funcione el motor v0.2.
