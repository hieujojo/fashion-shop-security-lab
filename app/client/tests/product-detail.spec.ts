import { test, expect } from '@playwright/test';

test.describe('Product Detail page', () => {
  test('shows product info and reviews', async ({ page }) => {
    await page.goto('/products/1');
    await expect(page.locator('h1')).toHaveText('Slim-fit Denim Jacket');
    await expect(page.locator('text=$89.00')).toBeVisible();
    await expect(page.locator('text=Classic denim jacket, stone-washed.')).toBeVisible();
    await expect(page.locator('text=Reviews')).toBeVisible();
  });

  test('displays reviews section with seed reviews', async ({ page }) => {
    await page.goto('/products/1');
    await expect(page.locator('text=alice')).toBeVisible();
    await expect(page.locator('text=daniel')).toBeVisible();
    await expect(page.locator('text=Great fit and the denim feels premium.')).toBeVisible();
    await expect(page.locator('text=Runs slightly large, size down.')).toBeVisible();
  });

  test('shows write review form', async ({ page }) => {
    await page.goto('/products/1');
    await expect(page.locator('text=Write a review')).toBeVisible();
    await expect(page.locator('input[placeholder="Your name"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder="Your review"]')).toBeVisible();
    await expect(page.locator('button:has-text("Post review")')).toBeVisible();
  });

  test('layout has product image and info side by side', async ({ page }) => {
    await page.goto('/products/1');
    const image = page.locator('.bg-gray-100 img').first();
    await expect(image).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Slim-fit Denim Jacket');
  });
});
