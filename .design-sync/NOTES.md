# Estado del catálogo y sincronización

El procedimiento vigente, fuentes de verdad, diferencias de contexto y paso Claude Design → Codex CLI están en [DESIGN_CATALOG.md](../docs/design/DESIGN_CATALOG.md). Leerlo antes de convertir o modificar previews.

## Validación local del slice de paridad

- Ocho componentes; 25 previews. Entrada curada: `entry.tsx`; proveedor `LabScope`, con `surface="game"` para componentes compartidos de producción.
- `npm run design:typecheck` comprueba realmente `.design-sync`, incluidos todos los previews. Los contratos manuales de `config.json.dtsPropsFor` se contrastan con los tipos reales, también en campos anidados. No se requiere mantener `.d.ts` publicados.
- `npm run design:build` compila el **sitio local de revisión** con Vite y comprueba que no copie ilustraciones/sprites. No es la conversión del paquete de Claude Design.
- `npm run design:test` comprueba la build en Chromium; `output/playwright/design-sync.html` reúne candidatos de catálogo/producción después de ejecutar `node scripts/ui-evidence-index.mjs`.
- Los fixtures se derivan de `PLAYER_TEAM` y `toHeroProfile` en `fixtures.ts`. No importan persistencia ni conectan personajes conceptuales al motor.
- Se elimina la carga exclusiva de Inter. El harness toma los enlaces de fuentes del `index.html` de la app; ambas superficies usan las mismas reglas y fallback. No se añade una fuente global.
- `LabScope` usa clase, no repite el ID de la ruta; los selectores mantienen especificidad. `CharacterTabs` usa `panelId` por composición y `LayoutGroup` local. Movimiento reducido viene del hook de producción.

## Historial del servicio externo (2026-10-31)

En el primer intento, `DesignSync(create_project, "Vyrathen Design System")` devolvió `HTTP 403 permission_denied: subscription required for this action`. El propietario eligió continuar sólo local. No hubo subida y `config.json` no tiene `projectId`. **Este registro no demuestra el estado actual del servicio.** La sincronización remota está fuera del slice de paridad y no se ha reintentado.

La conversión externa previa usó la herramienta de `bundled-skills/2.1.316`, Node 22.23.2 y React empaquetado por esbuild. No se declara compatible una nueva salida sin ejecutar de nuevo el convertidor y revisar su resultado. La entrada sigue siendo `--entry ./.design-sync/entry.tsx --node-modules ./node_modules`; no hay build de biblioteca ni `.d.ts` públicos y no se cambia `shape: package`.

## Límites de una futura conversión

- Conservar `guidelinesGlob: []` y `readmeHeader: .design-sync/conventions.md`: el alcance documental no incluye copiar `docs/*.md` ni investigación.
- No exportar `public/character-lab/art/` ni hojas del piloto. Los previews usan el marcador SVG geométrico original.
- Instalar herramientas auxiliares bajo `.ds-sync/` con `--prefix`, sin modificar dependencias del juego. El convertidor externo no forma parte de las comprobaciones de CI.
- Revisar archivos y referencias de recursos de la salida real antes de subir. La ausencia de arte en el sitio local Vite no acredita por sí sola el bundle externo.
- SELECT activo y hover son estados temporales. La composición `CharacterStage.PantallaDeSeleccion` permite revisar la secuencia normal y su cancelación con movimiento reducido; las celdas de `SwitchFX` son estados en reposo.
- Etiquetas inglesas, acentos asignados a la demo y toda exploración de nodos/ranuras siguen siendo provisionales.
