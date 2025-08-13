# React Patterns Monorepo

This monorepo contains React patterns examples and a demo web application to showcase them.

## Project Structure

```
repo/
├── apps/
│   └── react-patterns-demo-web/     # Next.js demo application
└── packages/
    └── react-patterns-docs/         # Documentation and examples library
        └── libraries/
            └── zustand/
                └── 1-create-examples/
                    ├── 1-create-store-example.ts
                    ├── 2-create-slice-example.ts
                    └── 3-combine-slices-example.ts
```

## Packages

- **react-patterns-docs**: Documentation library containing React patterns examples with tests
- **react-patterns-demo-web**: Next.js web application demonstrating the patterns

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Build the packages:

   ```bash
   pnpm build:packages
   ```

3. Start the development servers:

   ```bash
   # Start the web demo app
   pnpm dev:web

   # Or start the patterns library in watch mode
   pnpm dev:patterns
   ```

## Usage

The web application imports and displays examples from the patterns library:

```typescript
import {
  createStoreExample,
  createSliceExample,
  combineSlicesExample,
} from "react-patterns-docs";
```

You can also import specific Zustand examples:

```typescript
import { ZustandExamples } from "react-patterns-docs";
// or
import { createStoreExample } from "react-patterns-docs/zustand";
```

## Available Scripts

- `pnpm dev:web` - Start the Next.js demo app
- `pnpm dev:patterns` - Start the patterns library in watch mode
- `pnpm build` - Build all packages and apps
- `pnpm build:packages` - Build only the packages
- `pnpm clean` - Clean all build outputs
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run tests for the patterns documentation
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage report

## Adding New Patterns

1. Create your pattern file in the appropriate library directory (e.g., `libraries/zustand/1-create-examples/`)
2. Create a corresponding test file next to it (e.g., `pattern-name.test.ts`)
3. Export it from the library's `index.ts` file
4. Update the main `packages/react-patterns-docs/index.ts` to include the new export
5. Run tests: `pnpm test`
6. Build the package: `pnpm build:packages`
7. The pattern will be available for import in the demo app

### Test Files

Each pattern should have a corresponding test file that demonstrates:

- Basic functionality testing
- Usage examples and documentation
- Expected behavior patterns
- Integration examples

Example test structure:

```typescript
// pattern-name.test.ts
import { yourPattern } from "./pattern-name";

describe("Your Pattern", () => {
  it("should demonstrate the pattern usage", () => {
    // Test and document how the pattern works
  });
});
```
