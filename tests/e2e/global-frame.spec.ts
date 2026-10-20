import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { INITIAL_SAVE } from '../../src/data/demo';

async function audit(page: Page) {
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test('HUD, Inicio, teclado, foco visible y recorridos principales accesibles', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Laboratorio Aurora' })).toBeVisible();
  await audit(page);
  for (const selector of ['.vyr-frame-resources', '.vyr-home-formation', '.vyr-home-mission', '.vyr-home-simulator .game-action']) {
    await expect(page.locator(selector)).toBeInViewport({ ratio: 1 });
  }
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  await page.keyboard.press('Tab');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(nav.getByRole('button', { name: 'Centro de control' })).toBeFocused();
  await expect(nav.getByRole('button', { name: 'Centro de control' })).toHaveAttribute('aria-current', 'page');
  expect(await page.locator(':focus').evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Tu escuadrón', exact: true })).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Mis héroes' })).toHaveAttribute('aria-current', 'page');
  await audit(page);
  await page.getByRole('button', { name: 'Consultar ficha de Vesper' }).click();
  await expect(page.getByRole('heading', { name: 'Vesper', exact: true })).toBeVisible();
  await audit(page);
  await page.getByRole('button', { name: 'Volver a Mis héroes' }).click();
  await expect(page.getByRole('button', { name: 'Consultar ficha de Vesper' })).toBeFocused();
  await page.getByRole('button', { name: 'Consultar ficha de Vesper' }).click();
  await page.getByRole('button', { name: 'Abrir simulador' }).click();
  await expect(page.getByRole('heading', { name: 'Cámara de combate' })).toBeVisible();
  await audit(page);
  await nav.getByRole('button', { name: 'Archivo de reglas' }).click();
  await audit(page);
  const firstTab = page.getByRole('tab', { name: /Poderes/ });
  await firstTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /Pasivas/ })).toBeFocused();
  await audit(page);
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: /Estructuras/ })).toBeFocused();
  await audit(page);
});

test('misión: coste, confirmación, recompensa y guardado v1 sobreviven al Lab', async ({ page }) => {
  await page.addInitScript(save => {
    if (!localStorage.getItem('vyrathen-v01')) localStorage.setItem('vyrathen-v01', JSON.stringify({ ...save, questProgress: 9, turns: 1 }));
  }, INITIAL_SAVE);
  await page.goto('/');
  await expect(page.getByText('Siguiente paso:', { exact: false })).toContainText('−1 turno');
  await page.getByRole('button', { name: 'Avanzar un paso' }).click();
  await expect(page.getByRole('status')).toContainText('10 / 10 pasos. −1 turno · 0 disponibles.');
  await page.reload();
  await page.getByRole('button', { name: 'Reclamar recompensa' }).click();
  await expect(page.getByRole('status')).toContainText('+$12,000,000');
  await expect(page.getByRole('button', { name: 'Avanzar un paso' })).toBeDisabled();
  await expect(page.getByText('Sin turnos disponibles para avanzar.')).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('vyrathen-v01')!));
  expect(saved).toMatchObject({ version: 1, funds: 14400000, turns: 0, questProgress: 0, questCompletions: 1, seed: INITIAL_SAVE.seed });
  await page.getByRole('link', { name: /Character Lab/ }).click();
  await expect(page.getByRole('heading', { name: 'Selene' })).toBeVisible();
  await expect(page.locator('.edge-select')).toHaveCount(1);
  await page.getByRole('link', { name: 'VOLVER AL JUEGO' }).click();
  await expect(page.getByRole('heading', { name: 'Laboratorio Aurora' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('vyrathen-v01')!))).toEqual(saved);
  await audit(page);
});

test('menú móvil: foco contenido, Escape, retorno, navegación y movimiento reducido', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  const open = page.getByRole('button', { name: 'Abrir menú' });
  await open.click();
  const dialog = page.getByRole('dialog', { name: 'Navegación del juego' });
  await expect(dialog.getByRole('button', { name: 'Cerrar menú' })).toBeFocused();
  await expect(open).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Reiniciar demo' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Cerrar menú' })).toBeFocused();
  await audit(page);
  await page.keyboard.press('Escape');
  await expect(open).toBeFocused();
  await expect(open).toHaveAttribute('aria-expanded', 'false');
  for (const label of ['Mis héroes', 'Simulador de combate', 'Archivo de reglas', 'Centro de control']) {
    await open.click();
    await dialog.getByRole('button', { name: label, exact: true }).click();
    await expect(page.locator('#game-content')).toBeFocused();
    await expect(page.locator('.vyr-frame-section')).toHaveCSS('animation-name', 'none');
    await audit(page);
  }
  await open.click();
  await page.setViewportSize({ width: 1366, height: 768 });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.vyr-frame-body')).not.toHaveAttribute('inert', '');
});

test('vídeo de navegación y feedback real con movimiento normal', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Laboratorio Aurora' })).toBeVisible();
  await page.waitForTimeout(900); // Hold readable states for the review video.
  await page.getByRole('button', { name: 'Avanzar un paso' }).click();
  await expect(page.getByRole('status')).toContainText('1 / 10 pasos');
  await page.waitForTimeout(1400);
  await page.getByRole('button', { name: 'Cerrar aviso' }).click();
  await page.getByRole('button', { name: 'Ver escuadrón' }).click();
  await page.getByRole('button', { name: 'Consultar ficha de Vesper' }).click();
  await page.waitForTimeout(900);
  await page.getByRole('button', { name: 'Volver a Mis héroes' }).click();
  await page.getByRole('button', { name: 'Simulador de combate', exact: true }).click();
  await page.getByRole('button', { name: /Iniciar simulación/ }).click();
  await page.waitForTimeout(1400);
  await page.getByRole('button', { name: 'Archivo de reglas', exact: true }).click();
  await page.waitForTimeout(900);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.vyr-frame-section')).toHaveCSS('animation-name', 'none');
});
