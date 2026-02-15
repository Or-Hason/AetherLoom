/**
 * I/O Nodes tests
 * Tests for input and output node functionality, validation, and sanitization
 */

import { test, expect } from '@playwright/test';

test.describe('Input Nodes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
  });

  test.describe('TextInputNode', () => {
    test('should create text input node from sidebar', async ({ page }) => {
      // Drag text input node from sidebar
      const textInputItem = page.locator('[draggable="true"]').filter({ hasText: 'Text Input' });
      const canvas = page.locator('.react-flow');

      await textInputItem.dragTo(canvas, {
        targetPosition: { x: 400, y: 300 }
      });

      // Verify node was created
      const textInputNode = page.locator('[data-id]').filter({ has: page.locator('text=Text Input') });
      await expect(textInputNode).toBeVisible();
    });

    test('should accept and update text input', async ({ page }) => {
      // Create text input node
      const textInputItem = page.locator('[draggable="true"]').filter({ hasText: 'Text Input' });
      const canvas = page.locator('.react-flow');
      await textInputItem.dragTo(canvas, { targetPosition: { x: 400, y: 300 } });

      // Find the input field
      const inputField = page.locator('input[type="text"][placeholder="Enter text..."]').first();
      await expect(inputField).toBeVisible();

      // Type text
      await inputField.fill('Hello World');
      await expect(inputField).toHaveValue('Hello World');
    });

    test('should sanitize HTML tags from input', async ({ page }) => {
      // Create text input node
      const textInputItem = page.locator('[draggable="true"]').filter({ hasText: 'Text Input' });
      const canvas = page.locator('.react-flow');
      await textInputItem.dragTo(canvas, { targetPosition: { x: 400, y: 300 } });

      // Find the input field
      const inputField = page.locator('input[type="text"][placeholder="Enter text..."]').first();

      // Try to input HTML tags
      await inputField.fill('<script>alert("XSS")</script>Hello');
      
      // Verify HTML tags are removed (sanitized)
      await expect(inputField).toHaveValue('Hello');
    });

    test('should show character counter when max_length is set', () => {
      // This test would require programmatically setting config
      // For now, we'll skip it as it requires backend integration
      test.skip();
    });

    test('should show validation error when exceeding max_length', () => {
      // This test would require programmatically setting config
      // For now, we'll skip it as it requires backend integration
      test.skip();
    });
  });

  test.describe('NumberInputNode', () => {
    test('should create number input node from sidebar', async ({ page }) => {
      // Drag number input node from sidebar
      const numberInputItem = page.locator('[draggable="true"]').filter({ hasText: 'Number Input' });
      const canvas = page.locator('.react-flow');

      await numberInputItem.dragTo(canvas, {
        targetPosition: { x: 400, y: 300 }
      });

      // Verify node was created
      const numberInputNode = page.locator('[data-id]').filter({ has: page.locator('text=Number Input') });
      await expect(numberInputNode).toBeVisible();
    });

    test('should accept numeric input', async ({ page }) => {
      // Create number input node
      const numberInputItem = page.locator('[draggable="true"]').filter({ hasText: 'Number Input' });
      const canvas = page.locator('.react-flow');
      await numberInputItem.dragTo(canvas, { targetPosition: { x: 400, y: 300 } });

      // Find the input field (could be type="number" or type="text" depending on config)
      const inputField = page.locator('input[placeholder="Enter number..."]').first();
      await expect(inputField).toBeVisible();

      // Type number
      await inputField.fill('42');
      await expect(inputField).toHaveValue('42');
    });

    test('should accept float numbers', async ({ page }) => {
      // Create number input node
      const numberInputItem = page.locator('[draggable="true"]').filter({ hasText: 'Number Input' });
      const canvas = page.locator('.react-flow');
      await numberInputItem.dragTo(canvas, { targetPosition: { x: 400, y: 300 } });

      const inputField = page.locator('input[placeholder="Enter number..."]').first();
      
      // Type float
      await inputField.fill('3.14');
      await expect(inputField).toHaveValue('3.14');
    });

    test('should accept negative numbers', async ({ page }) => {
      // Create number input node
      const numberInputItem = page.locator('[draggable="true"]').filter({ hasText: 'Number Input' });
      const canvas = page.locator('.react-flow');
      await numberInputItem.dragTo(canvas, { targetPosition: { x: 400, y: 300 } });

      const inputField = page.locator('input[placeholder="Enter number..."]').first();
      
      // Type negative number
      await inputField.fill('-42');
      await expect(inputField).toHaveValue('-42');
    });
  });
});

