# Mutable List Slice

## Overview

Extends list management with local addition and deletion tracking for optimistic updates and dirty state management. Enables efficient change tracking without modifying the base list structure.

## When to Use

- **Form lists**: Track changes before server synchronization
- **Optimistic UI**: Show changes immediately, reconcile later with server
- **Dirty tracking**: Know what changed for efficient saves
- **Undo/redo**: Track operations for reversal capabilities
- **Collaborative editing**: Track local changes for conflict resolution

## When NOT to Use

- **Read-only lists**: Base list slice is sufficient
- **Simple arrays**: No benefit over standard array operations
- **Real-time only**: Use refreshable patterns for server-driven updates

## API Reference

### State

Extends base list with change tracking:

```ts
interface MutableListSliceState<TId> {
  added: TId[];
  deleted: TId[];
}

interface MutableListSlice<TId, TData> extends MutableListSliceState<TId> {
  list: Record<TId, TData>; // From base list slice
}
```

### Actions

```ts
interface MutableListSliceActions<TId, TData> {
  add: (id: TId, data: TData) => void;
  remove: (id: TId) => void;
}
```

### Creator Function

```ts
createMutableListStoreSlice<TId, TData>():
  StateCreator<MutableListSlice<TId, TData>>
```

Note: This slice requires composition with a base list slice.

## Examples

### Todo List with Optimistic Updates

```ts
type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
};

const useTodoStore = create((...args) => ({
  ...createListStoreSlice<string, Todo>({})(...args),
  ...createMutableListStoreSlice<string, Todo>()(...args),
}));

// Add todo optimistically
function addTodo(text: string) {
  const todo: Todo = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: new Date(),
  };

  useTodoStore.getState().add(todo.id, todo);

  // Sync with server in background
  syncTodoWithServer(todo);
}

// Remove todo optimistically
function deleteTodo(todoId: string) {
  useTodoStore.getState().remove(todoId);

  // Sync with server in background
  deleteTodoOnServer(todoId);
}

// Background sync functions
async function syncTodoWithServer(todo: Todo) {
  try {
    const savedTodo = await api.createTodo(todo);

    // Update with server response (might have different ID or fields)
    const { list, setData } = useTodoStore.getState();
    if (list) {
      setData({
        ...list,
        [savedTodo.id]: savedTodo,
      });
    }
  } catch (error) {
    // Remove failed todo on error
    useTodoStore.getState().remove(todo.id);
    showError("Failed to save todo");
  }
}

async function deleteTodoOnServer(todoId: string) {
  try {
    await api.deleteTodo(todoId);
    // Success - no action needed, already removed optimistically
  } catch (error) {
    // Restore on error
    const originalTodo = await api.getTodo(todoId);
    useTodoStore.getState().add(todoId, originalTodo);
    showError("Failed to delete todo");
  }
}

// Component with visual feedback
function TodoList() {
  const { list: todos, added, deleted } = useTodoStore();

  if (!todos) return <div>Loading todos...</div>;

  return (
    <div>
      {Object.values(todos).map((todo) => (
        <div
          key={todo.id}
          className={`todo-item ${
            added.includes(todo.id) ? "pending-add" : ""
          } ${deleted.includes(todo.id) ? "pending-delete" : ""}`}
        >
          <span>{todo.text}</span>
          {added.includes(todo.id) && <span className="status">Saving...</span>}
          {deleted.includes(todo.id) && (
            <span className="status">Deleting...</span>
          )}
          <button onClick={() => deleteTodo(todo.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

## Architecture Details

### Change Tracking Logic

The slice maintains two arrays for tracking changes:

```ts
// Adding an item
add: (id, data) => {
  // 1. Add to list (O(1))
  draft.list[id] = data;

  // 2. Track in added array (if not already there)
  if (!draft.added.includes(id)) {
    draft.added.push(id);
  }

  // 3. Remove from deleted array (restoration case)
  draft.deleted = draft.deleted.filter((deletedId) => deletedId !== id);
};

