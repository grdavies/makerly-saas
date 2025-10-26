import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('http://localhost:3000/auth/login');
  });

  test('should display login form', async ({ page }) => {
    // Check if login form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Check for login form labels
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Password')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Try to submit with invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Check for validation error
    await expect(page.locator('text=Invalid email format')).toBeVisible();
  });

  test('should validate password length', async ({ page }) => {
    // Try to submit with short password
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');

    // Check for validation error
    await expect(
      page.locator('text=Password must be at least 6 characters')
    ).toBeVisible();
  });

  test('should handle login failure', async ({ page }) => {
    // Mock failed login response
    await page.route('**/auth/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' }),
      });
    });

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Check for error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should handle successful login', async ({ page }) => {
    // Mock successful login response
    await page.route('**/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: '1', email: 'test@example.com' },
        }),
      });
    });

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.click('text=Sign up');
    await expect(page).toHaveURL('http://localhost:3000/auth/signup');
  });

  test('should navigate to password reset page', async ({ page }) => {
    await page.click('text=Forgot password?');
    await expect(page).toHaveURL('http://localhost:3000/auth/reset-password');
  });
});

test.describe('Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signup');
  });

  test('should display signup form', async ({ page }) => {
    // Check if signup form elements are present
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should validate signup form', async ({ page }) => {
    // Try to submit with invalid data
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', '123');
    await page.fill('input[name="firstName"]', '');
    await page.fill('input[name="lastName"]', '');
    await page.click('button[type="submit"]');

    // Check for validation errors
    await expect(page.locator('text=Invalid email format')).toBeVisible();
    await expect(
      page.locator('text=Password must be at least 6 characters')
    ).toBeVisible();
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
  });

  test('should handle successful signup', async ({ page }) => {
    // Mock successful signup response
    await page.route('**/auth/signup', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: '1', email: 'new@example.com' },
        }),
      });
    });

    await page.fill('input[name="email"]', 'new@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });
});

test.describe('Password Reset Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/auth/reset-password');
  });

  test('should display password reset form', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Reset Password')).toBeVisible();
  });

  test('should handle password reset request', async ({ page }) => {
    // Mock successful password reset response
    await page.route('**/auth/reset-password', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Password reset email sent',
        }),
      });
    });

    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Check for success message
    await expect(page.locator('text=Password reset email sent')).toBeVisible();
  });
});

test.describe('RBAC Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user with specific role
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token');
      window.localStorage.setItem('user-role', 'admin');
    });

    await page.goto('http://localhost:3000/dashboard');
  });

  test('should display admin navigation for admin users', async ({ page }) => {
    // Check for admin-specific navigation items
    await expect(page.locator('text=Admin Panel')).toBeVisible();
    await expect(page.locator('text=User Management')).toBeVisible();
    await expect(page.locator('text=Team Settings')).toBeVisible();
  });

  test('should hide admin features for regular users', async ({ page }) => {
    // Update user role to regular user
    await page.addInitScript(() => {
      window.localStorage.setItem('user-role', 'member');
    });

    await page.reload();

    // Admin features should not be visible
    await expect(page.locator('text=Admin Panel')).not.toBeVisible();
    await expect(page.locator('text=User Management')).not.toBeVisible();
  });

  test('should display super admin features for super admin users', async ({
    page,
  }) => {
    // Update user role to super admin
    await page.addInitScript(() => {
      window.localStorage.setItem('user-role', 'super_admin');
    });

    await page.reload();

    // Super admin features should be visible
    await expect(page.locator('text=System Administration')).toBeVisible();
    await expect(page.locator('text=Global Settings')).toBeVisible();
    await expect(page.locator('text=Audit Logs')).toBeVisible();
  });

  test('should enforce permission-based access', async ({ page }) => {
    // Try to access admin page as regular user
    await page.addInitScript(() => {
      window.localStorage.setItem('user-role', 'member');
    });

    await page.goto('http://localhost:3000/admin');

    // Should be redirected or show access denied
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });

  test('should display 2FA setup for super admin', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('user-role', 'super_admin');
      window.localStorage.setItem('two-factor-enabled', 'false');
    });

    await page.reload();

    // Should show 2FA setup prompt
    await expect(
      page.locator('text=Two-Factor Authentication Required')
    ).toBeVisible();
    await expect(page.locator('text=Setup 2FA')).toBeVisible();
  });

  test('should handle 2FA verification', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('user-role', 'super_admin');
      window.localStorage.setItem('two-factor-enabled', 'true');
    });

    await page.goto('http://localhost:3000/auth/2fa');

    // Should show 2FA verification form
    await expect(page.locator('input[name="token"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Test 2FA verification
    await page.fill('input[name="token"]', '123456');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard after successful verification
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });
});

test.describe('Team Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token');
      window.localStorage.setItem('user-role', 'admin');
      window.localStorage.setItem('team-id', 'team_123');
    });

    await page.goto('http://localhost:3000/team');
  });

  test('should display team information', async ({ page }) => {
    await expect(page.locator('text=Team Settings')).toBeVisible();
    await expect(page.locator('text=Team Members')).toBeVisible();
    await expect(page.locator('text=Invite Members')).toBeVisible();
  });

  test('should allow team admin to invite members', async ({ page }) => {
    await page.click('text=Invite Members');

    // Should show invite form
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('select[name="role"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Test invitation
    await page.fill('input[name="email"]', 'newmember@example.com');
    await page.selectOption('select[name="role"]', 'member');
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(
      page.locator('text=Invitation sent successfully')
    ).toBeVisible();
  });

  test('should prevent non-admin from inviting members', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('user-role', 'member');
    });

    await page.reload();

    // Invite button should not be visible
    await expect(page.locator('text=Invite Members')).not.toBeVisible();
  });
});
