import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the homepage correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/PureBite/);

    // Check main heading
    await expect(page.getByRole('heading', { name: /স্বাগতম PureBite-এ/i })).toBeVisible();

    // Check hero section
    await expect(page.getByText(/বিশুদ্ধ ও স্বাস্থ্যকর খাবার/i)).toBeVisible();

    // Check navigation menu
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('link', { name: /হোম/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /পণ্যসমূহ/i })).toBeVisible();
  });

  test('should show product recommendations', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForSelector('[data-testid="recommendations"]', { timeout: 10000 });

    // Check if recommendation sections are visible
    await expect(page.getByText(/আপনার জন্য বিশেষ সুপারিশ/i)).toBeVisible();
    await expect(page.getByText(/এই সপ্তাহের জনপ্রিয় পণ্য/i)).toBeVisible();
  });

  test('should have working search functionality', async ({ page }) => {
    // Find search input
    const searchInput = page.getByPlaceholder(/খুঁজুন/i);
    await expect(searchInput).toBeVisible();

    // Enter search term
    await searchInput.fill('আপেল');
    await page.keyboard.press('Enter');

    // Wait for navigation to search results
    await page.waitForURL(/.*search.*/, { timeout: 5000 });
    
    // Check search results page
    await expect(page.getByText(/অনুসন্ধানের ফলাফল/i)).toBeVisible();
  });

  test('should navigate to login when clicking login button', async ({ page }) => {
    // Click login button
    await page.getByRole('button', { name: /লগইন/i }).click();

    // Check if login modal or page appears
    await expect(page.getByText(/লগইন করুন/i)).toBeVisible();
  });

  test('should show cart sidebar when cart button is clicked', async ({ page }) => {
    // Click cart button
    await page.getByRole('button', { name: /কার্ট/i }).click();

    // Check if cart sidebar appears
    await expect(page.getByText(/আপনার কার্ট/i)).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if mobile menu toggle is visible
    await expect(page.getByRole('button', { name: /মেনু/i })).toBeVisible();

    // Check if content is properly laid out
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('should have accessibility features', async ({ page }) => {
    // Check for proper heading hierarchy
    const headings = page.getByRole('heading');
    await expect(headings.first()).toBeVisible();

    // Check for alt text on images
    const images = page.getByRole('img');
    const firstImage = images.first();
    if (await firstImage.isVisible()) {
      await expect(firstImage).toHaveAttribute('alt');
    }

    // Check for proper link labels
    const links = page.getByRole('link');
    const firstLink = links.first();
    if (await firstLink.isVisible()) {
      const linkText = await firstLink.textContent();
      expect(linkText).toBeTruthy();
    }
  });

  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for main content to load
    await page.waitForSelector('main');
    
    const loadTime = Date.now() - startTime;
    
    // Check if page loads within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle newsletter subscription', async ({ page }) => {
    // Find newsletter subscription form
    const emailInput = page.getByPlaceholder(/ইমেইল ঠিকানা/i);
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      
      // Submit newsletter form
      await page.getByRole('button', { name: /সাবস্ক্রাইব/i }).click();
      
      // Check for success message
      await expect(page.getByText(/সফলভাবে সাবস্ক্রাইব/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show language switcher and switch languages', async ({ page }) => {
    // Find language switcher
    const languageSwitcher = page.getByRole('button', { name: /ভাষা/i });
    
    if (await languageSwitcher.isVisible()) {
      await languageSwitcher.click();
      
      // Switch to English
      await page.getByRole('button', { name: /English/i }).click();
      
      // Check if content changed to English
      await expect(page.getByText(/Welcome to PureBite/i)).toBeVisible({ timeout: 3000 });
    }
  });
});