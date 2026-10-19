# Arquitectura, pruebas y calidad

## Estado comprobado de la base v0.1
- Framework: React 19 + TS estricto + Vite; lucide-react para iconos.
- `src/engine/rules.ts`: helpers históricos verificables; `src/engine/simulator.ts`: **simulación con supuestos**, RNG con semilla; `src/engine/quest.ts`: misión demo; `src/engine/types.ts`: dominio.
- `src/data/demo.ts`: fixtures demo, no usuarios reales; catálogos JSON en `src/data/`.
- `src/App.tsx`: UI concentrada en un archivo; **candidato a descomposición incremental** cuando aumente tamaño.
- Estado local mediante localStorage `vyrathen-v01`. Cuidado al introducir `v02`: migrar, no sobrescribir/borrar partidas silenciosamente.
- `tests/engine.test.ts`: 8 pruebas de Node test runner; no hay Playwright ni backend.

## Dependencias y comandos del repositorio actual
```bash
npm install
npm run dev
npm test
npm run typecheck
npm run build
```
Node 22.16+ para tests TS actuales. Antes de actualizar dependencias, verificar compatibilidad y decidir necesidad.

## Capas recomendadas a medida que crezca (evitar refactor masivo)
```text
src/
  engine/         # estado de combate, reglas puras, RNG, eventos, sin UI
  data/           # catálogos fuente y configuración demo separada
  features/       # UI+hooks por funcionalidad (combat, heroes, quests...)
  components/     # controles reutilizados de UI, accesibles
  styles/         # tokens globales y estilos por componentes/features
  persistence/    # adaptadores de partidas, migrations/versionado
  app/            # navegación/layout/orquestación, no reglas de dominio
```
No hay obligación de crear carpetas vacías ni abstraer prematuramente.

## Motor reproducible y auditable
- RNG **inyectable**, número de semilla y versión del motor en el resultado; mismo estado/semilla/versión => mismos eventos y outcome.
- APIs sin mutaciones ocultas, `Readonly` donde sea conveniente; todos los timestamps generados por simulación controlados, no `Date.now()` en función pura.
- Modelar `CombatEvent` discriminado por `kind`, ronda, actor/target, diffs HP/MP y procedencia. Los logs son datos estructurados; UI sólo formatea.
- Validar invariantes: 5x5 en modos normales (si una regla documentada cambia equipo de boss, codificar modo separado), sin HP/MP negativos, sin actuar tras KO, sin gastar MP insuficiente.
- Conservar fixture 13:1 y tests de igualdad de K.O., más metamórficas si cambian tipos.
- El tablero y distancias son configuración **remake_assumption**. Pruebas de límites, colisiones, rangos, desplazamientos y reproducibilidad.

## Datos/procedencia
El archivo privado opcional `.private/research/` puede aportar procedencia sin publicarse. La evidencia fuente no es un comentario de código genérico. Añadir `sourceRef` (archivo y ruta interna), `capturedAt`, `ruleOrigin`, `confidence` y `notes` cuando se digitalice una regla o se cambie una interpretación. Ejemplo en `docs/RULE_PROVENANCE_SCHEMA.json`. No serializar funciones dentro de JSON; compilar catálogos validados.

## Validación de entregas
1. `npm test` para lógica; agregar casos extremos / regresiones por feature.
2. `npm run typecheck` sin errores; evitar `any` salvo integración documentada.
3. `npm run build` (dependencias instaladas). No usar paso de build como sustituto de prueba funcional.
4. UI: verificar teclado, estados y responsive con navegador real cuando esté disponible; sugerido Playwright en hito posterior, sin imponerlo como requisito si no instalado.
5. Conservar logs de benchmark/semillas de bugs reproducibles; no depender de snapshots gigantes frágiles.
6. No afirmar éxito de verificaciones que fallaron por falta de red/dependencias.

## Seguridad y distribución
- Datos archivados no confiables (HTML, JS). No ejecutar ni servir directamente JS/PHP antiguos.
- No procesar archivos protegidos/identificables de jugadores antiguos como fixtures; anonimizar muestras.
- No exponer ni introducir claves, secretos, formularios de pago/SMS, validación en cliente como autorización de backend.
- Antes de lanzar servicio multiplayer: autenticación, rate limiting, transacciones, integridad de economía, antibots, observabilidad, política de privacidad y términos.
- Recuerda que imágenes originales y nombres pueden estar protegidos; no publicar assets originales sin revisión legal. El proyecto es recreación no oficial.
