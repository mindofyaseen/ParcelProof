import { expect, test } from '@playwright/test';

test('judge can create a demo order and select included test data', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Every parcel right/i })).toBeVisible();
  await expect(page.getByText('A product your team can trust.', { exact: true })).toBeVisible();
  await expect(page.locator('.heroProduct img')).toBeVisible();
  await page.getByRole('button', { name: /Inspect a demo parcel/i }).click();
  await expect(page.getByText('Live inspection workspace', { exact: true })).toBeVisible();
  await expect(page.getByText('Happy Birthday Ayesha')).toBeVisible();
  await expect(page.getByText('Realistic synthetic fixtures · no customer data')).toBeVisible();
  await expect(page.getByText(/Drop a clear packing photo/i)).toBeVisible();
  await page.getByRole('button', { name: /Wrong parcel/i }).click();
  await expect(page.getByText('parcelproof-wrong-parcel.webp')).toBeVisible();
});

test('seller can create a custom order without demo-only fixtures', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create custom order' }).click();
  await expect(page.getByRole('heading', { name: 'Build a custom order' })).toBeVisible();
  await page.screenshot({ path: 'docs/evidence/product-v4-custom-order.png', fullPage: true });
  await page.getByLabel('Order or customer label').fill('Judge test order');
  await page.getByLabel('Item').first().fill('linen tote bag');
  await page.getByLabel('Variant').first().fill('forest green');
  await page.getByLabel('Exact text').first().fill('MAYA');
  await page.getByRole('button', { name: /Create order and inspect/i }).click();
  await expect(page.getByText('Live inspection workspace', { exact: true })).toBeVisible();
  await expect(page.getByText('Judge test order', { exact: true })).toBeVisible();
  await expect(page.getByText('linen tote bag', { exact: true })).toBeVisible();
  await expect(page.getByText('Realistic synthetic fixtures · no customer data')).toHaveCount(0);
});