// Removing an item
remove: (id) => {
  // 1. Remove from list
  delete draft.list[id];

  // 2. Track in deleted array (if not already there)
  if (!draft.deleted.includes(id)) {
    draft.deleted.push(id);
  }

  // 3. Remove from added array (cancel addition)
  draft.added = draft.added.filter((addedId) => addedId !== id);
};
```

### State Consistency

The slice ensures:

- Items can't be in both `added` and `deleted` arrays
- List state reflects current UI state
- Change arrays track net operations

### Composition Requirements

This slice **requires** composition with a base list slice:

```ts
// ❌ Won't work - missing base list
const store = create((...args) => ({
  ...createMutableListStoreSlice<string, Item>()(...args),
}));

// ✅ Correct composition
const store = create((...args) => ({
  ...createListStoreSlice<string, Item>({})(...args),
  ...createMutableListStoreSlice<string, Item>()(...args),
}));
```

## Performance Characteristics

- **Add operation**: O(1) for list update, O(n) for array operations (but n is typically small)
- **Remove operation**: O(1) for list deletion, O(n) for array operations
- **Change detection**: O(1) - check array lengths
- **Memory**: Additional storage for two change tracking arrays

## Dependencies

### External Dependencies

```ts
import { StateCreator } from "zustand"; // Store creation
import { produce } from "immer"; // Immutable updates
```

### Internal Dependencies

```ts
import { MutableListSlice } from "./list-mutable.store.slice.types";
```

### Composition Dependencies

**Required**: Must be composed with a base list slice that provides:

- `list: Record<TId, TData>`
- `setData: (data: Record<TId, TData> | null) => void`

## Advanced Patterns

### Batch Operations

```ts
function useBatchMutations<ID, T>() {
  const { add, remove } = useMutableListStore<ID, T>();

  const batchAdd = useCallback(
    (items: Array<{ id: ID; data: T }>) => {
      items.forEach(({ id, data }) => add(id, data));
    },
    [add]
  );

  const batchRemove = useCallback(
    (ids: ID[]) => {
      ids.forEach((id) => remove(id));
    },
    [remove]
  );

  return { batchAdd, batchRemove };
}
```

### Change Statistics

```ts
function useChangeStatistics() {
  const { added, deleted, list } = useMutableListStore();

  return useMemo(() => {
    const totalItems = Object.keys(list || {}).length;
    const netChange = added.length - deleted.length;

    return {
      totalItems,
      added: added.length,
      deleted: deleted.length,
      netChange,
      hasChanges: added.length > 0 || deleted.length > 0,
      changePercentage:
        totalItems > 0 ? (Math.abs(netChange) / totalItems) * 100 : 0,
    };
  }, [added, deleted, list]);
}
```

### Conflict Resolution

```ts
function useConflictResolution<ID, T>() {
  const { added, deleted, list, setData } = useMutableListStore<ID, T>();

  const resolveConflicts = useCallback(
    async (serverData: Record<ID, T>) => {
      // Items we added locally
      const locallyAdded = added.reduce((acc, id) => {
        if (list?.[id]) {
          acc[id] = list[id];
        }
        return acc;
      }, {} as Record<ID, T>);

      // Merge server data with local additions
      const merged = {
        ...serverData,
        ...locallyAdded,
      };

      // Remove items we deleted locally
      deleted.forEach((id) => {
        delete merged[id];
      });

      // Update store with resolved state
      setData(merged);

      return {
        addedLocally: Object.keys(locallyAdded),
        deletedLocally: deleted,
        serverItems: Object.keys(serverData),
      };
    },
    [added, deleted, list, setData]
  );

  return { resolveConflicts };
}
```

## Testing Guidelines

### Unit Testing

```ts
import { createMutableListStoreSlice } from "./list-mutable.store.slice";

