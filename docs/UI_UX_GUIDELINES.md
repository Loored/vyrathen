# UI/UX — criterios del producto (modernidad con sistemas fieles)

**Decisión estable:** modernizar interfaz/experiencia por completo; preservar nombres/mecánicas verificadas, no imitar navegación por tablas ni microtipografía del sitio antiguo. La v0.1 ya emplea un tema oscuro sci-fi con acentos menta/violeta/azul/naranja: conservar continuidad inicialmente, mejorar problemas detectados antes de rediseñar todo.

## Principios
1. **Primero el sistema, luego el ornamento.** El jugador debe entender inventario, riesgo, recursos y resultado de cada acción.
2. **Información progresiva.** Resumen claro y detalles expandibles; no abrumar con todas las estadísticas en una sola tarjeta.
3. **Consistencia.** Estructura compartida para cards, badges, recursos, barras, dialogs, filtros, tablas y feedback.
4. **Decisiones reversibles y transparentes.** Antes de gastar turnos/MP, mostrar coste, recompensa esperada y restricciones; confirmar sólo acciones destructivas.
5. **Sensación de RPG táctico.** Identidad de los 4 tipos y héroes reconocible, sin que la interfaz parezca un panel administrativo genérico.
6. **Representación honesta.** Si el combate usa fórmula provisional, revelarlo sin llenar la vista principal de avisos repetidos.

## Diseño visual (orientativo, no pixel-perfect)
- Base oscura sobria con superficies discretas; un color primario de acción (menta) y acentos semánticos para tipos/estados. No usar a la vez demasiados colores saturados, gradientes brillantes o efectos glass.
- Mantener familias de tokens `--bg, --panel, --panel2, --surface, --border, --text, --muted` y `--mint, --violet, --blue, --orange` existentes, pero agruparlos y mejorarlos en una hoja de tokens al crecer el proyecto.
- Escala espacial preferida en múltiplos de 4 px; sistema tipográfico legible (texto de cuerpo objetivo >=14–16 px). **Auditar microtextos de la v0.1**: tiene textos de 9–12 px en tarjetas y rankings; elevar lectura y contraste como parte de v0.2.
- Tipos: Psico (violeta), Energía (ámbar), Defensa (azul), Control (verde/menta); además del color mostrar **nombre, icono y ayuda textual**.
- Diseñar layout fluido; navegación lateral escritorio y menú accesible móvil; evitar desbordes de paneles, tablas y grids. Soportar 320 px sin scroll horizontal global.
- Animación discreta y funcional (resaltar turnos, barras, eventos), con reducción/desactivación al solicitarla el sistema. Evitar animaciones prolongadas de combate que bloqueen el registro.

## Accesibilidad obligatoria
- Objetivo WCAG 2.2 AA: contraste texto normal >=4.5:1, texto grande e indicadores visuales esenciales >=3:1 cuando corresponda; estados no codificados sólo por color.
- Navegación por teclado completa, foco visible, nombres accesibles de iconos/botones; orden de tab lógico y retorno de foco al cerrar diálogos.
- Touch targets preferidos ~44×44 px cuando el espacio permita; no exigir precisión fina para acciones comunes.
- Usar HTML semántico; `button` para acciones, `a` para navegación; tablas para datos comparables. Confirmar con lector de pantalla cuando haya medio.
- Respetar `prefers-reduced-motion`; no parpadear ni usar efectos intensos; alternativa textual para ilustraciones informativas.
- Feedback de actualización de recursos/combate por mensajes adecuados (`aria-live` cuando útil, sin spam por cada evento).

## Arquitectura de información del MVP
- **Centro de control:** estado de laboratorio, recursos, turnos, próximos objetivos, acciones recomendadas; jerarquía clara.
- **Héroes:** cinco titulares, tipo, poder, pasiva, salud/MP/fatiga, comparar/cambiar selección; aclarar lo no implementado.
- **Combate:** equipos enfrentados + score por tipo + tablero + log de 10 rondas, controles pausar/continuar/replay y semilla visible.
- **Misiones:** requisitos, ciudad, pasos, coste estimado, recompensas, progreso persistente, estados de misión.
- **Archivo:** descripción completa de poderes/estructuras con fuente y año; búsqueda/filtrado y leyenda de procedencia.

## Patrón de combate v0.2
- Encabezado: quién ataca/defiende, equipo activo, semilla y condición de victoria.
- Zona central: tablero responsivo, posiciones, movimiento y acción actual, con fallback textual.
- Panel complementario: ronda 1–10 seleccionable, eventos estructurados (actor → acción → objetivo → resultado), enlaces a habilidades.
- Al finalizar: K.O. por bando, victoria/derrota, regla de desempate, recursos usados y opción repetir.
- Mostrar acciones históricamente **desconocidas** como simulación del remake, sin prometer exactitud del PHP.

## Estados UI a cubrir por feature
Vacío, carga (si aplica), error, éxito, sin permisos/no disponible, límite de recursos, fallo de validación, confirmación destructiva. Si una mecánica no existe aún, explicar que está en desarrollo; no agregar botones falsamente funcionales.

## Criterios de aceptación para PR visual
- Capturas/verificación 320 px, ~768 px y desktop; sin overflow ni texto cortado.
- Funciona con teclado y foco, contraste revisado, zoom de texto 200% razonable.
- Información principal comprensible sin hover ni depender de animación.
- Ningún botón decorativo que sugiera funcionalidad inexistente.
- Estados y feedback explican consecuencias; costes/datos no históricos marcados cuando importan.

## Dirección visual complementaria
Para evitar un aspecto de aplicación de gestión genérica, consultar obligatoriamente `docs/VISUAL_DIRECTION.md` antes de cualquier cambio visual sustancial. Referencias a juegos modernos son inspiración de principios, nunca copia de assets o layouts.
