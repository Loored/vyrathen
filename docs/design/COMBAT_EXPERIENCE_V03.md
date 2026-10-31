# Combat Experience v0.3 — primer piloto de personajes 2D

Base: `b86a9765ef51aa24fdaab1ea915daaaee1c897ab`, PR #8 fusionado. Este incremento es candidato a revisión artística. La integración anterior no aprueba estas siluetas, escala ni coreografía. No autoriza ampliar el elenco ni hacer merge/auto-merge de este PR.

## Propuesta y alcance

Una escena alternable ocupa el centro de la composición de Combate. Los dos bandos mantienen sus cinco filas, símbolos, roles y HP/MP exactos. Sólo Nyra (`h4`, atacante) y Grim (`e3`, Patrulla oscura) reciben cuerpos 2D. El resto conserva HeroSigil; si participa en la acción actual, su mismo símbolo/ID se proyecta junto a la escena para que la trayectoria no se atribuya a Nyra o Grim. No es un combatiente adicional ni un combate 1v1. El encabezado indica cuántos de los diez tienen arte piloto. Si e3 no está en el resultado (Guardianes), no se inventa su presencia.

Nyra: silueta adulta ligera, cabello corto violeta oscuro, faldones asimétricos y un brazal de mayor volumen, acentos menta/violeta. Grim: masa trapezoidal, hombro y antebrazos blindados, botas anchas y acentos azul/acero. Ambos miran hacia el rival. No se canonizan apariencia, género, vestuario ni identidad narrativa de los datos demo. Sin pixel art ni proporciones chibi impuestas como dirección definitiva.

Neon Elegance mantiene lectura y estructura; diagonales y contraste aportan Cyberpunk Expression. La elipse de apoyo es decorativa, sin casillas, alcance, distancias ni ventajas. Trazos breves indican origen y destino reales por ID: mano aproximada del actor 2D o símbolo del participante; contacto en el objetivo. No son proyectiles ni efectos de poder nuevos. Fallo/esquiva desvían el trazo y no muestran contacto exitoso; bloqueo usa una marca de guardia. Sin audio ni partículas extensas.

La composición original compacta mide 174 px. La revisión añade el encuadre ampliado de 220 px en escritorio (210 px en tablet; selector reversible entre ampliado y compacto), mantiene los diez HUD y comprime cabeceras/evento en esa vista; la vista táctica no cambia. El cuerpo usa 0,60 de escala uniforme en ampliado y 0,31 en compacto, sin normalizar bounding boxes. A 1366×768 permanecen los diez participantes y controles en pantalla; el registro textual y resultado siguen debajo. En la escena se condensa la información del evento: icono, tipo, actor/objetivo, daño y coste; el mensaje íntegro permanece consultable en el registro. La vista táctica conserva su descripción habitual. A 320 px los bandos siguen en dos columnas y escena/controles debajo, con desplazamiento vertical y sin overflow global.

## Recursos: qué se entrega

**Dos PNG RGBA originales, cada uno con ocho poses en una hoja 4×2, 1536×1024; celdas de 384×512.** No son actores vectoriales articulados, ilustraciones del Lab ni animación final limpiada frame por frame. El SVG sólo recorta y presenta un frame raster, con clipPath explícito para impedir que el letterbox exponga celdas vecinas. CSS combina poses sostenidas con movimiento breve del cuerpo. No hay renderer ni dependencia adicional.

Orden: reposo, anticipación, ataque básico, poder genérico, impacto, bloqueo, esquiva, K.O. Los tres estados de acción no ejecutan reglas. Grim sólo usa poder si un registro válido lo indica; su Invisibilidad de catálogo no se implementa aquí ni produce ese efecto. La pose de poder disponible en su hoja no lo habilita mecánicamente.

Procedencia: OpenAI ImageGen integrado, con dos descripciones textuales originales y una edición de empaquetado por hoja que referencia únicamente el primer resultado propio. No se aportaron imágenes de terceros ni se reutilizó Selene/Kuroe/Orion. La auditoría local no encontró sprites de combate aprobados; sólo arte conceptual del Lab, que quedó aislado. Se comprobó tamaño y transparencia real de los resultados. No se promete autorización legal sobre parecidos accidentales ni acabado comercial: requieren revisión artística y de contenido antes de distribución.

