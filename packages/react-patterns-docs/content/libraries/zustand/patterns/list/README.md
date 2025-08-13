# List Slice (Base)

## Overview

The fundamental building block for managing collections of items keyed by ID, enabling O(1) lookups and efficient data access. This slice provides the foundation for all list-related patterns in the React Patterns repository.

## When to Use

- **Collections**: Users, products, categories, tags, images
- **Normalized data**: Avoid nested arrays, enable fast lookups by ID
- **Foundation pattern**: Base for mutable and reorderable list slices
- **Performance-critical lists**: When O(1) access is important

## When NOT to Use

- **Simple arrays**: Use regular arrays for ordered lists without frequent lookups
- **Server state**: Use TanStack Query for remote collections
- **Complex relationships**: Consider specialized data structures for graphs

## API Reference

### State

```ts
interface ListSliceState<TId, TData> {
  data: Record<TId, TData> | null;
}
```

### Actions

```ts
interface ListSliceActions<TId, TData> {
  setData: (data: Record<TId, TData> | null) => void;
}
```

### Creator Function

```ts
createListStoreSlice<TId, TData>(
  initialList?: Record<TId, TData> = {}
): StateCreator<ListSlice<TId, TData>>
```

## Examples

## Architecture Details

### Record-Based Storage

Uses `Record<TId, TData>` for:

- **O(1) access**: Direct property lookup by ID
- **Efficient updates**: Spread operator for immutable updates
- **Type safety**: Full TypeScript support for keys and values

### Generic Design

```ts
// Flexible ID types
createListStoreSlice<string, User>({}); // String IDs
createListStoreSlice<number, Product>({}); // Numeric IDs
createListStoreSlice<symbol, Config>({}); // Symbol IDs
```

### Null Safety

- Uses `Record<ID, DATA> | null` to represent "no data" state
- Prevents errors when list is not yet loaded
- Enables conditional rendering patterns

## Performance Characteristics

- **Access by ID**: O(1) - direct property lookup
- **Iteration**: O(n) - `Object.values()` or `Object.entries()`
- **Updates**: O(1) - spread operator with structural sharing
- **Memory**: Efficient with Immer's structural sharing

## Dependencies

### External Dependencies

```ts
import { StateCreator } from "zustand"; // Store creation
import { produce } from "immer"; // Immutable updates
```

### Internal Dependencies

```ts
import { ListSlice } from "./list.store.slice.types";
```

### Type Dependencies

Inherits from Data Slice types for consistency:

```ts
interface ListSliceState<TId, TData>
  extends DataSliceState<Record<TId, TData>> {}
```

## Advanced Patterns

### Normalized Data Loading

```ts
// Convert API response to normalized format
async function loadNormalizedData<T extends { id: string }>(
  apiCall: () => Promise<T[]>
) {
  const items = await apiCall();

  const normalized = items.reduce(
    (acc, item) => ({
      ...acc,
      [item.id]: item,
    }),
    {} as Record<string, T>
  );

  return normalized;
}

// Usage
const loadProducts = () => loadNormalizedData(() => api.getProducts());
const loadUsers = () => loadNormalizedData(() => api.getUsers());
```

### Efficient Selectors

```ts
// Memoized selectors for expensive computations
const selectUserStats = createSelector(
  (state: UserStore) => state.data,
  (users) => {
    if (!users) return null;

    const values = Object.values(users);
    return {
      total: values.length,
      admins: values.filter((u) => u.role === "admin").length,
      online: values.filter(
        (u) => u.lastLogin && Date.now() - u.lastLogin.getTime() < 300000
      ).length,
    };
  }
);
```

### Batch Operations

```ts
function useBatchOperations<ID extends string, T>() {
  const { data, setData } = useListStore<ID, T>();

  const batchUpdate = useCallback(
    (updates: Record<ID, Partial<T>>) => {
      if (!data) return;

      const updated = Object.entries(updates).reduce(
        (acc, [id, update]) => ({
          ...acc,
          [id]: { ...acc[id as ID], ...update },
        }),
        data
      );

      setData(updated);
    },
    [data, setData]
  );

  const batchDelete = useCallback(
    (ids: ID[]) => {
      if (!data) return;

      const filtered = Object.fromEntries(
        Object.entries(data).filter(([id]) => !ids.includes(id as ID))
      ) as Record<ID, T>;

      setData(filtered);
    },
    [data, setData]
  );

  return { batchUpdate, batchDelete };
}
```

## Testing Guidelines

### Unit Testing

```ts
import { createListStoreSlice } from "./list.store.slice";

describe("ListStoreSlice", () => {
  type TestItem = { id: string; name: string };

  it("should initialize with empty list", () => {
    const slice = createListStoreSlice<string, TestItem>();
    const mockSet = jest.fn();
    const result = slice(mockSet, jest.fn(), jest.fn());

    expect(result.data).toEqual({});
  });

  it("should handle list updates", () => {
    const initialList = { "1": { id: "1", name: "Item 1" } };
    const slice = createListStoreSlice<string, TestItem>(initialList);
    const mockSet = jest.fn();
    const result = slice(mockSet, jest.fn(), jest.fn());

    const newList = { "2": { id: "2", name: "Item 2" } };
    result.setData(newList);

    expect(mockSet).toHaveBeenCalledWith(expect.any(Function));
  });
});
```

