import { test, expect } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { INITIAL_SAVE, PLAYER_TEAM, ENEMIES } from '../../src/data/demo';
import { simulateCombat } from '../../src/engine/simulator';
import type { CombatResult } from '../../src/engine/types';
test.use({ video: { mode: 'on', size: { width: 1366, height: 768 } } });
const phase = process.env.EVIDENCE_PHASE || 'after';
const sha = process.env.EVIDENCE_SHA || execFileSync('git', ['rev-parse', 'HEAD']).toString().trim();
const fixture = { ...INITIAL_SAVE, battles: 1, seed: 1024, lastBattle: simulateCombat(PLAYER_TEAM, ENEMIES.patrulla.heroes, 1024) };
const legacyBattle = JSON.parse(readFileSync(new URL('../fixtures/combat-v01-1024.json', import.meta.url), 'utf8')) as CombatResult;
for (const [width, height] of [[1366,768],[1440,900],[1920,1080],[320,720]]) {
  test(`combat candidate ${phase} ${width}x${height}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(save => {
      if (!localStorage.getItem('vyrathen-v01')) localStorage.setItem('vyrathen-v01', JSON.stringify(save));
    }, fixture);
    await page.goto('/');
    if (width < 900) await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.getByRole('navigation').getByRole('button', { name: 'Simulador de combate', exact: true }).click();
    const dir = `output/playwright/combat-${phase}`;
    mkdirSync(dir, { recursive: true });
    const prefix = `${dir}/${process.platform}-${width}x${height}`;
    const captures: unknown[] = [];
    let activeBattle = fixture.lastBattle;
    let cursor = -1;
    async function seek(index: number) {
      const events = activeBattle.rounds.flatMap(r => r.events);
      const round = activeBattle.rounds.find(r => r.events.some(e => e.id === events[index].id))!;
      await page.getByLabel('Inspeccionar ronda').selectOption(String(round.round));
      const first = events.findIndex(e => e.id === round.events[0].id);
      for (let i = first; i < index; i++) await page.getByRole('button', { name: 'Avanzar un evento' }).click();
      cursor = index;
      await expect(page.getByLabel('Evento actual')).toContainText(`EVENTO ${index + 1} DE`);
    }
    async function capture(state: string) {
      await expect(page.getByRole('button', { name: 'Pausar', exact: true })).toHaveCount(0);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(document.getAnimations().filter(a => a.effect?.getComputedTiming().iterations !== Infinity).map(a => a.finished.catch(() => {})));
        window.scrollTo({ top: 0, behavior: 'instant' });
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      });
      const dimensions = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, fonts: document.fonts.status }));
      expect(dimensions.scrollWidth).toBe(width);
      if (width >= 1366) await expect(page.getByRole('button', { name: 'Avanzar un evento' })).toBeInViewport({ ratio: 1 });
      const event = await page.getByLabel('Evento actual').textContent();
      const actualCursor = await page.getByLabel('Reproducción del encuentro').getAttribute('data-cursor');
      if (actualCursor !== null) expect(Number(actualCursor)).toBe(cursor);
      const recordVersion = (activeBattle as CombatResult & { trace?: { version: number } }).trace?.version ?? null;
      captures.push({ state, dimensions, event, cursor, recordVersion, eventId: activeBattle.rounds.flatMap(r => r.events)[cursor]?.id ?? null,
        fixture: state === 'legacy-fallback' ? 'actual-v01-patrulla-1024' : 'patrulla-1024',
        presentation: await page.getByLabel('Reproducción del encuentro').getAttribute('data-recording') ?? 'legacy',
      });
      for (const fullPage of [false,true]) {
        const path = `${prefix}-${state}-${fullPage ? 'full' : 'viewport'}.png`;
        await page.screenshot({ path, fullPage, animations: 'disabled' });
        await info.attach(state, { path, contentType: 'image/png' });
      }
      writeFileSync(`${prefix}.json`, JSON.stringify({ sha, phase, fixture, legacyFixtureBase: 'c03c8b5702f947196b86ffa7bb30f7f256f66da2', captures, status: 'candidate_pending_owner_approval' }, null, 2));
    }
    if (phase === 'after' && width >= 1366) await expect(page.getByRole('button', { name: 'Avanzar un evento' })).toBeInViewport({ ratio: 1 });
    await capture('initial');
    await seek(0);
    await capture('paused-event-1');
    await capture('power-mp');
    await seek(1);
    await capture('damage-hp');
    const events = activeBattle.rounds.flatMap(r => r.events);
    const ko = events.findIndex((e, index) => e.kind === 'ko' && index < events.length - 1);
    expect(ko).toBeGreaterThanOrEqual(0);
    await seek(ko + 1);
    await capture('ko-persistent');
    await page.getByRole('button', { name: 'Ir al final' }).click();
    cursor = events.length - 1;
    await capture('final');
    activeBattle = legacyBattle;
    cursor = -1;
    await page.evaluate(save => localStorage.setItem('vyrathen-v01', JSON.stringify(save)), { ...fixture, lastBattle: legacyBattle });
    await page.reload();
    if (width < 900) await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.getByRole('navigation').getByRole('button', { name: 'Simulador de combate', exact: true }).click();
    await seek(0);
    await capture('legacy-fallback');
  });
}
test('combat vídeo normal: play pause step round restart', async ({ page }) => {
  test.skip(phase === 'before');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(save => localStorage.setItem('vyrathen-v01', JSON.stringify(save)), fixture);
  await page.goto('/');
  await page.getByRole('navigation').getByRole('button', { name: 'Simulador de combate', exact: true }).click();
  await page.getByRole('button', { name: 'Continuar reproducción' }).click();
  await expect(page.getByLabel('Evento actual')).toContainText('EVENTO 2 DE', { timeout: 8000 });
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await page.getByRole('button', { name: 'Avanzar un evento' }).click();
  await page.getByLabel('Inspeccionar ronda').selectOption('5');
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Reiniciar reproducción' }).click();
  await page.waitForTimeout(600);
});
