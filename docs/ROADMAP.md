# Roadmap por incrementos verificables

**Estado inicial 2026-10-19:** v0.1 entregada como prototipo local; se ejecutaron 8/8 pruebas de `npm test` en el entorno de preparación del paquete. La compilación de producción no se certificó aquí porque las dependencias npm no estaban instaladas; Codex debe comprobarla.

## v0.2 — Combate espacial y explicable (prioridad inmediata)
- Auditoría del proyecto y compilación real antes de añadir funcionalidades.
- Extraer UI de combate de `App.tsx` cuando sea oportuno, sin gran reescritura.
- Tablero discreto simple configurable (dimensiones documentadas como suposición), posiciones, movimiento, alcance, Push.
- Modelo de acciones/eventos estructurados con semilla reproducible; distinción entre reglas exactas e inventadas.
- 3–5 poderes de clases diferentes + 2–3 pasivas como primeras implementaciones completas, bien probadas. Mantener el resto en catálogo descriptivo.
- Visor accesible de 10 rondas, barras de HP/MP, estado, acciones explicables, replay.
- Tests: semillas, equipo, daño/MP, tipos, casillas, rangos, efectos, expiración, K.O., sin mutación.
**Aceptación:** dos simulaciones con misma semilla y datos producen igual secuencia; usuario comprende ganador; compila y pasa tests y revisión responsive.

## v0.3 — Héroes y progreso
- Roster y titularidad/selección, stats, poderes, entrenamiento, fatiga/lesiones simplificadas con procedencia.
- Persistencia local versionada y migraciones; establecer datos iniciales coherentes.
- Comparativa visual accesible de héroes y coste de cambios.

## v0.4 — Laboratorio, economía y edificios
- Ocho niveles, árbol 16 estructuras/16 relaciones, prerequisitos 10 edificios, reglas de ciudad/personal.
- Precios no recuperados: balance como `remake_assumption` configurable, NO inventar valores históricos.
- Reloj/ciclo simulado con controles para pruebas en lugar de dependencia en fecha real.

## v0.5 — Misiones, equipamiento y bosses (offline)
- Catálogo de 26 quests, ruta Pekín existente, ascensos, sets de joyas y defensas documentadas.
- Boss con reglas especiales, equipos 5+3 de apoyo simulados, recompensas configurables; test de eventos y coherencia.

## v0.6+ — Plataforma/mundos y cooperativo online
- Decisión arquitectónica explícita backend, DB, integridad server-authoritative y migración de saves antes de implementar.
- Mundos/temporadas, ciudades, clanes, raids cooperativos, mercado y eventos; no habilitar economía compartida sin antifraude y atomicidad.
- Sin pagos/SMS como objetivo inicial.

## Cómo priorizar tareas en cada versión
1. ¿Existe evidencia de la regla? 2. ¿Cuál es el menor vertical slice? 3. ¿Cómo sabremos con tests que funciona? 4. ¿Qué estados UX crea? 5. ¿Qué queda como supuesto?
