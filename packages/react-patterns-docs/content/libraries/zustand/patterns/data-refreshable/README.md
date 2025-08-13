# Refreshable Data Slice

## Overview

Extends the Restorable Data Slice with fresh data handling and atomic refresh capabilities. Manages incoming data from remote sources while preserving restoration functionality.

## When to Use

- **Server synchronization**: Apply fresh data from API responses
- **Real-time updates**: Handle websocket/SSE data streams
- **Cache invalidation**: Refresh stale data with new values
- **Polling scenarios**: Periodic data refresh from remote sources
- **Optimistic updates**: Manage local changes with server reconciliation

## When NOT to Use

- **Simple server state**: Use TanStack Query for comprehensive server state management
- **Static data**: Restorable slice is sufficient for non-refreshing data
- **Complex sync logic**: Consider dedicated state machines for complex synchronization

## API Reference

### State

Extends Restorable Data Slice with fresh data tracking:

```ts
interface RefreshableDataSliceState<TData>
  extends RestorableDataSliceState<TData> {
  data: TData | null;
  initialData: TData | null;
  freshData: TData | null;
}
```

### Actions

Extends Restorable Data Slice actions with refresh capability:

```ts
interface RefreshableDataSliceActions<TData>
  extends RestorableDataSliceActions<TData> {
  setData: (data: TData | null) => void;
  reset: (data?: TData | null) => void;
  refresh: (data: TData | null) => void;
}
```

### Creator Function

```ts
createRefreshableDataStoreSlice<TData>(
  initialData?: TData | null = null
): StateCreator<RefreshableDataSlice<TData>>
```

## Examples

## Architecture Details

### Refresh Operation

The `refresh` method performs an atomic update:

```ts
refresh: (data: TData | null) => {
  set(
    produce<RefreshableDataSlice<TData>>((draft) => {
      // First update freshData
      (draft.freshData as unknown as TData | null) = data;
    })
  );

  // Then call reset to update both initialData and data
  get().reset(data ?? null);
};
```

This ensures:

1. `freshData` tracks the latest server state
2. `initialData` and `data` are synchronized via reset
3. All three values represent the new baseline

### State Relationships

```ts
// After refresh(serverData):
freshData === serverData; // Latest from server
initialData === serverData; // New baseline
data === serverData; // Current working data

// After local changes:
freshData === serverData; // Unchanged (server version)
initialData === serverData; // Unchanged (baseline)
data !== serverData; // Modified locally
```

### Composition Pattern

Builds on Restorable Data Slice:

```ts
return (set, get, api) => ({
  ...createRestorableDataStoreSlice<TData>(initialData)(set, get, api),
  freshData: initialData,
  refresh: (data) => {
    /* implementation */
  },
});
```

## Performance Characteristics

- **Refresh operations**: O(1) - two sequential state updates
- **Conflict detection**: O(1) - reference comparison
- **Memory**: Additional storage for `freshData` reference
- **Network**: Designed for efficient polling and real-time scenarios

## Dependencies

### External Dependencies

```ts
import { StateCreator } from "zustand"; // Store creation
import { produce } from "immer"; // Immutable updates
```

### Internal Dependencies

```ts
import { RefreshableDataSlice } from "./data-refreshable.store.slice.types";
import { createRestorableDataStoreSlice } from "../data-restorable/data-restorable.store.slice";
```

### Dependency Notes

- **Requires**: Restorable data slice for reset functionality
- **Extends**: All restorable slice capabilities (setData, reset, initialData)
- **Provides**: Additional freshData state and refresh method

## Advanced Patterns

### Optimistic Updates with Rollback

```ts
async function optimisticUpdate(changes: Partial<Document>) {
  const { data, setData, freshData, reset } = useDocumentStore.getState();

  if (!data) return;

  // Optimistic update
  const optimisticData = { ...data, ...changes };
  setData(optimisticData);

  try {
    const saved = await api.saveDocument(optimisticData);
    // Success: refresh with server response
    refresh(saved);
  } catch (error) {
    // Failure: rollback to fresh data
    reset(freshData);
    throw error;
  }
}
```

