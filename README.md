# Vyrathen

**Sci-Fi Strategy RPG** — videojuego independiente de estrategia, escuadrones de héroes y laboratorios. En desarrollo temprano (**alpha 0.1**).

> No es un producto oficial ni está afiliado a los creadores de juegos históricos de navegador. El universo, marca, interfaz y recursos artísticos de Vyrathen deben ser propios. Algunos nombres y reglas del catálogo alfa todavía son **referencias de diseño** sujetas a revisión editorial y de derechos.

## Requisitos
Node.js 22.16+ y npm.

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

## Verificaciones

```bash
npm test
npm run typecheck
npm run build
```

**Estado real del prototipo:** React 19 / TypeScript / Vite, simulador 5v5 de 10 rondas reproducible por semilla, datos iniciales de cinco héroes, progreso de misión de demostración, catálogo conceptual de poderes y pasivas, persistencia en el navegador. IA, daño, tablero y economía todavía son aproximaciones propias, no fórmulas recuperadas.

Los guardados locales usan la clave `vyrathen-v01`; esta nueva marca **no migra automáticamente** partidas guardadas por el prototipo anterior.

## Documentación
- [`AGENTS.md`](AGENTS.md): reglas para Codex y otros agentes.
- [`docs/PRODUCT_VISION.md`](docs/PRODUCT_VISION.md): visión del producto.
- [`docs/VISUAL_DIRECTION.md`](docs/VISUAL_DIRECTION.md): estética, intención y fases de diseño.
- [`docs/UI_UX_GUIDELINES.md`](docs/UI_UX_GUIDELINES.md): usabilidad y accesibilidad.
- [`docs/HISTORICAL_RULES.md`](docs/HISTORICAL_RULES.md): mecánicas investigadas y límites.
- [`docs/CODEX_KICKOFF.md`](docs/CODEX_KICKOFF.md): trabajo siguiente (v0.2).
- [`docs/PUBLICATION_CHECKLIST.md`](docs/PUBLICATION_CHECKLIST.md): revisión antes de publicar.

## Arte y derechos
**No** se incluyen artes gráficos extraídos de sitios históricos. El proyecto no incorpora logos, sprites, capturas ni diseños de terceros recuperados de Wayback. Los documentos de investigación extensos deben permanecer en `.private/` local, fuera de Git. No se ha elegido todavía una licencia de código; decidirla antes de invitar contribuciones.

## Desarrollo
El primer objetivo es un combate espacial explicable y comprobable, seguido por progresión de personajes, laboratorios, misiones y economía; el multijugador llegará cuando el núcleo de reglas sea robusto.
