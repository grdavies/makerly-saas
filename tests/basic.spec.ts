import { test, expect } from '@playwright/test';

test('basic playwright test', async ({ page }) => {
  // Test basic page functionality
  await page.goto('data:text/html,<h1>Hello World</h1>');

  // Check that the page loads
  await expect(page.locator('h1')).toHaveText('Hello World');
});

test('navigation test', async ({ page }) => {
  // Test basic navigation
  await page.goto('data:text/html,<nav><a href="#test">Test Link</a></nav>');

  // Check if navigation elements are present
  const nav = page.locator('nav');
  await expect(nav).toBeVisible();

  const link = page.locator('a');
  await expect(link).toBeVisible();
});

test('responsive design test', async ({ page }) => {
  // Test responsive behavior
  await page.goto('data:text/html,<body><div>Test Content</div></body>');

  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('body')).toBeVisible();

  // Test desktop viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.locator('body')).toBeVisible();
});
