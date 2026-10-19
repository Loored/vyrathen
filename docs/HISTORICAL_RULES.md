# Reglas históricas: evidencia, límites y canon

**Nota:** las fuentes originales se almacenan sólo en el paquete privado, nunca en GitHub.

**Fuente primaria prioritaria:** `.private/research/wayback/Soulheroes_Wayback.zip` (sólo paquete privado), subcarpeta `Soulheroes_Wayback/originales/`. Biblioteca completa `20100302142634/mmorpg.soulheroes.com/biblioteca.php.html`, SHA-256 `9e5e82f3d29f72c167fa401f31686fe6693fb9434b285561abb267f756b84ded`. Comparar siempre fecha de **captura** vs fecha del suceso.

## Procedencia a utilizar en tipos/datos
- `historical_document`: regla textual explícita del manual, sin asumir que es fórmula exacta de implementación.
- `observed_runtime`: nombre, contador o estado visible de una captura de página real; no implica conocer código interno.
- `historical_inference`: inferencia transparente y acotada sobre datos/capturas.
- `remake_assumption`: regla nueva, configurable y sustituible. No presentarla como auténtica.

## Batallas
- Equipo usual de 5 héroes vs 5. Combate ordinario de 10 rondas. Gana quien cause más K.O.; con igualdad gana el defensor. Un boss se vence dejándolo K.O.
- Tipos: **Defensa > Psico > Energía > Control > Defensa**. La comparación par-a-par por 5x5 reproduce el ejemplo **13:1**; la traducción de puntos a porcentaje estadístico NO se conoce (manual menciona un máximo de 65%).
- Velocidad afecta probabilidad/frecuencia de actuar; Inteligencia afecta elección de acciones y movimiento. Sin algoritmo original recuperado. Bloquear y Esquivar existen; el orden exacto se desconoce.
- `Preparar`: durante las 2 rondas siguientes +50% a Golpear, Crítico, Bloquear, Esquivar, Velocidad y Control del poder, +2 nivel de poder. Desconocidos: stacking, redondeos, activación exacta.
- `Push`: desplaza al enemigo 2 casillas; 33% de posibilidad de no hacer nada más en esa ronda. Dimensiones/geometría del mapa no recuperadas.
- Fallo de Moral: -85% Velocidad, Bloquear, Esquivar y Mental hasta terminar el combate; no conocemos cómo se determina el fallo.
- Regla de MP general `5 × nivel del poder` con excepciones: `Oído agudo`, `Invisibilidad`, `Regeneración` = `3 × nivel`; `Influir máquinas` = 0. La ejecución exacta por fase debe confirmarse por poder.
- Se documentan 24 poderes (5 Psico, 7 Energía, 6 Defensa, 6 Control) y 15 pasivas con nombre en la biblioteca 2010. Anuncios 2009–2012 siguen diciendo 23 poderes y 20 pasivas: **contradicción documental, no prueba de altas/bajas en una fecha**.
- En enero de 2012 aparecen `Espejo`, `Elástico` y `Absorber` en héroes; sus efectos **NO están recuperados**. Total de al menos 27 nombres documentados entre 2010 y 2012, no 27 disponibles simultáneamente.
- 21 tipos de poderes aparecían en ranking de 183 héroes lvl 10+ de marzo 2010; otros ausentes no se consideran desactivados.

## Ciclos/lesiones
- El juego informa de ciclos de turnos 00:00 / 08:00 / 16:00 y límite de 2000 acumulados (revisar detalles cronológicos en etapa 10).
- Lesiones graves: hasta 20 días; paso diario reduce 1 día. Hospital: 2% por unidad de posibilidad de reducir a la mitad la lesión inicial. Médicos: probabilidad aproximada de operación `20% + 1.4% × valor médicos` (interpretación exacta del valor por confirmar). Más de 3 héroes lesionados: operaciones con mitad de turnos (modo ambulancia). Regeneración: se describe inmunidad a lesión. Incertidumbre: apilamientos y redondeo.
- Pasivas: `Rompehuesos` +60% posibilidad de lesionar; `Vigor` -80% posibilidad de recibir lesión. `Aceleración`, `Berserk`, `Ataque certero` son dependientes de ronda; efectos documentados en `.private/research/catalogs/catalogo_pasivas_2010.csv`.

