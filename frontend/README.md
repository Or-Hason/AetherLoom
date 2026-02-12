# AetherLoom Frontend

The frontend for AetherLoom, a visual programming environment built with Next.js, React Flow, and TypeScript.

## Tech Stack

- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript (Strict mode)
- **UI Library**: React 19.2.3
- **Canvas**: React Flow 11.11.4
- **State Management**: Zustand 5.0.10
- **Styling**: Tailwind CSS 4
- **Testing**: Playwright

## Getting Started

### Development Server

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Building for Production

```bash
npm run build
npm run start
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Run tests in headed mode (see browser)
npm run test:headed

# View test report
npm run test:report
```

### Writing Tests

Tests are located in `tests/`. See the [tests/README.md](./tests/README.md) for detailed documentation.

**Test Structure:**

- `tests/e2e/` - End-to-end test specs
- `tests/fixtures/` - Reusable test data and flows
- `tests/utils/` - Helper functions and custom assertions

**Example Test:**

```typescript
import { test, expect } from "@playwright/test";

test("should render the canvas", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator(".react-flow");
  await expect(canvas).toBeVisible();
});
```

### Best Practices

1. Use `data-testid` attributes for stable element selection
2. Wait for elements using Playwright's built-in waiting mechanisms
3. Use fixtures for reusable test data
4. Keep tests independent and isolated
5. Use descriptive test names

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── nodes/       # Node components for React Flow
│   │   └── ...
│   ├── store/           # Zustand stores
│   ├── utils/           # Utility functions
│   └── lib/             # Shared libraries
├── tests/               # Playwright E2E tests
├── public/              # Static assets
└── playwright.config.ts # Playwright configuration
```

## Development Guidelines

- Follow TypeScript strict mode
- Use functional components only
- Implement proper error handling
- Add JSDoc comments for complex logic
- Ensure responsive design
- Follow accessibility best practices

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Flow Documentation](https://reactflow.dev)
- [Playwright Documentation](https://playwright.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
