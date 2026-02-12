# AetherLoom Frontend Tests

This directory contains end-to-end (E2E) tests for the AetherLoom frontend using Playwright.

## Directory Structure

```
tests/
├── e2e/                    # End-to-end test specs
│   ├── canvas.spec.ts     # Canvas interaction tests
│   ├── nodes.spec.ts      # Node creation and manipulation tests
│   ├── connections.spec.ts # Edge creation and validation tests
│   └── flow-execution.spec.ts # Flow execution tests
├── fixtures/               # Test fixtures and data
│   ├── flows.ts           # Sample flow definitions
│   ├── nodes.ts           # Sample node configurations
│   └── test-helpers.ts    # General test helper functions
└── utils/                  # Test utilities
    ├── canvas-helpers.ts  # Canvas interaction utilities
    ├── node-helpers.ts    # Node manipulation utilities
    └── assertions.ts      # Custom assertions
```

## Running Tests

### All Tests

```bash
npm run test
```

### UI Mode (Interactive)

```bash
npm run test:ui
```

### Debug Mode

```bash
npm run test:debug
```

### Headed Mode (See Browser)

```bash
npm run test:headed
```

### View Test Report

```bash
npm run test:report
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should do something", async ({ page }) => {
    // Your test code here
  });
});
```

### Using Fixtures

```typescript
import { simpleTextFlow } from "../fixtures/flows";
import { loadFlowFixture } from "../utils/canvas-helpers";

test("should load a flow fixture", async ({ page }) => {
  await page.goto("/");
  await loadFlowFixture(page, simpleTextFlow);
  // Assert the flow is loaded correctly
});
```

### Using Helper Functions

```typescript
import { dragNodeFromSidebar, connectNodes } from "../utils/canvas-helpers";
import { setTextInputValue } from "../utils/node-helpers";

test("should create and connect nodes", async ({ page }) => {
  await page.goto("/");

  // Drag nodes from sidebar
  await dragNodeFromSidebar(page, "text_input", { x: 100, y: 100 });
  await dragNodeFromSidebar(page, "text_output", { x: 400, y: 100 });

  // Connect the nodes
  await connectNodes(page, "text-input-1", "text-output-1");

  // Set input value
  await setTextInputValue(page, "text-input-1", "Hello World");
});
```

### Using Custom Assertions

```typescript
import {
  expectNodeToExist,
  expectNodeCount,
  expectOutputValue,
} from "../utils/assertions";

test("should validate node state", async ({ page }) => {
  await page.goto("/");

  // Assert node exists
  await expectNodeToExist(page, "text-input-1");

  // Assert node count
  await expectNodeCount(page, 2);

  // Assert output value
  await expectOutputValue(page, "text-output-1", "Expected Value");
});
```

## Best Practices

1. **Use data-testid attributes**: For stable element selection, use `data-testid` attributes instead of CSS selectors that may change.

2. **Wait for elements**: Always wait for elements to be visible or actions to complete using Playwright's built-in waiting mechanisms.

3. **Clean up state**: Ensure tests clean up after themselves (delete created nodes, clear localStorage).

4. **Use descriptive names**: Test names should clearly describe what is being tested.

5. **Group related tests**: Use `test.describe()` to group related tests together.

6. **Avoid hardcoded waits**: Use `waitForSelector`, `waitForResponse`, etc. instead of `waitForTimeout` when possible.

7. **Test isolation**: Each test should be independent and not rely on the state from previous tests.

8. **Use fixtures**: Leverage test fixtures for reusable test data and setup.

## Debugging Tips

- Use `test.only()` to run a single test
- Use `test.skip()` to skip a test temporarily
- Add `await page.pause()` to pause execution and inspect the page
- Use the Playwright Inspector with `npm run test:debug`
- Check screenshots and videos in `test-results/` directory after failures

## CI/CD Integration

Tests are automatically run on GitHub Actions for:

- Push to `main` and `develop` branches
- Pull requests to `main` and `develop` branches

Test reports are uploaded as artifacts and can be downloaded from the Actions tab.

## Related Documentation

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [React Flow Testing](https://reactflow.dev/learn/advanced-use/testing)
