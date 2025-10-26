import { test, expect } from '@playwright/test';

test.describe('Plan Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token');
      window.localStorage.setItem('user-role', 'admin');
      window.localStorage.setItem('team-id', 'team_123');
      window.localStorage.setItem('current-plan', 'starter');
    });

    await page.goto('http://localhost:3000/dashboard');
  });

  test('should display current plan information', async ({ page }) => {
    await expect(page.locator('text=Current Plan')).toBeVisible();
    await expect(page.locator('text=Starter Plan')).toBeVisible();
    await expect(page.locator('text=Usage')).toBeVisible();
  });

  test('should show usage limits', async ({ page }) => {
    // Mock usage data
    await page.route('**/api/usage/current', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          max_users: { used: 5, limit: 10, percentage: 50 },
          api_calls: { used: 200, limit: 1000, percentage: 20 },
          storage: { used: 2.5, limit: 10, percentage: 25 },
        }),
      });
    });

    await page.reload();

    // Check usage displays
    await expect(page.locator('text=5 / 10 users')).toBeVisible();
    await expect(page.locator('text=200 / 1000 API calls')).toBeVisible();
    await expect(page.locator('text=2.5 / 10 GB storage')).toBeVisible();
  });

  test('should display plan upgrade options', async ({ page }) => {
    await page.click('text=Upgrade Plan');

    // Should show plan comparison
    await expect(page.locator('text=Professional Plan')).toBeVisible();
    await expect(page.locator('text=Enterprise Plan')).toBeVisible();

    // Check plan features
    await expect(page.locator('text=50 users')).toBeVisible();
    await expect(page.locator('text=10,000 API calls')).toBeVisible();
    await expect(page.locator('text=100 GB storage')).toBeVisible();
  });

  test('should handle plan upgrade', async ({ page }) => {
    // Mock checkout session creation
    await page.route('**/api/billing/checkout', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          checkoutUrl: 'https://checkout.planship.com/session/cs_123',
        }),
      });
    });

    await page.click('text=Upgrade Plan');
    await page.click('text=Upgrade to Professional');

    // Should redirect to checkout
    await expect(page).toHaveURL(/checkout\.planship\.com/);
  });

  test('should show plan limit exceeded warning', async ({ page }) => {
    // Mock usage at limit
    await page.route('**/api/usage/current', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          max_users: { used: 10, limit: 10, percentage: 100 },
          api_calls: { used: 1000, limit: 1000, percentage: 100 },
        }),
      });
    });

    await page.reload();

    // Should show warning
    await expect(page.locator('text=Plan limit exceeded')).toBeVisible();
    await expect(page.locator('text=Upgrade now')).toBeVisible();
  });

  test('should handle grace window for exceeded limits', async ({ page }) => {
    // Mock grace window active
    await page.route('**/api/grace-windows/active', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          active: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          reason: 'Temporary extension for project deadline',
        }),
      });
    });

    await page.reload();

    // Should show grace window info
    await expect(page.locator('text=Grace window active')).toBeVisible();
    await expect(page.locator('text=Expires in 24 hours')).toBeVisible();
  });

  test('should prevent access to premium features on free plan', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('current-plan', 'free');
    });

    await page.goto('http://localhost:3000/advanced-features');

    // Should show plan gate modal
    await expect(page.locator('text=Feature not available')).toBeVisible();
    await expect(
      page.locator('text=Upgrade to access this feature')
    ).toBeVisible();
    await expect(page.locator('text=View Plans')).toBeVisible();
  });

  test('should allow access to premium features on paid plan', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('current-plan', 'professional');
    });

    await page.goto('http://localhost:3000/advanced-features');

    // Should not show plan gate modal
    await expect(page.locator('text=Feature not available')).not.toBeVisible();
    await expect(page.locator('text=Advanced Features')).toBeVisible();
  });

  test('should handle subscription cancellation', async ({ page }) => {
    await page.goto('http://localhost:3000/billing');

    // Mock subscription cancellation
    await page.route('**/api/billing/cancel', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Subscription cancelled successfully',
        }),
      });
    });

    await page.click('text=Cancel Subscription');

    // Confirm cancellation
    await page.click('text=Yes, Cancel Subscription');

    // Should show success message
    await expect(
      page.locator('text=Subscription cancelled successfully')
    ).toBeVisible();
  });

  test('should handle subscription reactivation', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('subscription-status', 'canceled');
    });

    await page.goto('http://localhost:3000/billing');

    // Mock subscription reactivation
    await page.route('**/api/billing/reactivate', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Subscription reactivated successfully',
        }),
      });
    });

    await page.click('text=Reactivate Subscription');

    // Should show success message
    await expect(
      page.locator('text=Subscription reactivated successfully')
    ).toBeVisible();
  });

  test('should display billing history', async ({ page }) => {
    // Mock billing history
    await page.route('**/api/billing/history', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'inv_1',
            date: '2024-01-01',
            amount: 29.99,
            status: 'paid',
            plan: 'Professional',
          },
          {
            id: 'inv_2',
            date: '2023-12-01',
            amount: 29.99,
            status: 'paid',
            plan: 'Professional',
          },
        ]),
      });
    });

    await page.goto('http://localhost:3000/billing/history');

    // Should show billing history
    await expect(page.locator('text=Billing History')).toBeVisible();
    await expect(page.locator('text=$29.99')).toBeVisible();
    await expect(page.locator('text=Professional')).toBeVisible();
  });

  test('should handle plan downgrade', async ({ page }) => {
    await page.goto('http://localhost:3000/billing');

    // Mock plan downgrade
    await page.route('**/api/billing/downgrade', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Plan downgraded successfully',
          newPlan: 'starter',
        }),
      });
    });

    await page.click('text=Downgrade Plan');
    await page.selectOption('select[name="newPlan"]', 'starter');
    await page.click('text=Confirm Downgrade');

    // Should show success message
    await expect(
      page.locator('text=Plan downgraded successfully')
    ).toBeVisible();
  });
});

test.describe('Usage Tracking E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token');
      window.localStorage.setItem('user-role', 'admin');
      window.localStorage.setItem('team-id', 'team_123');
    });

    await page.goto('http://localhost:3000/dashboard');
  });

  test('should track API usage', async ({ page }) => {
    // Mock API usage tracking
    await page.route('**/api/usage/track', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          currentUsage: 201,
          limit: 1000,
        }),
      });
    });

    // Simulate API call
    await page.evaluate(() => {
      fetch('/api/usage/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capability: 'api_calls',
          teamId: 'team_123',
          increment: 1,
        }),
      });
    });

    // Check usage updated
    await page.reload();
    await expect(page.locator('text=201 / 1000 API calls')).toBeVisible();
  });

  test('should show usage alerts', async ({ page }) => {
    // Mock high usage
    await page.route('**/api/usage/current', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          max_users: { used: 9, limit: 10, percentage: 90 },
          api_calls: { used: 900, limit: 1000, percentage: 90 },
        }),
      });
    });

    await page.reload();

    // Should show usage alerts
    await expect(page.locator('text=Usage Alert')).toBeVisible();
    await expect(page.locator('text=90% of limit reached')).toBeVisible();
  });

  test('should display usage charts', async ({ page }) => {
    await page.goto('http://localhost:3000/analytics/usage');

    // Should show usage charts
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('text=Usage Trends')).toBeVisible();
    await expect(page.locator('text=Daily Usage')).toBeVisible();
  });
});
