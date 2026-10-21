import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const evidenceDir = 'output/playwright/screenshots';
const commit = process.env.EVIDENCE_SHA || execFileSync('git', ['rev-parse', 'HEAD']).toString().trim();
const captures: Array<{ name: string; viewport: { width: number; height: number } | null; rendered: { innerWidth: number; innerHeight: number; clientWidth: number; scrollWidth: number } }> = [];

async function waitForMeaningfulContent(page: Page, locator: ReturnType<Page['locator']>) {
  await expect(locator).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await Promise.all([...document.images].map(image => image.complete
      ? Promise.resolve()
      : new Promise<void>((resolve, reject) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => reject(new Error(`No se pudo cargar ${image.currentSrc || image.src}`)), { once: true });
      })));
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
}

async function expectNoGlobalOverflow(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
}

async function capture(page: Page, name: string, viewportOnly = false) {
  await expectNoGlobalOverflow(page);
  const rendered = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  const viewport = page.viewportSize();
  expect(rendered.innerWidth).toBe(viewport?.width);
  expect(rendered.innerHeight).toBe(viewport?.height);
  mkdirSync(evidenceDir, { recursive: true });
  const filename = `v01-after-${process.platform}-chromium-${rendered.innerWidth}x${rendered.innerHeight}-${name}${viewportOnly ? '-viewport' : '-full'}`;
  await page.screenshot({ path: `${evidenceDir}/${filename}.png`, fullPage: !viewportOnly, animations: 'disabled' });
  captures.push({ name: filename, viewport, rendered });
  writeFileSync('output/playwright/review-metadata.json', JSON.stringify({
    status: 'candidate_pending_owner_approval',
    commit,
    captures,
    generatedFrom: 'measured_browser_viewport',
  }, null, 2));
}

test.describe('Game UI review evidence', () => {
  test('inicio, misión, combate, archivo y persistencia', async ({ page }) => {
    await page.goto('/');
    await waitForMeaningfulContent(page, page.getByRole('heading', { name: 'Laboratorio Aurora' }));
    await capture(page, '1366-inicio');
    await page.getByRole('button', { name: /Avanzar un paso/ }).click();
    await expect(page.getByText('Progreso de misión')).toBeVisible();
    await page.reload();
    await waitForMeaningfulContent(page, page.getByText(/1 \/ 10 pasos/));
    await page.getByRole('button', { name: 'Simulador de combate' }).click();
    await page.getByRole('button', { name: /Iniciar simulación/ }).click();
    await expect(page.getByText('Resultado del enfrentamiento')).toBeVisible();
    await capture(page, '1366-combate');
    await page.getByRole('button', { name: 'Archivo de reglas' }).click();
    await page.getByRole('tab', { name: /Pasivas/ }).click();
    await expect(page.getByText('HABILIDAD PASIVA').first()).toBeVisible();
    await expect(page.getByRole('tabpanel', { name: /Pasivas/ })).toBeVisible();
    await capture(page, '1366-archivo');
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations).toEqual([]);
  });

  test('roster, ficha y retorno conservan un héroe no inicial y el foco', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForMeaningfulContent(page, page.getByRole('heading', { name: 'Laboratorio Aurora' }));
    await page.getByRole('button', { name: 'Mis héroes' }).click();
    await expect(page.getByText('Vesper').first()).toBeVisible();
    await capture(page, '1440-heroes');
    const opener = page.getByRole('button', { name: 'Consultar ficha de Vesper' });
    await opener.click();
    await expect(page.getByRole('heading', { name: 'Vesper' })).toBeVisible();
    await expect(page.locator('.vyr-profile-class')).toContainText('Psico');
    await expect(page.locator('.vyr-profile-class')).toContainText('NIVEL 07');
    await expect(page.getByText('HP máximo')).toBeVisible();
    await expect(page.getByText('330')).toBeVisible();
    await expect(page.locator('.hero-profile')).toHaveCSS('animation-name', 'none');
    await expectNoGlobalOverflow(page);
    await capture(page, '1440-ficha-vesper');
    await capture(page, '1440-ficha-vesper', true);
    await page.getByRole('button', { name: 'Volver a Mis héroes' }).click();
    await expect(opener).toBeFocused();
    await expect(page.getByText('Vesper').first()).toBeVisible();
  });

  test('laboratorio conserva SELECT, captura Stats completa y recorre movimiento y tabs', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/character-lab');
    await waitForMeaningfulContent(page, page.getByRole('heading', { name: 'Selene' }));
    await page.getByRole('button', { name: 'Seleccionar Kuroe' }).click();
    await expect(page.getByRole('heading', { name: 'Kuroe' })).toBeVisible();
    await expect(page.locator('.switch-overlay')).toHaveCount(0);
    await page.locator('#character-tab-stats').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#character-tab-skills')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#character-tab-stats')).toBeFocused();
    await expect(page.locator('.edge-select')).toHaveCount(1);
    await expect(page.locator('#character-tab-stats')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.stat-row')).toHaveCount(6);
    await capture(page, '1920-character-lab-stats');
    await capture(page, '1920-character-lab-stats', true);
    await page.getByRole('link', { name: 'VOLVER AL JUEGO' }).click();
    await expect(page.getByRole('button', { name: 'Centro de control' })).toBeVisible();
  });

  test('320px espera contenido, respeta movimiento reducido y conserva la ficha sin overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForMeaningfulContent(page, page.getByRole('heading', { name: 'Laboratorio Aurora' }));
    await capture(page, '320-inicio');
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.getByRole('button', { name: 'Mis héroes' }).click();
    await page.getByRole('button', { name: 'Consultar ficha de Vesper' }).click();
    await expect(page.getByRole('heading', { name: 'Vesper' })).toBeVisible();
    await expect(page.locator('.hero-profile')).toHaveCSS('animation-name', 'none');
    await expectNoGlobalOverflow(page);
    await capture(page, '320-ficha-vesper');
  });
});
