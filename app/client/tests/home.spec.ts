import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('shows FashionHub heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('FashionHub');
  });

  test('shows featured products section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Featured Products')).toBeVisible();
  });

  test('displays at least 1 product card', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Slim-fit Denim Jacket')).toBeVisible();
  });

  test('displays 8 featured products', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('text=/^Slim-fit|Cashmere|Linen|Tailored|Cotton|Silk Wrap|Denim Skirt|Knit Cardigan/');
    await expect(cards).toHaveCount(8);
  });

  test('product cards have prices', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=$89.00')).toBeVisible();
  });
});
