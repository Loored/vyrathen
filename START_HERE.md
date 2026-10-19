# Vyrathen — Inicio rápido para Codex y GitHub

## Ya tienes repo público
1. **No** copies `research/` ni `.private/` de otros ZIP al repositorio.
2. Extrae este paquete. Copia el **contenido interno** de `vyrathen/` a tu repositorio. Si ya cambiaste código, revisa el diff antes de sobrescribir.
3. Revisa `docs/PUBLICATION_CHECKLIST.md`, especialmente arte original y nombres de habilidades de la alfa.
4. Ejecuta `npm install`, `npm test`, `npm run typecheck`, `npm run build` y `npm run dev`.
5. Con Codex abierto en la raíz lee `AGENTS.md` y `docs/CODEX_KICKOFF.md`.

## Paquetes
- `Vyrathen_GitHub_Publico.zip`: código + instrucciones sin fuentes históricas brutas.
- `Vyrathen_Codex_Contexto_Ligero.zip`: sólo `AGENTS.md` y `docs/`; superponer con cuidado a repos modificados.
- `Vyrathen_Codex_Completo_PRIVADO.zip`: código + `.private/research/`; NO publicar investigación de terceros.

**Advertencia:** `AGENTS.md` es persistente, pero Codex debe leer sólo los documentos pertinentes a cada tarea. No se verificó la compilación de producción con dependencias oficiales durante el empaquetado; revalidar en tu entorno.
