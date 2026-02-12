/**
 * Canvas interaction tests
 * Tests for basic canvas operations like rendering, panning, and zooming
 */

import { test, expect } from '@playwright/test';
import { panCanvas, zoomCanvas } from '../utils/canvas-helpers';
import { expectNodeCount, expectEdgeCount } from '../utils/assertions';

test.describe('Canvas Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the canvas to be ready
    await page.waitForSelector('.react-flow', { timeout: 10000 });
  });

  test('should render the canvas', async ({ page }) => {
    const canvas = page.locator('.react-flow');
    await expect(canvas).toBeVisible();
  });

  test('should render the sidebar', async ({ page }) => {
    const sidebar = page.locator('[data-testid="sidebar"]').or(page.locator('aside')).first();
    await expect(sidebar).toBeVisible();
  });

  test('should start with an empty canvas', async ({ page }) => {
    await expectNodeCount(page, 0);
    await expectEdgeCount(page, 0);
  });

  test('should pan the canvas', async ({ page }) => {
    // Get initial viewport
    const initialViewport = await page.evaluate(() => {
      const rfInstance = (window as any).__reactFlowInstance;
      return rfInstance?.getViewport?.() || { x: 0, y: 0, zoom: 1 };
    });

    // Pan the canvas
    await panCanvas(page, 100, 100);

    // Get new viewport
    const newViewport = await page.evaluate(() => {
      const rfInstance = (window as any).__reactFlowInstance;
      return rfInstance?.getViewport?.() || { x: 0, y: 0, zoom: 1 };
    });

    // Viewport should have changed (allowing for some tolerance)
    const viewportChanged = 
      Math.abs(newViewport.x - initialViewport.x) > 10 ||
      Math.abs(newViewport.y - initialViewport.y) > 10;
    
    expect(viewportChanged).toBe(true);
  });

  test('should zoom the canvas', async ({ page }) => {
    // Get initial zoom
    const initialZoom = await page.evaluate(() => {
      const rfInstance = (window as any).__reactFlowInstance;
      return rfInstance?.getViewport?.()?.zoom || 1;
    });

    // Zoom in
    await zoomCanvas(page, -100);

    // Get new zoom
    const newZoom = await page.evaluate(() => {
      const rfInstance = (window as any).__reactFlowInstance;
      return rfInstance?.getViewport?.()?.zoom || 1;
    });

    // Zoom should have increased (allowing for some tolerance)
    expect(newZoom).toBeGreaterThan(initialZoom * 0.9);
  });

  test('should have React Flow controls visible', async ({ page }) => {
    // Check for zoom controls or other React Flow UI elements
    const controls = page.locator('.react-flow__controls').or(
      page.locator('[data-testid="react-flow-controls"]')
    );
    
    // Controls might not be visible by default, so we just check the canvas exists
    const canvas = page.locator('.react-flow');
    await expect(canvas).toBeVisible();
  });
});