`public/combat-pilot/manifest.json` registra tipo/procedencia, ID, orientación, dimensiones, orden de poses, anclaje aproximado de pies/mano y SHA-256 de cada PNG. `PILOT_SHEET`/`PILOT_ACTORS` son metadatos pequeños de presentación. Anclajes aproximados, margen y línea de apoyo aún varían entre poses generadas. Los originales de la primera iteración se conservaron en output ignorado; sólo las dos hojas seleccionadas se publican. No hay editor ni pipeline universal.

## Integración y autoridad temporal

`pilotModel.ts` consume exclusivamente el adaptador validado de recursos. Resuelve IDs, pose y consecuencia desde el evento estructurado y `trace.attempt`; no consulta fórmulas, analiza message, simula ni modifica el motor, RNG, trace, resultados o guardados. Se mantienen las pruebas de equivalencia anteriores y no se modifica `src/engine/`.

El wrapper puro `pilotTransition` delega cursor y estado a `transition` existente. Añade sólo vista, fase de inspección, serial visual y permiso de animar. El único timeout sigue siendo 2500 ms, dependiente de cursor/status; cambiar vista o pose no lo reinicia. No hay callbacks animationend, timers por actor ni escrituras de recursos desde animaciones.

Cada tick nuevo, estando visible la escena, puede iniciar una única secuencia CSS de 1800 ms. El serial permanece al pausar/reanudar y al rerenderizar: no se reproduce de nuevo la acción actual. Daño y K.O. comparten actionId, pero sólo la resolución con attempt puede producir una acción visual. K.O. sólo mantiene la caída. skip/info no crean ataques, costes ni trayectorias.

| Situación | Presentación |
|---|---|
| Inicial | Reposo, recursos iniciales, sin autoplay. Vista táctica por defecto. |
| Nuevo evento automático en escena | Anticipación 0–324 ms; gesto desde ~324 ms; reacción desde ~630 ms; retorno o caída resueltos antes de 1800 ms. Quedan 700 ms dentro del intervalo. |
| Pausa durante acción | Congela frames, movimiento del cuerpo y trazos CSS en su posición. Los recursos ya corresponden al estado posterior al evento; no retroceden. Las barras conservan su transición breve de v0.2. |
| Continuar | Reanuda esa misma secuencia congelada, sin cambiar serial ni volver a disparar el intento. El timeout retoma la semántica existente de v0.2. |
| Avance manual | Cancela la secuencia anterior y muestra una pose estable de acción/reacción del nuevo evento; no arranca otra película. |
| Salto de ronda | Recursos del evento seleccionado, poses estables de reposo/K.O.; actor/objetivo siguen identificados en el HUD. |
| Cambio de vista | Conserva resultado/cursor/status y el timeout pendiente. Cancela la secuencia visible. Al volver muestra reposo/K.O.; no reanima el evento pasado. El próximo tick real podrá animar. |
| Reinicio | Cancela presentación, conserva vista y vuelve a recursos/poses iniciales. |
| Fin | Estado final del motor, poses estables de reposo/K.O., sin una secuencia pendiente. |
| Salida / nuevo resultado | Se desmontan SVG/animaciones y se limpia el timeout existente. Reentrada o nueva simulación vuelve al inicio y vista táctica. Sin callbacks tardíos que apliquen datos. |

Los números **siempre son posteriores al evento** durante su presentación; las poses de anticipación/reacción no reconstruyen HP/MP intermedios. K.O. se identifica desde HP 0, incluida la resolución anterior a su mensaje. La animación de caída sólo representa ese resultado ya registrado.

## Inspección, accesibilidad y fallback

«Inspección de poses del piloto» permite elegir acción registrada, anticipación, acción, reacción o reposo/K.O. mediante un select nativo, sólo estando pausado/listo/finalizado. Cambia la presentación, no el cursor, recursos, motor ni guardado. Es el método reproducible para capturas de poses; cancela transitorios y no espera animation.finished. Las capturas esperan fuentes, carga de arte y dos frames de composición, con límites de Playwright.

Movimiento reducido elimina desplazamientos y animaciones; conserva las poses completas de evento, nombres, actor, objetivo, daño, coste, HP/MP y K.O. Sin destellos ni sacudidas. Controles con teclado, foco visible, selección de vista mediante botones aria-pressed, sin foco automático por evento ni regiones live para los sprites. El estado del reproductor mantiene su anuncio existente. SVG/hojas son decorativos; nombres y poses tienen texto. No se declara evaluación humana con lector de pantalla.