### Smart Polling with Change Detection

```ts
function useSmartPolling(documentId: string, interval = 30000) {
  const { freshData, refresh } = useDocumentStore();

  useEffect(() => {
    let lastEtag = freshData?.etag;

    const poll = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`, {
          headers: lastEtag ? { "If-None-Match": lastEtag } : {},
        });

        if (response.status === 304) {
          // No changes, skip refresh
          return;
        }

        const serverDoc = await response.json();
        lastEtag = response.headers.get("etag");

        refresh(serverDoc);
      } catch (error) {
        console.error("Polling failed:", error);
      }
    };

    const timer = setInterval(poll, interval);
    return () => clearInterval(timer);
  }, [documentId, interval, refresh]);
}
```

### Multi-User Collaboration

```ts
function useCollaborativeEditing() {
  const { data, freshData, setData, refresh } = useDocumentStore();

  // Detect concurrent modifications
  const hasConflict = useMemo(() => {
    if (!data || !freshData) return false;

    return (
      data.version < freshData.version && data.content !== freshData.content
    );
  }, [data, freshData]);

  // Merge operational transforms (example)
  const applyOperationalTransform = useCallback(
    (operations: Operation[]) => {
      if (!data) return;

      const transformed = operations.reduce((doc, op) => {
        return applyOperation(doc, op);
      }, data);

      setData(transformed);
    },
    [data, setData]
  );

  return {
    hasConflict,
    applyOperationalTransform,
    isOutOfSync: data?.version !== freshData?.version,
  };
}
```

## Testing Guidelines

- See example tests colocated with examples (where applicable)

## Common Patterns

### Selective Field Refresh

```ts
function refreshField<K extends keyof Document>(field: K, value: Document[K]) {
  const { data, refresh } = useDocumentStore.getState();
  if (!data) return;

  refresh({
    ...data,
    [field]: value,
  });
}
```

### Batch Refresh Operations

```ts
function refreshMultipleFields(updates: Partial<Document>) {
  const { data, refresh } = useDocumentStore.getState();
  if (!data) return;

  refresh({
    ...data,
    ...updates,
    lastUpdated: new Date().toISOString(),
  });
}
```

### Conditional Refresh

```ts
function smartRefresh(serverData: Document) {
  const { data, freshData, refresh } = useDocumentStore.getState();

  // Only refresh if server data is newer
  if (!freshData || serverData.version > freshData.version) {
    refresh(serverData);
    return true;
  }

  return false; // No refresh needed
}
```

## Migration Guide

- From manual fresh/baseline tracking to `refresh()` workflow: see examples

## Troubleshooting

### Common Issues

1. **State inconsistency after refresh**

   - Ensure refresh() is called instead of manual state updates
   - Check that reset() method works correctly in base slice

2. **Conflict detection not working**

   - Verify version fields or timestamps are being compared correctly
   - Use deep comparison for complex objects

3. **Performance issues with polling**
   - Implement smart polling with ETags or version checks
   - Consider WebSocket connections for real-time updates

### Anti-patterns

1. **Manual freshData updates**

   ```ts
   // ❌ Don't update freshData directly
   setFreshData(serverData);
   reset(serverData);

   // ✅ Use refresh for atomic updates
   refresh(serverData);
   ```

2. **Ignoring conflict states**

   ```ts
   // ❌ Don't ignore conflicts
   if (data !== freshData) {
     // No handling = lost data
   }

   // ✅ Handle conflicts explicitly
   if (data !== freshData) {
     showConflictResolver();
   }
   ```

## Related Patterns

- [Data Slice (Base)](../data/) - Foundation pattern
- [Data Restorable Slice](../data-restorable/) - Direct dependency
- [Data Mutable Slice](../data-mutable/) - Can be combined for mutable refreshes
- [Real-time Sync Patterns](../../patterns/real-time/) - Implementation examples
