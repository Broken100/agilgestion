import { test, expect } from '@playwright/test';

test.describe('POS Sale Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should complete a sale in under 5 seconds', async ({ page }) => {
    await test.step('Login', async () => {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/');
    });

    await test.step('Navigate to POS', async () => {
      await page.click('text=Nueva Venta');
      await page.waitForURL('/pos');
    });

    await test.step('Add product', async () => {
      const startTime = Date.now();
      await page.fill('input[placeholder*="Código"]', '7501234567890');
      await page.click('button:has-text("+")');
      await page.waitForSelector('text=Coca Cola');
      const addTime = Date.now() - startTime;
      expect(addTime).toBeLessThan(5000);
    });

    await test.step('Cobrar', async () => {
      await page.click('button:has-text("Cobrar")');
      await page.waitForURL('/pos/confirmar');
    });

    await test.step('Confirm payment', async () => {
      await page.click('button:has-text("Confirmar Venta")');
      await page.waitForSelector('text=¡Venta registrada!');
    });
  });

  test('dashboard shows daily sales', async ({ page }) => {
    await test.step('Login and view dashboard', async () => {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/');
    });

    await test.step('Verify dashboard loads', async () => {
      await expect(page.locator('text=Ventas del Día')).toBeVisible();
      await expect(page.locator('text=transacciones')).toBeVisible();
    });
  });

  test('offline sale is queued', async ({ page, context }) => {
    await test.step('Go offline', async () => {
      await context.setOffline(true);
    });

    await test.step('Create sale while offline', async () => {
      await page.goto('/pos');
      await page.fill('input[placeholder*="Código"]', '7501234567890');
      await page.click('button:has-text("+")');
      await page.click('button:has-text("Cobrar")');
      await page.click('button:has-text("Confirmar Venta")');
      await expect(page.locator('text=offline')).toBeVisible();
    });

    await test.step('Go back online and sync', async () => {
      await context.setOffline(false);
      await page.click('button:has-text("Sincronizar")');
    });
  });
});