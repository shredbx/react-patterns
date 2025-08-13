# Data Slice (Base)

## Overview

The fundamental building block for managing a single piece of typed data with null safety. This slice provides the foundation for all data-related patterns in the React Patterns repository.

For efficienct updates we use **[Immer](/libraries/immer) ** to mutate the state

## When to Use

- **Form state**: User profiles, settings, selected items
- **Simple state**: Current user, active product, configuration
- **Foundation pattern**: Base for mutable, restorable, and refreshable slices
- **Null-safe data**: When you need explicit "no data" state

## When NOT to Use

- **Complex server state**: Use TanStack Query instead
- **Lists/collections**: Use list slices for multiple items
- **State machines**: Use proper state machine libraries for complex workflows

### Null Safety Pattern

- Uses `TData | null` explicitly (not `undefined`)
- `null` represents "no data" state clearly
- Prevents common undefined errors in TypeScript

## API Reference

### Creator Function

```ts
createDataStoreSlice<TData>(
  initialData?: TData | null = null
): StateCreator<DataSlice<TData>>
```

## Example

- See colocated example: `./example.tsx`

## Architecture Details

### Immer Integration

- All state updates use `produce()` for immutability
- Structural sharing optimizes performance
- Type casting handles generic constraints safely

### Generic Design

- Reusable across any data type
- Type-safe operations without runtime overhead
- Clean composition with other slice patterns

## Performance Characteristics

- **Access**: O(1) - direct property lookup
- **Updates**: O(1) - Immer with structural sharing
- **Memory**: Minimal overhead with null state
- **Re-renders**: Only when data reference changes

## Dependencies

### External Dependencies

```ts
import { StateCreator } from "zustand"; // Store creation
import { produce } from "immer"; // Immutable updates
```

### Internal Dependencies

```ts
import { DataSlice } from "./data.store.slice.types";
```

## Extension Patterns

This base slice serves as the foundation for:

- **data-mutable/**: Adds `updateData(updater)` for nested mutations
- **data-restorable/**: Adds `reset()` functionality with initial state
- **data-refreshable/**: Adds server sync with `refresh(freshData)`

## Common Patterns

### Selectors

```ts
// Narrow selectors prevent unnecessary re-renders
const userName = useUserStore((state) => state.data?.name);
const isLoggedIn = useUserStore((state) => state.data !== null);
```

### Conditional Rendering

```ts
function ConditionalComponent() {
  const user = useUserStore((state) => state.data);

  if (!user) return <LoginPrompt />;
  return <UserDashboard user={user} />;
}
```

### Form Integration

```ts
function UserForm() {
  const { data: user, setData: setUser } = useUserStore();

  const handleSubmit = (formData: User) => {
    setUser(formData);
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

## Testing Guidelines

### Unit Testing the Slice

```ts
import { createDataStoreSlice } from "./data.store.slice";

describe("DataStoreSlice", () => {
  it("should initialize with null data", () => {
    const slice = createDataStoreSlice<string>();
    const mockSet = jest.fn();
    const result = slice(mockSet, jest.fn(), jest.fn());

    expect(result.data).toBe(null);
  });

  it("should set data correctly", () => {
    const slice = createDataStoreSlice<string>();
    const mockSet = jest.fn();
    const result = slice(mockSet, jest.fn(), jest.fn());

    result.setData("test");
    expect(mockSet).toHaveBeenCalled();
  });
});
```

### Integration Testing

```ts
import { create } from "zustand";

describe("Data Store Integration", () => {
  it("should handle user data flow", () => {
    const store = create((...args) => ({
      ...createDataStoreSlice<User>(null)(...args),
    }));

    expect(store.getState().data).toBe(null);

    store.getState().setData({ id: "1", name: "John" });
    expect(store.getState().data?.name).toBe("John");
  });
});
```

## Migration Guide

### From useState

```ts
// Before: useState
const [user, setUser] = useState<User | null>(null);

// After: Data slice
const { data: user, setData: setUser } = useUserStore();
```

### From Custom Reducers

```ts
// Before: useReducer
const [state, dispatch] = useReducer(userReducer, { user: null });

// After: Data slice
const { data: user, setData: setUser } = useUserStore();
```

## Troubleshooting

### Common Issues

1. **TypeScript errors with generics**

   - Ensure TData is properly specified
   - Use type assertions only when necessary

2. **Unexpected re-renders**

   - Use narrow selectors: `state => state.data?.property`
   - Avoid selecting entire state object

3. **Null safety warnings**
   - Always check `data !== null` before accessing properties
   - Use optional chaining: `data?.property`

### Performance Issues

1. **Frequent updates**

   - Consider using data-mutable slice for nested updates
   - Batch multiple setData calls if possible

2. **Large objects**
   - Immer handles deep cloning efficiently
   - Consider normalizing data for very large datasets

## Related Patterns

- [Data Mutable Slice](../data-mutable/) - For nested object updates
- [Data Restorable Slice](../data-restorable/) - For reset functionality
- [Data Refreshable Slice](../data-refreshable/) - For server synchronization
- [List Slice](../list/) - For collections of data