Con trace ausente/inválido se conserva la presentación clásica y se deshabilita la escena: no se solicitan imágenes ni se fabrican movimientos específicos. Si falla una hoja, se muestra HeroSigil con «Arte no disponible», sin desplazarlo como si fuera un sprite; los recursos, texto, controles y reproducción siguen funcionando.

## Verificación y evidencia

La suite comprueba cruce real h4→e3 (Patrulla, semilla 1024), IDs/nombres duplicados, acierto/fallo/esquiva/bloqueo de poder, acción única antes de K.O., post-evento, inspección manual, pausa CSS, reanudación sin serial nuevo, timer intacto en cambios rápidos de vista, desmontaje, nuevo resultado, persistencia, guardados antiguos, arte ausente, movimiento reducido, axe y overflow. Los escenarios de prueba viven en `tests/fixtures/pilot-scenarios.ts`, separados de producción y generados con el mismo motor sin parchear trace. Para caída reproducible: Grim HP máximo 70 y semilla 1024; primer daño y K.O. comparten a1. Los otros cruces se seleccionan buscando semillas explícitas con resultados reales y se anotan en el reporte.

`pilot-evidence.spec.ts` produce viewport/full en 1366×768, 1440×900, 1920×1080 y 320×720: táctica/escena en reposo y el mismo evento de poder, anticipación, acción, impacto, K.O. y evento posterior, final, movimiento reducido, fallo de carga y guardado antiguo. JSON registra SHA, fixture, semilla, evento/cursor, vista, fase, serial, IDs, poses y dimensiones reales. Vídeo a velocidad normal: Nyra y Grim, pausa/continuación, alternancia, ronda y reinicio. La galería existente añade `pilot.html`, hojas originales y manifiesto; `combat.html` conserva comparación con la base y equivalencia. Mismo workflow de producción y artefacto por SHA. No se crean baselines automáticas.

## Decisiones artísticas para el propietario

1. Contraste de siluetas y proporciones adultas: faldones/brazal de Nyra frente a masa blindada de Grim.
2. Escala y encuadre centrales conservando los diez participantes y controles a 1366×768.
3. Ritmo de anticipación–gesto–reacción y legibilidad de la trayectoria/contacto mínimos.

La auditoría encontró clipping ya presente en los PNG de Grim: 21 píxeles de borde en esquiva (derecha) y caída (izquierda). El visor respeta los límites de escena y no expone celdas vecinas; esos píxeles no se pueden reconstruir con metadatos. Pendiente: editar los dos dibujos recortados, limpieza e inbetweens, pivotes finales, expresiones y ropa definitivas, sprites de los otros ocho, renderer especializado sólo si una necesidad posterior lo justifica, audio y VFX avanzados. Este piloto no aprueba ninguno de esos trabajos.

## Refinamiento del piloto para PR #9

La calibración revisa las ocho celdas de cada hoja. `POSE_ANCHORS` documenta apoyo, contacto y mano/origen cuando la pose lo permite, junto con bounds observados y clipping de origen. `projectPose` conserva el mismo factor corporal por actor y fija cada apoyo en el suelo compartido; no escala cada caja por separado. El actor y los trazos se dibujan en un único SVG con la misma transformación, reflejando pose y escala. La posesión de K.O. se apoya por debajo del cuerpo tendido.

Los cinco beats de la presentación (anticipación, acción, contacto, reacción y reposo) comparten una sola animación CSS de 1800 ms, ligada al serial visual existente. Pausa congela la escena; reanudar sigue el mismo beat. El cursor del reproductor sigue en un único timeout de 2500 ms. Movimiento reducido muestra un beat estable completo sin desplazamientos. Inspección manual permanece fuera del avance del motor. El debug opcional enseña apoyos, manos, contactos y línea de suelo; empieza apagado.

El encuadre ampliado es candidato reversible mediante el selector de revisión; compacto permite comparación y la vista táctica conserva su composición. Las anclas corrigen el salto vertical y posicionan trayectorias; no corrigen anatomía, bordes cortados, dibujo de articulaciones ni continuidad entre los ocho dibujos. Se requiere edición artística posterior para recuperar los bordes de Grim y aprobar siluetas, poses, proporciones y encuadre.
