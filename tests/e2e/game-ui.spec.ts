import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const artifact = (name: string) => `output/playwright/screenshots/${name}.png`;
async function expectNoGlobalOverflow(page: import('@playwright/test').Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
}
async function capture(page: import('@playwright/test').Page, name: string) {
  await page.screenshot({ path: artifact(name), fullPage: true, animations: 'disabled' });
}

test.describe('Game UI review evidence', () => {
  test('inicio, misión, combate, archivo y persistencia', async ({ page }) => {
    await page.goto('/'); await expect(page.getByRole('heading', { name: 'Tu laboratorio. Tu próxima leyenda.' })).toBeVisible();
    await capture(page, '1366-inicio'); await expectNoGlobalOverflow(page);
    await page.getByRole('button', { name: /Avanzar un paso/ }).click();
    await expect(page.getByText('Progreso de misión')).toBeVisible();
    await page.reload(); await expect(page.getByText(/1 \/ 10 pasos/)).toBeVisible();
    await page.getByRole('button', { name: 'Simulador de combate' }).click();
    await page.getByRole('button', { name: /Iniciar simulación/ }).click();
    await expect(page.getByText('Resultado del enfrentamiento')).toBeVisible(); await capture(page, '1366-combate');
    await page.getByRole('button', { name: 'Archivo de reglas' }).click();
    await page.getByRole('tab', { name: /Pasivas/ }).click(); await expect(page.getByText('HABILIDAD PASIVA').first()).toBeVisible();
    await capture(page, '1366-archivo');
    const axe = await new AxeBuilder({ page }).analyze(); expect(axe.violations).toEqual([]);
  });

  test('roster, ficha y retorno conservan el héroe seleccionado', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/'); await page.getByRole('button', { name: 'Mis héroes' }).click();
    await expect(page.getByText('Kael').first()).toBeVisible(); await capture(page, '1440-heroes');
    await page.getByRole('button', { name: 'Consultar ficha' }).first().click();
    await expect(page.getByRole('heading', { name: 'Kael' })).toBeVisible();
    await expect(page.getByText('PRESENTACIÓN PROVISIONAL · SIN ILUSTRACIÓN ASIGNADA')).toBeVisible();
    await expect(page.getByText('HP máximo')).toBeVisible(); await capture(page, '1440-ficha-kael');
    await page.getByRole('button', { name: 'Volver a Mis héroes' }).click();
    await expect(page.getByText('Kael').first()).toBeVisible();
  });

  test('laboratorio conserva SELECT, tabs de teclado y retorno', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/character-lab'); await expect(page.getByRole('heading', { name: 'Selene' })).toBeVisible();
    await page.locator('#character-tab-stats').focus(); await page.keyboard.press('ArrowRight');
    await expect(page.locator('#character-tab-skills')).toBeFocused();
    await expect(page.locator('.edge-select')).toHaveCount(1); await capture(page, '1920-character-lab');
    await page.getByRole('button', { name: 'Seleccionar Kuroe' }).click();
    await expect(page.getByRole('heading', { name: 'Kuroe' })).toBeVisible();
    await page.getByRole('link', { name: 'VOLVER AL JUEGO' }).click(); await expect(page.getByRole('button', { name: 'Centro de control' })).toBeVisible();
  });

  test('320px conserva contenido principal sin overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 }); await page.goto('/'); await expectNoGlobalOverflow(page); await capture(page, '320-inicio');
    await page.getByRole('button', { name: 'Abrir menú' }).click(); await page.getByRole('button', { name: 'Mis héroes' }).click();
    await expectNoGlobalOverflow(page); await page.getByRole('button', { name: 'Consultar ficha' }).first().click();
    await expect(page.getByText('HP máximo')).toBeVisible(); await capture(page, '320-ficha');
  });
});
