# Mutable Data Slice

## Overview

Extends the base Data Slice with safe immutable updates using Immer drafts. Enables direct mutation syntax while maintaining immutability guarantees.

## When to Use

- **Form fields**: Update nested properties without complex spreading
- **Complex objects**: Modify arrays, nested objects safely
- **Real-time editing**: Collaborative editors, live document updates
- **Performance optimization**: Efficient updates for deeply nested structures

## When NOT to Use

- **Simple flat objects**: Base data slice with `setData` is cleaner
- **Primitive values**: No benefit over direct assignment
- **Read-only data**: Base slice provides sufficient functionality

## API Reference

### State

Inherits from Data Slice:

```ts
interface MutableDataSliceState<TData> extends DataSliceState<TData> {
  data: TData | null;
}
```

### Actions

Extends Data Slice actions:

```ts
interface MutableDataSliceActions<TData> extends DataSliceActions<TData> {
  setData: (data: TData | null) => void;
  updateData: (updater: (draft: TData) => void) => void;
}
```

### Creator Function

```ts
createMutableDataStoreSlice<TData>(
  initialData?: TData | null = null
): StateCreator<MutableDataSlice<TData>>
```

## Examples

## Architecture Details

### Null Safety Guard

The `updateData` method includes a safety guard:

```ts
updateData: (updater: (draft: TData) => void) => {
  if (draft.data == null) return; // No-op if data is null
  updater(draft.data as TData);
};
```

This prevents runtime errors when trying to update null data.

### Immer Integration

- Uses `produce()` for all mutations
- Provides draft objects for direct mutation syntax
- Maintains immutability guarantees automatically
- Optimizes with structural sharing

### Composition Pattern

Extends the base Data Slice:

```ts
return (set, get, api) => ({
  ...createDataStoreSlice<TData>(initialData)(set, get, api),
  updateData: (updater) => {
    /* implementation */
  },
});
```

## Performance Characteristics

- **Updates**: O(1) for property access, O(n) for nested traversal
- **Memory**: Structural sharing minimizes copying
- **Re-renders**: Only changed properties trigger updates
- **Safety**: No-op when data is null (zero cost)

## Dependencies

### External Dependencies

```ts
import { StateCreator } from "zustand"; // Store creation
import { produce } from "immer"; // Immutable updates
```

### Internal Dependencies

```ts
import { MutableDataSlice } from "./data-mutable.store.slice.types";
import { createDataStoreSlice } from "../data/data.store.slice";
```

### Dependency Notes

- **Requires**: Base data slice for foundational functionality
- **Extends**: All base slice capabilities (setData, data state)
- **Provides**: Additional updateData method for mutations

## Advanced Patterns

### Conditional Updates

```ts
function updateIfValid(newEmail: string) {
  updateData((draft) => {
    if (newEmail.includes("@")) {
      draft.profile.email = newEmail;
    }
  });
}
```

### Batch Updates

```ts
function batchUserUpdates(updates: Partial<UserProfile>) {
  updateData((draft) => {
    if (updates.name) draft.name = updates.name;
    if (updates.profile?.bio) draft.profile.bio = updates.profile.bio;
    if (updates.tags) draft.tags = [...updates.tags];
  });
}
```

### Computed Properties

```ts
function updateUserWithComputed() {
  updateData((draft) => {
    draft.profile.displayName = `${draft.name} (${draft.profile.bio})`;
    draft.profile.lastUpdated = new Date().toISOString();
  });
}
```

## Testing Guidelines

- See example tests colocated with examples (where applicable)

## Common Patterns

### Form Binding

```ts
function FormField<T extends keyof UserProfile>({
  field,
  value,
  onChange,
}: {
  field: T;
  value: UserProfile[T];
  onChange: (value: UserProfile[T]) => void;
}) {
  return (
    <input
      value={String(value)}
      onChange={(e) => {
        updateData((draft) => {
          (draft[field] as any) = e.target.value;
        });
      }}
    />
  );
}
```

### Optimistic Updates

```ts
async function saveUserProfile(updates: Partial<UserProfile>) {
  // Optimistic update
  updateData((draft) => {
    Object.assign(draft.profile, updates);
  });

  try {
    await api.updateUser(updates);
  } catch (error) {
    // Revert on error
    setData(previousData);
  }
}
```

## Migration Guide

- From manual spreading or complex `useState` patterns to direct draft mutations: see examples

## Troubleshooting

### Common Issues

1. **Mutations not reflecting**

   - Ensure data is not null before calling updateData
   - Check if selectors are narrow enough

2. **TypeScript errors in updater**

   - Verify TData is properly inferred
   - Use type assertions sparingly

3. **Performance with large objects**
   - Immer handles most cases efficiently
   - Consider breaking into smaller slices for very large data

### Anti-patterns

1. **Calling methods in updater**

   ```ts
   // ❌ Don't do this
   updateData((draft) => {
     draft.updateSomething(); // Methods not preserved
   });

   // ✅ Do this instead
   updateData((draft) => {
     draft.someProperty = newValue;
   });
   ```

2. **Returning from updater**

   ```ts
   // ❌ Don't return
   updateData((draft) => {
     return { ...draft, name: "New" }; // Ignored
   });

   // ✅ Mutate directly
   updateData((draft) => {
     draft.name = "New";
   });
   ```

## Related Patterns

- [Data Slice (Base)](../data/) - Foundation for this pattern
- [Data Restorable Slice](../data-restorable/) - Adds reset capability
- [Data Refreshable Slice](../data-refreshable/) - For server sync
- [List Mutable Slice](../list-mutable/) - For mutable collections
