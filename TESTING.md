# PureBite Testing Guide

This document provides comprehensive information about testing in the PureBite e-commerce platform.

## 🧪 Testing Strategy

Our testing approach follows a three-tier pyramid:

1. **Unit Tests** (70%) - Test individual components and functions
2. **Integration Tests** (20%) - Test API routes and component interactions
3. **E2E Tests** (10%) - Test complete user workflows

## 📊 Coverage Requirements

### Global Thresholds
- **Statements**: ≥70%
- **Branches**: ≥70%
- **Functions**: ≥70%
- **Lines**: ≥70%

### Directory-Specific Thresholds
- **Components** (`src/components/`): ≥75%
- **Libraries** (`src/lib/`): ≥65%

## 🛠️ Testing Tools

### Unit & Integration Testing
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interaction simulation
- **ts-jest** - TypeScript support

### E2E Testing
- **Playwright** - Browser automation
- **Multiple browsers** - Chrome, Firefox, Safari, Mobile

### Coverage Reporting
- **V8 Coverage Provider** - Fast and accurate
- **Multiple formats** - HTML, LCOV, JSON, XML
- **Custom dashboard** - Interactive coverage visualization

## 🚀 Running Tests

### Quick Commands

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Generate detailed coverage reports
npm run test:coverage:report

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all

# Run with detailed reporting
npm run test:all:report
```

### Development Commands

```bash
# Watch mode for unit tests
npm run test:watch

# E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Open coverage report
npm run test:coverage:open
```

### CI/CD Commands

```bash
# CI optimized coverage
npm run test:coverage:ci

# Check coverage thresholds
npm run coverage:check

# Generate coverage badge
npm run coverage:badge
```

## 📁 Test Structure

```
├── src/
│   ├── components/
│   │   └── __tests__/          # Component unit tests
│   ├── lib/
│   │   └── __tests__/          # Library unit tests
│   └── app/
│       └── api/
│           └── __tests__/      # API integration tests
├── tests/
│   ├── e2e/                    # End-to-end tests
│   ├── global-setup.ts         # E2E test setup
│   └── global-teardown.ts      # E2E test cleanup
├── coverage/                   # Coverage reports
├── coverage-reports/           # Detailed reports
└── test-results/              # E2E test results
```

## 📝 Writing Tests

### Unit Test Example

```typescript
// src/components/__tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 100,
    imageUrl: '/test.jpg'
  };

  it('should render product information', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('৳100')).toBeInTheDocument();
  });
});
```

### Integration Test Example

```typescript
// src/app/api/__tests__/products.test.ts
import { GET, POST } from '../products/route';
import { NextRequest } from 'next/server';

describe('/api/products', () => {
  it('should return products list', async () => {
    const request = new NextRequest('http://localhost:3000/api/products');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(data.products)).toBe(true);
  });
});
```

### E2E Test Example

```typescript
// tests/e2e/shopping-flow.spec.ts
import { test, expect } from '@playwright/test';

test('should complete shopping flow', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /পণ্যসমূহ/i }).click();
  
  const firstProduct = page.locator('[data-testid="product-card"]').first();
  await firstProduct.click();
  
  await page.getByRole('button', { name: /কার্টে যোগ করুন/i }).click();
  await expect(page.getByText(/কার্টে যোগ হয়েছে/i)).toBeVisible();
});
```

## 📈 Coverage Reports

### Available Reports

1. **Interactive Dashboard** - `coverage-reports/dashboard.html`
   - Visual overview of all metrics
   - Directory breakdown
   - Uncovered files list
   - Quality gates status

2. **HTML Report** - `coverage/lcov-report/index.html`
   - Line-by-line coverage
   - File explorer
   - Detailed metrics

3. **JSON Reports**
   - `coverage-reports/detailed-summary.json` - Comprehensive data
   - `coverage-reports/directory-coverage.json` - By directory
   - `coverage-reports/uncovered-files.json` - Files needing attention

4. **Markdown Summary** - `coverage-reports/README.md`
   - Human-readable overview
   - Status indicators
   - Links to detailed reports

### Understanding Metrics

- **Statements**: Individual code statements executed
- **Branches**: Conditional paths (if/else, switch cases)
- **Functions**: Function/method definitions called
- **Lines**: Physical lines of code executed

## 🎯 Quality Gates

### Automated Checks

Our CI/CD pipeline enforces:

✅ **Coverage Thresholds** - All metrics must meet requirements  
✅ **Test Execution** - All tests must pass  
✅ **Build Verification** - Code must compile successfully  
✅ **Lint Compliance** - Code style standards  
✅ **Security Audit** - Dependency vulnerability checks  

### Manual Reviews

🔍 **Code Quality** - Maintainable, readable code  
🔍 **Test Quality** - Meaningful test cases  
🔍 **Performance** - No significant regressions  
🔍 **Accessibility** - WCAG compliance  

## 🐛 Debugging Tests

### Jest Debugging

```bash
# Debug specific test
npm test -- --debug ProductCard.test.tsx

# Run single test file
npm test ProductCard.test.tsx

# Update snapshots
npm test -- --updateSnapshot
```

### Playwright Debugging

```bash
# Debug mode with browser
npm run test:e2e:debug

# Headed mode
npx playwright test --headed

# Specific test
npx playwright test shopping-flow.spec.ts
```

### Common Issues

1. **Async/Await** - Always await async operations
2. **Cleanup** - Use cleanup functions to avoid test pollution
3. **Mocking** - Mock external dependencies consistently
4. **Timeouts** - Increase timeouts for slow operations

## 📚 Best Practices

### Unit Tests
- Test one thing at a time
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test error cases

### Integration Tests
- Test realistic scenarios
- Use test databases
- Clean up after tests
- Test authentication flows
- Verify API contracts

### E2E Tests
- Test critical user journeys
- Use data attributes for selectors
- Handle loading states
- Test responsive design
- Verify accessibility

### Coverage
- Focus on quality over quantity
- Test edge cases and error paths
- Don't test implementation details
- Use coverage to find gaps
- Review uncovered code regularly

## 🔧 Configuration Files

- `jest.config.js` - Jest configuration
- `jest.setup.js` - Test environment setup
- `playwright.config.ts` - Playwright configuration
- `.coveragerc` - Coverage settings
- `sonar-project.properties` - SonarQube integration

## 📊 Monitoring

### Dashboard Features
- Real-time coverage metrics
- Trend analysis
- Quality gate status
- Performance indicators
- Team productivity metrics

### CI/CD Integration
- Automatic PR comments
- Coverage trend tracking
- Quality gate enforcement
- Artifact generation
- Notification systems

## 🎯 Goals

- Maintain >85% overall coverage
- Zero critical bugs in production
- <5 minute test suite execution
- 100% E2E test reliability
- Continuous improvement culture

---

For questions or support, please refer to the team documentation or create an issue in the project repository.