import { test, expect } from '@playwright/test';

test.describe('Shopping Flow', () => {
  test('should complete full shopping journey', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/PureBite/);

    // 2. Browse products
    await page.getByRole('link', { name: /পণ্যসমূহ/i }).click();
    await page.waitForURL(/.*products.*/);
    await expect(page.getByText(/সকল পণ্য/i)).toBeVisible();

    // 3. Select a product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    
    // Wait for product page to load
    await page.waitForSelector('[data-testid="product-details"]');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // 4. Add to cart
    const addToCartButton = page.getByRole('button', { name: /কার্টে যোগ করুন/i });
    await addToCartButton.click();
    
    // Wait for cart update
    await expect(page.getByText(/কার্টে যোগ হয়েছে/i)).toBeVisible({ timeout: 5000 });

    // 5. View cart
    await page.getByRole('button', { name: /কার্ট/i }).click();
    await expect(page.getByText(/আপনার কার্ট/i)).toBeVisible();
    
    // Check if product is in cart
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

    // 6. Proceed to checkout
    await page.getByRole('button', { name: /চেকআউট/i }).click();
    
    // Should redirect to login if not authenticated
    await expect(page.getByText(/লগইন করুন/i)).toBeVisible();
  });

  test('should handle product search and filtering', async ({ page }) => {
    await page.goto('/products');

    // Test search functionality
    const searchInput = page.getByPlaceholder(/পণ্য খুঁজুন/i);
    await searchInput.fill('আপেল');
    await page.keyboard.press('Enter');

    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]');
    await expect(page.getByText(/অনুসন্ধানের ফলাফল/i)).toBeVisible();

    // Test category filter
    await page.getByRole('button', { name: /ফল/i }).click();
    await page.waitForSelector('[data-testid="filtered-products"]');

    // Test price filter
    const minPriceInput = page.getByLabel(/সর্বনিম্ন দাম/i);
    await minPriceInput.fill('100');
    
    const maxPriceInput = page.getByLabel(/সর্বোচ্চ দাম/i);
    await maxPriceInput.fill('500');
    
    await page.getByRole('button', { name: /ফিল্টার প্রয়োগ/i }).click();
    
    // Verify filtered results
    await page.waitForSelector('[data-testid="filtered-products"]');
  });

  test('should handle wishlist functionality', async ({ page }) => {
    await page.goto('/products');
    
    // Find a product and add to wishlist
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const wishlistButton = firstProduct.getByRole('button', { name: /উইশলিস্টে যোগ/i });
    
    await wishlistButton.click();
    
    // Check for wishlist confirmation
    await expect(page.getByText(/উইশলিস্টে যোগ হয়েছে/i)).toBeVisible({ timeout: 5000 });
    
    // Navigate to wishlist
    await page.getByRole('link', { name: /উইশলিস্ট/i }).click();
    await page.waitForURL(/.*wishlist.*/);
    
    // Verify product is in wishlist
    await expect(page.locator('[data-testid="wishlist-item"]')).toHaveCount(1);
  });

  test('should handle quantity updates in cart', async ({ page }) => {
    // First add a product to cart
    await page.goto('/products');
    
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    
    await page.getByRole('button', { name: /কার্টে যোগ করুন/i }).click();
    await expect(page.getByText(/কার্টে যোগ হয়েছে/i)).toBeVisible();
    
    // Open cart
    await page.getByRole('button', { name: /কার্ট/i }).click();
    
    // Update quantity
    const quantityInput = page.getByLabel(/পরিমাণ/i);
    await quantityInput.fill('2');
    
    // Wait for cart update
    await page.waitForTimeout(1000);
    
    // Verify total price updated
    const totalPrice = page.getByTestId('cart-total');
    await expect(totalPrice).toBeVisible();
  });

  test('should handle product comparison', async ({ page }) => {
    await page.goto('/products');
    
    // Add first product to comparison
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const compareButton1 = firstProduct.getByRole('button', { name: /তুলনা করুন/i });
    await compareButton1.click();
    
    // Add second product to comparison
    const secondProduct = page.locator('[data-testid="product-card"]').nth(1);
    const compareButton2 = secondProduct.getByRole('button', { name: /তুলনা করুন/i });
    await compareButton2.click();
    
    // Navigate to comparison page
    await page.getByRole('link', { name: /তুলনা/i }).click();
    await page.waitForURL(/.*compare.*/);
    
    // Verify comparison table
    await expect(page.getByTestId('comparison-table')).toBeVisible();
    await expect(page.locator('[data-testid="compared-product"]')).toHaveCount(2);
  });

  test('should handle guest checkout', async ({ page }) => {
    // Add product to cart
    await page.goto('/products');
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    
    await page.getByRole('button', { name: /কার্টে যোগ করুন/i }).click();
    await page.getByRole('button', { name: /কার্ট/i }).click();
    await page.getByRole('button', { name: /চেকআউট/i }).click();
    
    // Choose guest checkout
    await page.getByRole('button', { name: /গেস্ট হিসেবে অর্ডার/i }).click();
    
    // Fill guest information
    await page.getByLabel(/নাম/i).fill('Test User');
    await page.getByLabel(/ইমেইল/i).fill('test@example.com');
    await page.getByLabel(/ফোন/i).fill('01700000000');
    await page.getByLabel(/ঠিকানা/i).fill('Test Address, Dhaka');
    
    // Proceed to payment
    await page.getByRole('button', { name: /অর্ডার নিশ্চিত/i }).click();
    
    // Should redirect to payment page
    await expect(page.getByText(/পেমেন্ট/i)).toBeVisible();
  });

  test('should handle mobile shopping experience', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Open mobile menu
    await page.getByRole('button', { name: /মেনু/i }).click();
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Navigate to products
    await page.getByRole('link', { name: /পণ্যসমূহ/i }).click();
    
    // Test mobile product grid
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount.toBeGreaterThan(0);
    
    // Test mobile filters
    await page.getByRole('button', { name: /ফিল্টার/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test with invalid product ID
    await page.goto('/products/invalid-id');
    await expect(page.getByText(/পণ্য পাওয়া যায়নি/i)).toBeVisible();
    
    // Test with network error simulation
    await page.route('**/api/products', route => route.abort());
    await page.goto('/products');
    await expect(page.getByText(/লোড করতে সমস্যা/i)).toBeVisible();
  });
});