## Laboratorio, estructuras, ciudades
- 8 niveles de laboratorio, del inicial a LabEmpire, con misiones explícitas para ascender (no subida automática por experiencia). 7 misiones de ascenso con pasos base 10,15,20,25,30,35,40.
- 16 estructuras y 16 relaciones de dependencia identificadas en imagen de noviembre 2010. Requisito general: 10 unidades de cada predecesora y nivel mínimo, sin conocer precios. Fuente imagen `20101127205813/soulheroes.com/images/arbolestructuras.jpg`; SHA-256 `b2618075c3a8a1e2cd971cdd909c3c1e054c3be36c8db9e5c466947ba1becac2`.
- Personal y ciudad afectan ingresos y progresión: economistas +2% recompensas en combate y +5% ingresos diarios; residentes +1 turno/15; Economía ciudad +10% ingresos diarios de USD por punto; Industria +1.7% posibilidad coste gratuito por punto. Combinación de buffs no documentada.
- 26 misiones descritas, 7 de ascenso y 19 otras, con restricciones por héroe/cuenta documentadas para algunas; no confundir ausencia de restricción mencionada con repetición infinita.
- Mercado: precios variables cada paso de día; **no tenemos tabla real de compra/venta**. Equivalencias de materiales por puntos de ranking **NO son precios de mercado**.

## Bosses, sets y clanes
- Boss: 5 titulares atacantes + hasta 3 titulares de compañeros de clan que estén en la misma ciudad (restricciones de nivel); ataque al mismo boss una vez por jugador/día, con excepciones específicas. Boss ejecuta Terror rondas 3/5/7. Triple experiencia al derrotarlo; recompensas materiales y licencias.
- 9 sets históricos en biblioteca 2010: Jade, Luna, Áureo, Hielo, Corrupto, Diablo, Aqua, BigBang, Bunny. Pueden existir colgante, pendientes y anillo; completando set hay bonus. Revisar efectos exactos en `.private/research/catalogs/sets_joyas_2010.csv`, no en este resumen.
- Objetos defensivos y licencias ya se mencionaban al menos en 2009; **no suponer introducción inicial en 2012**. Evolución posterior sin secuencia fechada completa.
- Existió servicio SMS de códigos, pero beneficios/comercio exacto desconocidos; excluido explícitamente del roadmap inicial.

## Referencias originales concretas
- Manual: `20100302142634/mmorpg.soulheroes.com/biblioteca.php.html` (principal, 2010-03-02).
- Recuento poderes: `20100302153747/mmorpg.soulheroes.com/rankings_externo.php.html`.
- Cambio de poderes/MVP: `20100603011836/mmorpg.soulheroes.com/rankings_externo.php.html`.
- Héroes en 2012: `20120122033844/mmorpg.soulheroes.com/index.html`.
- Registro Profecy #8: `20120123143653/mmorpg.soulheroes.com/nuevousuario.php.html`.
- Captura árbol: `20101127205813/soulheroes.com/images/arbolestructuras.jpg`.

**Lecturas extensas:** `.private/.private/research/reports/Etapa_11_...`, etapas 12–20 y `.private/research/INDEX.md` (si está disponible). En discrepancias volver al archivo original y conservar ambas descripciones con fechas.

## Política de publicación
La denominación Soulheroes en este documento identifica exclusivamente la **fuente histórica consultada**, no la marca del producto Vyrathen. La interfaz y los recursos artísticos públicos son independientes. Los nombres y descripciones del catálogo alfa son candidatos a rediseño y deben revisarse antes de una distribución comercial.
