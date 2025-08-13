# Restorable Data Slice

## Overview

Extends the base Data Slice with reset functionality and configurable initial state snapshots. Enables restoration to original values or updating to new baseline states.

## When to Use

- **Form reset**: Restore to original values or new defaults
- **Settings panels**: Revert changes, restore system defaults
- **Editing workflows**: Cancel changes, restore to saved snapshots
- **Undo functionality**: Single-step restoration to known good state

## When NOT to Use

- **Multi-step undo**: Use proper undo/redo libraries for complex history
- **Auto-save scenarios**: Consider data-refreshable for server synchronization
- **Simple state**: Base data slice is sufficient for non-restorable data

## API Reference

### State

Extends Data Slice with initial data tracking:

```ts
interface RestorableDataSliceState<TData> extends DataSliceState<TData> {
  data: TData | null;
  initialData: TData | null;
}
```

### Actions

Extends Data Slice actions with reset capability:

```ts
interface RestorableDataSliceActions<TData> extends DataSliceActions<TData> {
  setData: (data: TData | null) => void;
  reset: (data?: TData | null) => void;
}
```

### Creator Function

```ts
createRestorableDataStoreSlice<TData>(
  initialData?: TData | null = null
): StateCreator<RestorableDataSlice<TData>>
```

## Examples

## Architecture Details

### Reset Behavior

The `reset` method has two modes:

```ts
reset: (data?: TData | null) => {
  set(
    produce<RestorableDataSlice<TData>>((draft) => {
      const nextInitial = data !== undefined ? data : draft.initialData;
      draft.initialData = nextInitial;
      draft.data = nextInitial;
    })
  );
};
```

- **Without argument**: `reset()` restores `data` to current `initialData`
- **With argument**: `reset(newData)` updates both `initialData` and `data` to `newData`

### Composition Pattern

Extends the base Data Slice:

```ts
return (set, get, api) => ({
  ...createDataStoreSlice<TData>(initialData)(set, get, api),
  initialData,
  reset: (data?) => {
    /* implementation */
  },
});
```

### State Synchronization

Both `data` and `initialData` are always synchronized during reset operations to maintain consistency.

## Performance Characteristics

- **Reset operations**: O(1) - single state update
- **Change detection**: O(n) - requires comparison of data structures
- **Memory**: Additional storage for `initialData` reference
- **Updates**: Inherits efficient updates from base Data Slice

## Dependencies

### External Dependencies

```ts
import { StateCreator } from "zustand"; // Store creation
import { produce } from "immer"; // Immutable updates
```

### Internal Dependencies

```ts
import { RestorableDataSlice } from "./data-restorable.store.slice.types";
import { createDataStoreSlice } from "../data/data.store.slice";
```

### Dependency Notes

- **Requires**: Base data slice for foundational functionality
- **Extends**: All base slice capabilities (setData, data state)
- **Provides**: Additional initialData state and reset method

## Advanced Patterns

### Change Detection

```ts
function useChangeTracker() {
  const { data, initialData } = useFormStore();

  const hasChanges = useMemo(() => {
    if (!data || !initialData) return false;
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, initialData]);

  const changedFields = useMemo(() => {
    if (!data || !initialData) return [];

    return Object.keys(data).filter((key) => data[key] !== initialData[key]);
  }, [data, initialData]);

  return { hasChanges, changedFields };
}
```

### Navigation Guards

```ts
function useNavigationGuard() {
  const { data, initialData, reset } = useFormStore();
  const hasChanges = data !== initialData;

  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const confirmNavigation = (to: string) => {
    if (hasChanges) {
      const confirmed = window.confirm("Discard unsaved changes?");
      if (confirmed) {
        reset();
        navigate(to);
      }
    } else {
      navigate(to);
    }
  };

  return { confirmNavigation };
}
```

### Auto-Save Integration

```ts
function useAutoSave() {
  const { data, reset } = useDocumentStore();

  useEffect(() => {
    if (!data) return;

    const timer = setTimeout(async () => {
      try {
        const saved = await api.autoSave(data);
        // Update baseline after successful save
        reset(saved);
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timer);
  }, [data, reset]);
}
```

## Testing Guidelines

- See example tests colocated with examples (where applicable)

## Common Patterns

### Deep Change Detection

```ts
const hasChanges = useMemo(() => {
  if (!data || !initialData) return false;

  const dataKeys = Object.keys(data);
  const initialKeys = Object.keys(initialData);

  if (dataKeys.length !== initialKeys.length) return true;

  return dataKeys.some((key) => data[key] !== initialData[key]);
}, [data, initialData]);
```

### Selective Reset

```ts
function resetField<K extends keyof UserForm>(field: K) {
  const { data, initialData, setData } = useFormStore();
  if (!data || !initialData) return;

  setData({
    ...data,
    [field]: initialData[field],
  });
}
```

### Batch Operations

```ts
function resetMultipleFields(fields: Array<keyof UserForm>) {
  const { data, initialData, setData } = useFormStore();
  if (!data || !initialData) return;

  const updates = fields.reduce(
    (acc, field) => ({
      ...acc,
      [field]: initialData[field],
    }),
    {}
  );

  setData({ ...data, ...updates });
}
```

## Migration Guide

- From manual original/current state tracking to `reset()` workflow: see examples

## Troubleshooting

### Common Issues

1. **Changes not detected**

   - Use proper comparison (JSON.stringify for deep objects)
   - Check if data and initialData references are correct

2. **Reset not working**

   - Ensure reset() is called correctly
   - Verify initialData is set properly

3. **Performance with deep objects**
   - Consider shallow comparison for large objects
   - Use specific field tracking for complex forms

### Anti-patterns

1. **Mutating initialData directly**

   ```ts
   // ❌ Don't do this
   initialData.name = "New Name"; // Direct mutation

   // ✅ Use reset with new data
   reset({ ...initialData, name: "New Name" });
   ```

2. **Complex change detection logic**

   ```ts
   // ❌ Overly complex
   const hasChanges = useMemo(() => {
     // Complex nested comparison logic
   }, [data, initialData]);

   // ✅ Use JSON.stringify for deep comparison
   const hasChanges = JSON.stringify(data) !== JSON.stringify(initialData);
   ```

## Related Patterns

- [Data Slice (Base)](../data/) - Foundation for this pattern
- [Data Mutable Slice](../data-mutable/) - Can be combined for mutable resets
- [Data Refreshable Slice](../data-refreshable/) - Builds on this pattern
- [Form Management Patterns](../../patterns/forms/) - Common use case
