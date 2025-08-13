# React Patterns Documentation

Ready-to-use React patterns with TypeScript support and comprehensive testing.

## Installation

```bash
pnpm install react-patterns-docs
```

## Usage

Import patterns directly in your React components:

```typescript
import { createStoreExample } from "react-patterns-docs";
// or specific library patterns
import { DataSlice } from "react-patterns-docs/libraries/zustand";
```

## Testing

All patterns include tests demonstrating usage:

```bash
pnpm test:watch
```

## Available Patterns

- **Zustand State Management**: [View Documentation](./content/libraries/zustand/README.md)
  - Data slice patterns
  - List management patterns
  - Mutable state patterns

## Development Workflow

1. Start with a failing test (`pnpm test:watch`)
2. Implement the pattern
3. Stop when tests pass
4. Import and use in your app