### Integration Testing

```ts
describe("List Store Integration", () => {
  it("should handle normalized data workflow", () => {
    const store = create((...args) => ({
      ...createListStoreSlice<string, User>({})(...args),
    }));

    const users = [
      { id: "1", name: "John", email: "john@example.com", role: "user" },
      { id: "2", name: "Jane", email: "jane@example.com", role: "admin" },
    ];

    // Normalize and set
    const normalized = users.reduce(
      (acc, user) => ({
        ...acc,
        [user.id]: user,
      }),
      {}
    );

    store.getState().setData(normalized);

    // Test O(1) access
    expect(store.getState().data?.["1"]?.name).toBe("John");
    expect(store.getState().data?.["2"]?.role).toBe("admin");
  });
});
```

## Common Patterns

### Conditional Rendering

```ts
function ItemList<T>({
  renderItem,
}: {
  renderItem: (item: T) => React.ReactNode;
}) {
  const { data: items } = useListStore<string, T>();

  if (!items) {
    return <div>Loading...</div>;
  }

  const itemList = Object.values(items);

  if (itemList.length === 0) {
    return <div>No items found</div>;
  }

  return <div>{itemList.map((item) => renderItem(item))}</div>;
}
```

### Search and Filter

```ts
function useListSearch<T>(
  searchFn: (item: T, query: string) => boolean,
  query: string
) {
  return useListStore((state) => {
    if (!state.data || !query.trim()) return Object.values(state.data || {});

    return Object.values(state.data).filter((item) =>
      searchFn(item, query.toLowerCase())
    );
  });
}

// Usage
const searchResults = useListSearch<Product>(
  (product, query) =>
    product.name.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query),
  searchQuery
);
```

### Pagination Support

```ts
function usePaginatedList<T>(pageSize: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: items } = useListStore<string, T>();

  const paginatedData = useMemo(() => {
    if (!items) return { items: [], totalPages: 0, currentPage: 1 };

    const itemList = Object.values(items);
    const totalPages = Math.ceil(itemList.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      items: itemList.slice(startIndex, endIndex),
      totalPages,
      currentPage,
      totalItems: itemList.length,
    };
  }, [items, currentPage, pageSize]);

  return {
    ...paginatedData,
    setCurrentPage,
    nextPage: () =>
      setCurrentPage((p) => Math.min(p + 1, paginatedData.totalPages)),
    prevPage: () => setCurrentPage((p) => Math.max(p - 1, 1)),
  };
}
```

## Migration Guide

### From Array-Based State

```ts
// Before: Array with find operations
const [users, setUsers] = useState<User[]>([]);
const findUser = (id: string) => users.find((u) => u.id === id); // O(n)

// After: Record-based with O(1) access
const { data: users, setData: setUsers } = useUserStore();
const findUser = (id: string) => users?.[id]; // O(1)
```

### From Manual Normalization

```ts
// Before: Manual state management
const [usersById, setUsersById] = useState<Record<string, User>>({});
const [userIds, setUserIds] = useState<string[]>([]);

const addUser = (user: User) => {
  setUsersById((prev) => ({ ...prev, [user.id]: user }));
  setUserIds((prev) => [...prev, user.id]);
};

// After: List slice handles normalization
const { data: users, setData: setUsers } = useUserStore();

const addUser = (user: User) => {
  const current = users || {};
  setUsers({ ...current, [user.id]: user });
};
```

## Troubleshooting

### Common Issues

1. **ID type mismatches**

   - Ensure TId matches your data structure
   - Use consistent string/number types throughout

2. **Performance with large lists**

   - Use narrow selectors to prevent unnecessary re-renders
   - Consider virtualization for very large lists

3. **Memory leaks with large datasets**
   - Clear unused data periodically
   - Use pagination or lazy loading for massive datasets

### Anti-patterns

1. **Converting to arrays unnecessarily**

   ```ts
   // ❌ Don't convert to array for single item access
   const user = Object.values(users).find((u) => u.id === targetId);

   // ✅ Use direct access
   const user = users[targetId];
   ```

2. **Frequent full list replacements**

   ```ts
   // ❌ Don't replace entire list for single updates
   setUsers((prev) => ({ ...prev, [id]: updatedUser }));

   // ✅ Use mutable list slice for frequent updates
   // Or batch updates when possible
   ```

## Related Patterns

- [List Mutable Slice](../list-mutable/) - For add/remove operations
- [List Reorderable Slice](../list-reorderable/) - For drag-and-drop ordering
- [Data Slice (Base)](../data/) - Shared foundation pattern
- [Normalized Data Patterns](../../patterns/normalization/) - Implementation guidance
