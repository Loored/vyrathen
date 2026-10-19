# Matriz de origen / fidelidad · versión 0.1

Esta reconstrucción no contiene el backend PHP del Soulheroes original. El manual público conservado (`biblioteca.php`, 2010-03-02; SHA-256 `9e5e82f3d29f72c167fa401f31686fe6693fb9434b285561abb267f756b84ded`) permite recuperar ciertas reglas, pero no sus implementaciones precisas.

| Regla o mecánica | Procedencia | Implementada | Observación |
|---|---|---|---|
| 5 héroes por bando | Documento 2010 | Sí | Combate 5v5 demo |
| 10 rondas | Documento 2010 | Sí | Se conservan 10 snapshots; cese al faltar bando es diseño demo |
| Ciclo Defensa > Psico > Energía > Control > Defensa | Documento 2010 | Sí | Par a par, demostración 13:1 |
| Conversión de los puntos de tipos en bonus | Documento incompleto | **No** | Manual menciona hasta +65%, pero no da fórmula |
| Victoria por número de K.O. | Documento 2010 | Sí | Empate => defensor |
| Victoria especial contra boss | Documento 2010 | Sólo helper puro | Aún no hay raid jugable |
| Fórmulas *aproximadas* de seis poderes | Documento 2010 | Sí | Uso como **magnitud nominal**, no daño histórico final |
| Coste general MP = 5×nivel, excepciones conocidas | Documento 2010 | Sí en catálogo/engine | No se activan prebuffs ni efectos especiales |
| 24 poderes / 15 pasivas nombrados | Documento 2010 | Sí como catálogo | No todos tienen ejecución en combate |
| Espejo, Elástico, Absorber | Página de 2012 | Sólo mención | No existen reglas documentadas |
| Misión Pekín nivel 1, 10 pasos, 12M USD por nivel | Documento 2010 | Sí en demo | **1 turno/paso** es decisión nueva |
| Stats iniciales de cinco héroes | Nuevos (demo) | Sí | No son datos originales |
| Orden de iniciativa y probabilidad de actuar | Nuevos (demo) | Sí | Dependen de `speed` mediante fórmulas nuevas |
| IA / targeting / bloqueo / esquiva / mitigación | Nuevos (demo) | Sí | Algoritmos **no históricos** |
| Laboratorio / recursos iniciales | Nuevos (demo) | Sí | No están balanceados contra economía original |
| 16 edificios y árbol | Documento 2010 + imagen 2010-11 | Sólo consulta | Sin costes recuperados; construcción bloqueada |
| Persistencia | Diseño nuevo | Sí | `localStorage`, no servidor compartido |

## Versionado y método

- **Reglas textuales:** datos en `src/data/poderes.json` y `src/data/pasivas.json`, parafraseados para la alfa a partir de `.private/research/reports/Etapa13/catalogo_*_2010.csv`.
- **Reglas ejecutables documentadas:** `src/engine/rules.ts`.
- **Comportamiento provisional:** `src/engine/simulator.ts`, anotado; se puede sustituir sin alterar UI ni archivos históricos.
- **Datos de demostración:** `src/data/demo.ts`.
- **Pruebas:** `tests/engine.test.ts`.

### Cosas expresamente pendientes

1. Inicio de sesión real, multijugador, clanes, mercados y temporadas.
2. Movimiento en casillas, alcance, estados, moral y habilidades precombate.
3. Daño final históricamente exacto y efectos de las pasivas.
4. Misiones cooperativas, bosses, joyas y estructuras construibles.
5. Backend y auditoría de abuso; **no** se asumen APIs PHP recuperadas.

Para cambiar algoritmos, etiquetar el origen del cambio y adjuntar evidencia antes de llamarlo histórico.

> La captura de la estructura es material histórico privado y **no se muestra ni se distribuye** con la versión pública de Vyrathen. Se sustituirá por arte propio.