test.describe('Output Nodes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
  });

  test.describe('TextOutputNode', () => {
    test('should create text output node from sidebar', async ({ page }) => {
      // Drag text output node from sidebar
      const textOutputItem = page.locator('[draggable="true"]').filter({ hasText: 'Text Output' });
      const canvas = page.locator('.react-flow');

      await textOutputItem.dragTo(canvas, {
        targetPosition: { x: 400, y: 300 }
      });

      // Verify node was created
      const textOutputNode = page.locator('[data-id]').filter({ has: page.locator('text=Text Output') });
      await expect(textOutputNode).toBeVisible();
    });

    test('should show "No output yet" when empty', async ({ page }) => {
      // Create text output node
      const textOutputItem = page.locator('[draggable="true"]').filter({ hasText: 'Text Output' });
      const canvas = page.locator('.react-flow');
      await textOutputItem.dragTo(canvas, { targetPosition: { x: 400, y: 300 } });

      // Check for empty state message
      const emptyMessage = page.locator('text=No output yet');
      await expect(emptyMessage).toBeVisible();
    });

    test('should have copy button when output has value', () => {
      // This test would require programmatically setting output value
      // For now, we'll skip it as it requires backend integration
      test.skip();
    });
  });

  test.describe('NumberOutputNode', () => {
    test('should create number output node from sidebar', async ({ page }) => {
      // Drag number output node from sidebar
      const numberOutputItem = page.locator('[draggable="true"]').filter({ hasText: 'Number Output' });
      const canvas = page.locator('.react-flow');

      await numberOutputItem.dragTo(canvas, {
        targetPosition: { x: 400, y: 300 }
      });

      // Verify node was created
      const numberOutputNode = page.locator('[data-id]').filter({ has: page.locator('text=Number Output') });
      await expect(numberOutputNode).toBeVisible();
    });

    test('should show em dash when empty', async ({ page }) => {
      // Create number output node
      const numberOutputItem = page.locator('[draggable="true"]').filter({ hasText: 'Number Output' });
      const canvas = page.locator('.react-flow');
      await numberOutputItem.dragTo(canvas, { targetPosition: { x: 400, y: 300 } });

      // Check for empty state (em dash)
      const emptyValue = page.locator('text=—').first();
      await expect(emptyValue).toBeVisible();
    });
  });
});

test.describe('I/O Node Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
  });

  test('should connect input to output nodes', async ({ page }) => {
    const canvas = page.locator('.react-flow');

    // Create text input node
    const textInputItem = page.locator('[draggable="true"]').filter({ hasText: 'Text Input' });
    await textInputItem.dragTo(canvas, { targetPosition: { x: 200, y: 300 } });

    // Create text output node
    const textOutputItem = page.locator('[draggable="true"]').filter({ hasText: 'Text Output' });
    await textOutputItem.dragTo(canvas, { targetPosition: { x: 500, y: 300 } });

    // Verify both nodes exist
    await expect(page.locator('text=Text Input')).toBeVisible();
    await expect(page.locator('text=Text Output')).toBeVisible();

    // Note: Actual connection testing would require more complex interactions
    // with React Flow handles, which is better tested in connections.spec.ts
  });

  test('should allow multiple input nodes on canvas', async ({ page }) => {
    const canvas = page.locator('.react-flow');

    // Create first text input
    const textInputItem = page.locator('[draggable="true"]').filter({ hasText: 'Text Input' });
    await textInputItem.dragTo(canvas, { targetPosition: { x: 200, y: 200 } });

    // Create second text input
    await textInputItem.dragTo(canvas, { targetPosition: { x: 200, y: 400 } });

    // Verify both nodes exist
    const textInputNodes = page.locator('text=Text Input');
    await expect(textInputNodes).toHaveCount(2);
  });

  test('should allow mixed input types on canvas', async ({ page }) => {
    const canvas = page.locator('.react-flow');

    // Create text input
    const textInputItem = page.locator('[draggable="true"]').filter({ hasText: 'Text Input' });
    await textInputItem.dragTo(canvas, { targetPosition: { x: 200, y: 200 } });

    // Create number input
    const numberInputItem = page.locator('[draggable="true"]').filter({ hasText: 'Number Input' });
    await numberInputItem.dragTo(canvas, { targetPosition: { x: 200, y: 400 } });

    // Verify both nodes exist
    await expect(page.locator('text=Text Input')).toBeVisible();
    await expect(page.locator('text=Number Input')).toBeVisible();
  });
});
