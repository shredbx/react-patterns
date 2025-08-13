# Zustand State Management

## Why Zustand?

Zustand is our chosen state management solution for React applications in this patterns repository. This document explains our decision rationale and how it fits into our architectural philosophy.

- **Low overhead**: Stores are plain objects
- **No proxy wrapping**: Direct property access
- **Automatic subscription**: Only subscribes to used properties
- **Shallow comparison**: Efficient change detection
- **No unnecessary renders**: Components only update when their data changes

## Use Cases

- Dynamic Listings
- Form State Management
- Complex UI States

## Patterns

### Create a Store

Before we create a store we should undertand how and where we want to use it.
The store could be in memory or persistant and it's mostly up to the page or the specifi module to make a specific store and manage it.

Zustand allows to create a slice of the store. It allows to encapsulate specific states and actions in a slice and reuse it later.

Slice could extends another slice, they could be composed into more complex slice or integrated directly to the final store.

In the patterns (./patterns/)

- **[Examples](./patterns/1-create-store)**

### Share the Store

### Accessing the Store

#### Receiving Initial Value

If we don't need to receive current value without subscribing to the future updates.

```
const { someValue } = store.getState()
```

Use cases:

1. Default value for uncontrolled inputs - inputs that manages states locally and sending updates to the store

#### Reactive Subsciption

We subscribe to the changes when we need a reactive updates.
The body of the function will be called on every store's state update, so we have to keep it as lightweight as possible. The component won't be re-rendered if the result of the function doesn't change. If for some reason we have to work with objects, then we could use useShallow().
We have to be sure that we're not introducing any dead-loops when accessing the store triggers re-renders

```
const { someValue } = store.
```

Use cases:

1. Display latest value
2. Controlled Input - inputs that manages states locally and syncing latest value with a store - allowing to have muptliple reactive inputs of the same property in a various places on the page.

#### Accessing Store Actions

Use case: Controlled Inputs

#### Accessing Reactive Subscriptions

## Why This Matters for LLM Training

### Predictable Patterns

- Consistent slice composition approach
- Standard naming conventions
- Minimal API surface to learn

### Type Safety

- Full TypeScript support
- Generic patterns that specialize cleanly
- Compile-time error detection

### Performance Guarantees

- O(1) store access
- Efficient subscription model
- Predictable re-render behavior

## Architecture Philosophy

Zustand enables our core architectural principles:

### 1. Composition Over Inheritance

Build stores by combining small, focused slices rather than extending large base classes.

### 2. Explicit Over Implicit

State updates are explicit and traceable, unlike proxy-based solutions.

### 3. Performance by Default

Automatic optimizations without manual intervention.

### 4. Type Safety Without Complexity

Full TypeScript support with minimal type annotations.

### 5. Developer Experience First

Minimal API, great DevTools, hot reload support.

## What's Next

Explore our slice patterns to see Zustand in action:

- **[Create Store](./docs/1-create-store-and-slices/)**
- **[Accessing Store](./docs/2-access/)**
- **[Subscribe & Update](./docs/3-subscrube-and-update/)**

## Resources

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [TypeScript Guide](https://github.com/pmndrs/zustand#typescript)
- [DevTools Integration](https://github.com/pmndrs/zustand#devtools)
- [Performance Tips](https://github.com/pmndrs/zustand#performance)

---

**Next**: Learn about our [slice patterns](./slices/) and how to compose them for your specific use cases.