describe("MutableListStoreSlice", () => {
  it("should track added items", () => {
    const slice = createMutableListStoreSlice<string, { name: string }>();
    const mockSet = jest.fn();
    const result = slice(mockSet, jest.fn(), jest.fn());

    result.add("1", { name: "Item 1" });

    expect(mockSet).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should handle add-remove cycles", () => {
    const slice = createMutableListStoreSlice<string, { name: string }>();
    const mockSet = jest.fn();
    const result = slice(mockSet, jest.fn(), jest.fn());

    // Add then remove should result in no net change
    result.add("1", { name: "Item 1" });
    result.remove("1");

    // Should have been called twice
    expect(mockSet).toHaveBeenCalledTimes(2);
  });
});
```

### Integration Testing

```ts
describe("Mutable List Store Integration", () => {
  it("should handle full workflow", () => {
    const store = create((...args) => ({
      ...createListStoreSlice<string, TestItem>({})(...args),
      ...createMutableListStoreSlice<string, TestItem>()(...args),
    }));

    // Add item
    store.getState().add("1", { id: "1", name: "Test" });

    let state = store.getState();
    expect(state.list).toHaveProperty("1");
    expect(state.added).toContain("1");
    expect(state.deleted).toHaveLength(0);

    // Remove item
    store.getState().remove("1");

    state = store.getState();
    expect(state.list).not.toHaveProperty("1");
    expect(state.added).toHaveLength(0); // Should cancel out
    expect(state.deleted).toHaveLength(0); // Should cancel out
  });
});
```

## Common Patterns

### Optimistic UI with Rollback

```ts
async function optimisticOperation<ID, T>(
  operation: () => Promise<void>,
  rollback: () => void
) {
  try {
    await operation();
  } catch (error) {
    rollback();
    throw error;
  }
}

// Usage
const optimisticAdd = async (id: ID, data: T) => {
  const { add, remove } = store.getState();

  add(id, data); // Optimistic

  await optimisticOperation(
    () => api.addItem(data),
    () => remove(id) // Rollback
  );
};
```

### Change Persistence

```ts
function useAutoPersist<ID, T>(interval: number = 30000) {
  const { added, deleted, hasChanges } = useChangeStatistics();

  useEffect(() => {
    if (!hasChanges) return;

    const timer = setInterval(async () => {
      await syncChanges();
    }, interval);

    return () => clearInterval(timer);
  }, [hasChanges, interval]);
}
```

### Visual Change Indicators

```ts
function ItemList<T extends { id: string }>() {
  const { list, added, deleted } = useMutableListStore<string, T>();

  return (
    <div>
      {Object.values(list || {}).map((item) => (
        <div
          key={item.id}
          className={`item ${added.includes(item.id) ? "item--added" : ""} ${
            deleted.includes(item.id) ? "item--deleted" : ""
          }`}
        >
          {/* Item content */}
        </div>
      ))}
    </div>
  );
}
```

## Migration Guide

### From Manual Change Tracking

```ts
// Before: Manual state management
const [items, setItems] = useState<Record<string, Item>>({});
const [addedItems, setAddedItems] = useState<string[]>([]);
const [deletedItems, setDeletedItems] = useState<string[]>([]);

const addItem = (id: string, item: Item) => {
  setItems((prev) => ({ ...prev, [id]: item }));
  setAddedItems((prev) => [...prev, id]);
};

// After: Mutable list slice
const { list, added, deleted, add } = useMutableListStore();

const addItem = (id: string, item: Item) => {
  add(id, item); // Handles both list and tracking
};
```

### From Array-Based Operations

```ts
// Before: Array operations with manual tracking
const [items, setItems] = useState<Item[]>([]);
const [changes, setChanges] = useState<{ added: Item[]; deleted: Item[] }>({
  added: [],
  deleted: [],
});

// After: Record-based with automatic tracking
const { list, add, remove } = useMutableListStore();
```

## Troubleshooting

### Common Issues

1. **Missing base list slice**

   - Ensure composition includes base list slice
   - Verify `list` property is available

2. **Changes not tracking correctly**

   - Check that add/remove methods are used (not setData)
   - Verify change arrays are being read correctly

3. **Performance with many changes**
   - Consider batching operations
   - Clear change arrays periodically via server sync

### Anti-patterns

1. **Direct array modification**

   ```ts
   // ❌ Don't modify arrays directly
   added.push(newId);

   // ✅ Use slice methods
   add(newId, newData);
   ```

2. **Ignoring composition requirements**

   ```ts
   // ❌ Missing base slice
   const store = create((...args) => ({
     ...createMutableListStoreSlice()(...args),
   }));

   // ✅ Include base slice
   const store = create((...args) => ({
     ...createListStoreSlice({})(...args),
     ...createMutableListStoreSlice()(...args),
   }));
   ```

## Related Patterns

- [List Slice (Base)](../list/) - Required foundation
- [List Reorderable Slice](../list-reorderable/) - Can be combined for reorderable mutable lists
- [Data Mutable Slice](../data-mutable/) - Similar pattern for single items
- [Optimistic UI Patterns](../../patterns/optimistic-ui/) - Implementation examples
