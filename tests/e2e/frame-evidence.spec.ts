import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { INITIAL_SAVE } from '../../src/data/demo';

// Candidates only. The same fixture, browser and measured sizes serve before/after review.
const phase = process.env.EVIDENCE_PHASE || 'after';
const sha = process.env.EVIDENCE_SHA || execFileSync('git', ['rev-parse', 'HEAD']).toString().trim();
const environment = `${process.platform}-chromium-production`;
const directory = `output/playwright/characters-${phase}`;

for (const [width, height] of [[1366, 768], [1440, 900], [1920, 1080], [320, 720]]) {
  test(`frame candidate ${phase} ${width}x${height}`, async ({ page, browserName }, testInfo) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height });
    await page.addInitScript(save => {
      if (!localStorage.getItem('vyrathen-v01')) localStorage.setItem('vyrathen-v01', JSON.stringify(save));
    }, INITIAL_SAVE);
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Avanzar un paso/ })).toBeVisible();
    mkdirSync(directory, { recursive: true });
    const name = `v1-characters-${phase}-${environment}-${width}x${height}`;
    const captures: unknown[] = [];
    async function capture(section: string) {
      await page.evaluate(async () => {
        // Focus restoration can scroll a long roster. Compare the same top-of-page
        // viewport in both revisions; keyboard/focus behavior is verified separately.
        window.scrollTo({ top: 0, behavior: 'instant' });
        await document.fonts.ready;
        await Promise.all([...document.images].map(image => image.decode()));
        await Promise.all(document.getAnimations().filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {})));
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      });
      const dimensions = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollX, scrollY, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, fonts: document.fonts.status }));
      expect(dimensions.width).toBe(width);
      expect(dimensions.height).toBe(height);
      expect(dimensions.scrollWidth).toBe(width);
      for (const fullPage of [false, true]) {
        const file = `${directory}/${name}-${section}-${fullPage ? 'full' : 'viewport'}.png`;
        await page.screenshot({ path: file, fullPage, animations: 'disabled' });
        await testInfo.attach(`${section}-${fullPage ? 'full' : 'viewport'}`, { path: file, contentType: 'image/png' });
      }
      captures.push({ section, dimensions });
      writeFileSync(`${directory}/${name}.json`, JSON.stringify({ sha, phase, environment, browserName, captures, fixture: INITIAL_SAVE, status: 'candidate_pending_owner_approval' }, null, 2));
    }
    await capture('inicio');
    async function navigate(label: string) {
      if (width <= 900) await page.getByRole('button', { name: 'Abrir menú' }).click();
      await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('button', { name: label, exact: true }).click();
    }
    if (width <= 900) {
      await page.getByRole('button', { name: 'Abrir menú' }).click();
      await capture('menu-abierto');
      await page.keyboard.press('Escape');
    }
    await navigate('Mis héroes');
    await expect(page.getByRole('heading', { name: 'Tu escuadrón', exact: true })).toBeVisible();
    await capture('heroes');
    await page.getByRole('button', { name: 'Consultar ficha de Vesper' }).click();
    await expect(page.getByRole('heading', { name: 'Vesper', exact: true })).toBeVisible();
    await capture('ficha-vesper');
    await page.getByRole('button', { name: 'Volver a Mis héroes' }).click();
    await expect(page.getByRole('button', { name: 'Consultar ficha de Vesper' })).toBeFocused();
    await capture('heroes-retorno-vesper');
    if (phase === 'before') return;
    await page.getByRole('button', { name: 'Consultar ficha de Vesper' }).click();
    await page.getByRole('button', { name: 'Abrir simulador' }).click();
    await expect(page.getByRole('heading', { name: 'Cámara de combate' })).toBeVisible();
    await capture('combate');
    await navigate('Archivo de reglas');
    await page.getByRole('tab', { name: /Pasivas/ }).click();
    await expect(page.getByRole('tabpanel', { name: /Pasivas/ })).toBeVisible();
    await capture('archivo');
    if (width <= 900) await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.getByRole('link', { name: /Character Lab/ }).click();
    await expect(page.getByRole('heading', { name: 'Selene' })).toBeVisible();
    await page.getByRole('button', { name: 'Seleccionar Kuroe' }).click();
    await expect(page.getByRole('heading', { name: 'Kuroe' })).toBeVisible();
    await expect(page.locator('.switch-overlay')).toHaveCount(0);
    await capture('character-lab');
  });
}
