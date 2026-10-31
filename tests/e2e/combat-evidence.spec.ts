import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { INITIAL_SAVE, PLAYER_TEAM, ENEMIES } from '../../src/data/demo';
import { simulateCombat } from '../../src/engine/simulator';
test.use({ video: { mode: 'on', size: { width: 1366, height: 768 } } });
const phase = process.env.EVIDENCE_PHASE || 'after';
const sha = process.env.EVIDENCE_SHA || execFileSync('git', ['rev-parse', 'HEAD']).toString().trim();
const fixture = { ...INITIAL_SAVE, battles: 1, seed: 1024, lastBattle: simulateCombat(PLAYER_TEAM, ENEMIES.patrulla.heroes, 1024) };
for (const [width, height] of [[1366,768],[1440,900],[1920,1080],[320,720]]) {
  test(`combat candidate ${phase} ${width}x${height}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(save => localStorage.setItem('vyrathen-v01', JSON.stringify(save)), fixture);
    await page.goto('/');
    if (width < 900) await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.getByRole('navigation').getByRole('button', { name: 'Simulador de combate', exact: true }).click();
    const dir = `output/playwright/combat-${phase}`;
    mkdirSync(dir, { recursive: true });
    const prefix = `${dir}/${process.platform}-${width}x${height}`;
    const captures: unknown[] = [];
    async function capture(state: string) {
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(document.getAnimations().filter(a => a.effect?.getComputedTiming().iterations !== Infinity).map(a => a.finished.catch(() => {})));
        window.scrollTo({ top: 0, behavior: 'instant' });
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      });
      const dimensions = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, fonts: document.fonts.status }));
      expect(dimensions.scrollWidth).toBe(width);
      const event = phase === 'after' ? await page.getByLabel('Evento actual').textContent() : 'Legacy BattleReport';
      captures.push({ state, dimensions, event });
      for (const fullPage of [false,true]) {
        const path = `${prefix}-${state}-${fullPage ? 'full' : 'viewport'}.png`;
        await page.screenshot({ path, fullPage, animations: 'disabled' });
        await info.attach(state, { path, contentType: 'image/png' });
      }
      writeFileSync(`${prefix}.json`, JSON.stringify({ sha, phase, fixture, captures, status: 'candidate_pending_owner_approval' }, null, 2));
    }
    if (phase === 'after' && width >= 1366) await expect(page.getByRole('button', { name: 'Avanzar un evento' })).toBeInViewport({ ratio: 1 });
    await capture('initial');
    if (phase === 'before') return;
    await page.getByRole('button', { name: 'Avanzar un evento' }).click();
    await capture('paused-event-1');
    await page.getByRole('button', { name: 'Ir al final' }).click();
    await capture('final');
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
