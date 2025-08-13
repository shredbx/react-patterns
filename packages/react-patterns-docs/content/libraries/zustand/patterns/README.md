# Zustand Slices: Opinionated, Generic, and Composable

This folder provides a comprehensive collection of reusable state management patterns built on Zustand. These slices are designed for both immediate use and long-term maintainability.ent patterns built on Zustand. These slices are designed for both immediate use and long-term maintainability.ent patterns built on Zustand. These slices are designed for both immediate use and long-term maintainability.

## Two Ways to Use These Slices

Use slices as-is with TypeScript generics for immediate productivity:

### 1. 🎯 Direct Generic Usage (Recommended)

Use slices as-is with TypeScript generics for immediate productivity:

```ts
// Instant type-safe store for any data type
const useUserStore = create((...args) => ({
  ...createDataSlice<User>(null)(...args),
  ...createMutableDataSlice<User>(null)(...args),
}));
```

### 2. 📋 Copy-Paste Specialization

Copy and customize slices for domain-specific needs:

```ts
// Specialized UserStore with custom methods
export const createUserStoreSlice =
  (initialUser: User | null = null) =>
  (set: StateCreator) => ({
    user: initialUser,
    setUser: (user: User | null) => set({ user }),
    clearUser: () => set({ user: null }),
    updateUserEmail: (email: string) =>
      set((state) => ({
        user: state.user ? { ...state.user, email } : null,
      })),
  });
```

**Our Philosophy**: Start generic, specialize when you need custom domain logic.

```ts
// Instant type-safe store for any data type
const useUserStore = create((...args) => ({
  ...createDataSlice<User>(null)(...args),
  ...createMutableDataSlice<User>(null)(...args),
}));
```

### 2. 📋 Copy-Paste Specialization

Copy and customize slices for domain-specific needs:

```ts
// Specialized UserStore with custom methods
export const createUserStoreSlice =
  (initialUser: User | null = null) =>
  (set: StateCreator) => ({
    user: initialUser,
    setUser: (user: User | null) => set({ user }),
    clearUser: () => set({ user: null }),
    updateUserEmail: (email: string) =>
      set((state) => ({
        user: state.user ? { ...state.user, email } : null,
      })),
  });
```

Use slices as-is with TypeScript generics for immediate productivity:
**Our Philosophy**: Start generic, specialize when you need custom domain logic.

```ts
// Instant type-safe store for any data type
const useUserStore = create((...args) => ({
  ...createDataSlice<User>(null)(...args),
  ...createMutableDataSlice<User>(null)(...args),
}));
```

### 2. 📋 Copy-Paste Specialization

Copy and customize slices for domain-specific needs:

- `createReorderableListStoreSlice<ID>(initialOrder?: ID[])`

````ts
// Specialized UserStore with custom methods
export const createUserStoreSlice = (initialUser: User | null = null) =>
  (set: StateCreator) => ({
    user: initialUser,
## Quick Decision Tree: Which Slice Do I Need?null) => set({ user }),
    clearUser: () => set({ user: null }),
### For Single Items (User, Product, Settings)
- **Basic**: `createDataSlice<T>()` - Simple get/set with null safety
- **+ Form editing**: `createMutableDataSlice<T>()` - Adds nested property updates
- **+ Reset capability**: `createRestorableDataSlice<T>()` - Adds form reset/restore
- **+ Server sync**: `createRefreshableDataSlice<T>()` - Adds fresh data handling
      user: state.user ? { ...state.user, email } : null
### For Collections (Users[], Products[], Images[])
- **Basic**: `createListSlice<ID, T>()` - O(1) lookups with Record<ID, T>
- **+ Add/Remove**: `createMutableListSlice<ID, T>()` - Track changes optimistically
- **+ Ordering**: `createReorderableListSlice<ID>()` - Drag and drop support
- **+ Pagination**: `createPaginatableListSlice<ID>()` - Page-based access
- **+ Filtering**: `createFilterableListSlice<ID, T>()` - Dynamic filtering

## Generic Usage Examplesneric, specialize when you need custom domain logic.

### Single Data Item
```ts
import { create } from "zustand";
import { createMutableDataSlice } from "./data-mutable/data-mutable.store.slice";

type User = {
  id: string;
  name: string;
  email: string;
  profile: {
    bio: string;
    avatar: string;
  };
};

// Generic usage - works immediately
const useUserStore = create((...args) => ({
  ...createMutableDataSlice<User>(null)(...args),
}));

// Usage in component
function UserProfile() {
  const { data: user, setData, updateData } = useUserStore();

  return (
    <div>
      <input
        value={user?.name ?? ''}
        onChange={(e) => updateData(draft => {
          draft.name = e.target.value; // Safe nested updates
        })}
      />
      <textarea
        value={user?.profile.bio ?? ''}
        onChange={(e) => updateData(draft => {
          draft.profile.bio = e.target.value; // Deep updates work
        })}
      />
    </div>
  );
}
````

### Collection with Mutations

```ts
import { createListSlice } from "./list/list.store.slice";
import { createMutableListSlice } from "./list-mutable/list-mutable.store.slice";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

// Generic collection with change tracking
const useProductStore = create((...args) => ({
  ...createListSlice<string, Product>({})(...args),
  ...createMutableListSlice<string, Product>()(...args),
}));

// Usage in component
function ProductManager() {
  const { list: products, add, remove, added, deleted } = useProductStore();

  const addProduct = (product: Product) => {
    add(product.id, product); // Tracked in 'added' array
  };

  const removeProduct = (id: string) => {
    remove(id); // Tracked in 'deleted' array
  };

  return (
    <div>
      {Object.values(products || {}).map((product) => (
        <div key={product.id}>
          {product.name} - ${product.price}
          <button onClick={() => removeProduct(product.id)}>Remove</button>
        </div>
      ))}

      {(added.length > 0 || deleted.length > 0) && (
        <div>
          Changes: +{added.length} -{deleted.length}
        </div>
      )}
    </div>
  );
}
```

## Specialized Usage Examples

When you need custom domain logic, copy and customize:

### Custom User Store

```ts
// Copy from createDataSlice and specialize
export interface UserStoreState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

export interface UserStoreActions {
  setCurrentUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User["profile"]>) => void;
}

export const createUserStoreSlice = (
  initialUser: User | null = null
): StateCreator<UserStoreState & UserStoreActions> => {
  return (set) => ({
    currentUser: initialUser,
    isAuthenticated: initialUser !== null,

    setCurrentUser: (user) =>
      set({
        currentUser: user,
        isAuthenticated: user !== null,
      }),

    login: (user) =>
      set({
        currentUser: user,
        isAuthenticated: true,
      }),

    logout: () =>
      set({
        currentUser: null,
        isAuthenticated: false,
      }),

    updateProfile: (updates) =>
      set(
        produce<UserStoreState & UserStoreActions>((draft) => {
          if (draft.currentUser) {
            Object.assign(draft.currentUser.profile, updates);
          }
        })
      ),
  });
};

// Usage
const useUserStore = create((...args) => ({
  ...createUserStoreSlice(null)(...args),
}));
```

### Custom Product Collection

```ts
// Specialized product store with domain logic
export const createProductCollectionSlice = () => {
  return (set, get): ProductCollectionSlice => ({
    products: {},
    categories: [],
    selectedCategory: null,

    addProduct: (product) =>
      set(
        produce<ProductCollectionSlice>((draft) => {
          draft.products[product.id] = product;
          if (!draft.categories.includes(product.category)) {
            draft.categories.push(product.category);
          }
        })
      ),

    removeProduct: (id) =>
      set(
        produce<ProductCollectionSlice>((draft) => {
          delete draft.products[id];
        })
      ),

    getProductsByCategory: (category: string) => {
      const { products } = get();
      return Object.values(products).filter((p) => p.category === category);
    },

    updatePrice: (id: string, price: number) =>
      set(
        produce<ProductCollectionSlice>((draft) => {
          if (draft.products[id]) {
            draft.products[id].price = price;
          }
        })
      ),
  });
};
```

## When to Use Generic vs Specialized

### Use Generic When:

- ✅ Standard CRUD operations are sufficient
- ✅ You want to start quickly and iterate
- ✅ Type safety is more important than custom methods
- ✅ You're prototyping or building MVPs

### Use Specialized When:

- ✅ You need custom business logic methods
- ✅ Domain-specific validation or computed properties
- ✅ Custom state shape beyond our patterns
- ✅ Team prefers explicit over generic code

## Slice Composition Patterns

The real power comes from combining slices to build rich, feature-complete stores:

### 1. Image Gallery with Full Feature Set

```ts
import { create } from "zustand";
import { createListSlice } from "./list/list.store.slice";
import { createMutableListSlice } from "./list-mutable/list-mutable.store.slice";
import { createReorderableListSlice } from "./list-reorderable/list-reorderable.store.slice";
import { createDataSlice } from "./data/data.store.slice";

type Image = {
  id: string;
  url: string;
  alt: string;
  size: number;
  tags: string[];
};

// Compose multiple slices for a complete image manager
const useImageGalleryStore = create((...args) => ({
  // Core image collection (O(1) lookups)
  ...createListSlice<string, Image>({})(...args),

  // Add/remove tracking for optimistic updates
  ...createMutableListSlice<string, Image>()(...args),

  // Drag and drop reordering
  ...createReorderableListSlice<string>([])(...args),

  // Selected image for detail view
  ...createDataSlice<Image>(null)(...args),

  // UI state
  viewMode: "grid" as "grid" | "list",
  isUploading: false,

  // Custom actions
  setViewMode: (mode: "grid" | "list") =>
    args[0]((state) => ({ viewMode: mode })),

  setUploading: (uploading: boolean) =>
    args[0]((state) => ({ isUploading: uploading })),
}));

// Rich, type-safe API from composition
function ImageGallery() {
  const {
    // From list slice
    list: images,

    // From mutable list slice
    add,
    remove,
    added,
    deleted,

    // From reorderable slice
    order,
    move,
    moveToTop,

    // From data slice (selected image)
    data: selectedImage,
    setData: selectImage,

    // Custom UI state
    viewMode,
    setViewMode,
    isUploading,
  } = useImageGalleryStore();

  // Implementation uses all slice capabilities...
}
```

### 2. User Form with Reset and Auto-save

```ts
type UserForm = {
  name: string;
  email: string;
  profile: {
    bio: string;
    preferences: {
      theme: "light" | "dark";
      notifications: boolean;
    };
  };
};

const useUserFormStore = create((...args) => ({
  // Mutable updates for form fields
  ...createMutableDataSlice<UserForm>({
    name: "",
    email: "",
    profile: { bio: "", preferences: { theme: "light", notifications: true } },
  })(...args),

  // Reset capability for form restoration
  ...createRestorableDataSlice<UserForm>({
    name: "",
    email: "",
    profile: { bio: "", preferences: { theme: "light", notifications: true } },
  })(...args),

  // Server sync for auto-save
  ...createRefreshableDataSlice<UserForm>({
    name: "",
    email: "",
    profile: { bio: "", preferences: { theme: "light", notifications: true } },
  })(...args),

  // Form state
  isDirty: false,
  isSubmitting: false,
  lastSaved: null as Date | null,

  // Custom form actions
  markDirty: () => args[0]((state) => ({ isDirty: true })),
  markClean: () =>
    args[0]((state) => ({ isDirty: false, lastSaved: new Date() })),
  setSubmitting: (submitting: boolean) =>
    args[0]((state) => ({ isSubmitting: submitting })),
}));

// Usage combines all slice capabilities
function UserForm() {
  const {
    // From mutable data slice
    data: form,
    updateData,

    // From restorable slice
    reset,
    initialData,

    // From refreshable slice
    refresh,
    freshData,

    // Custom form state
    isDirty,
    isSubmitting,
    markDirty,
    markClean,
    setSubmitting,
  } = useUserFormStore();

  // Auto-save implementation
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(async () => {
      const saved = await api.saveUserForm(form);
      refresh(saved); // Updates freshData and resets to server state
      markClean();
    }, 2000);

    return () => clearTimeout(timer);
  }, [form, isDirty]);

  return (
    <form>
      <input
        value={form?.name ?? ""}
        onChange={(e) => {
          updateData((draft) => {
            draft.name = e.target.value;
          });
          markDirty();
        }}
      />

      <button type="button" onClick={() => reset()}>
        Reset to Original
      </button>

      <button type="button" onClick={() => reset(freshData)}>
        Reset to Last Saved
      </button>

      {isDirty && <span>• Unsaved changes</span>}
    </form>
  );
}
```

### 3. E-commerce Product Manager

```ts
type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
};

const useProductManagerStore = create((...args) => ({
  // Product collection with O(1) access
  ...createListSlice<string, Product>({})(...args),

  // Track additions/removals for bulk operations
  ...createMutableListSlice<string, Product>()(...args),

  // Currently editing product
  ...createMutableDataSlice<Product>(null)(...args),

  // UI filters and pagination (we'll add these slices next!)
  currentPage: 1,
  pageSize: 20,
  filters: {
    category: "",
    priceRange: [0, 1000],
    inStockOnly: false,
  },

  // Custom computed selectors
  getFilteredProducts: () => {
    const state = useProductManagerStore.getState();
    const products = Object.values(state.list || {});

    return products.filter((product) => {
      if (
        state.filters.category &&
        product.category !== state.filters.category
      ) {
        return false;
      }
      if (state.filters.inStockOnly && !product.inStock) {
        return false;
      }
      if (
        product.price < state.filters.priceRange[0] ||
        product.price > state.filters.priceRange[1]
      ) {
        return false;
      }
      return true;
    });
  },

  // Filter actions
  setFilter: (key: string, value: unknown) =>
    args[0]((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  setPagination: (page: number, size?: number) =>
    args[0]((state) => ({
      currentPage: page,
      pageSize: size ?? state.pageSize,
    })),
}));
```

## Composition Best Practices

### 1. Layer Slices by Concern

```ts
const useAppStore = create((...args) => ({
  // Data layer
  ...createListSlice<string, User>({})(...args),
  ...createMutableListSlice<string, User>()(...args),

  // Feature layer
  ...createDataSlice<User>(null)(...args), // selected user

  // UI layer
  sidebarOpen: false,
  currentView: "list" as "list" | "detail",

  // Actions layer
  toggleSidebar: () =>
    args[0]((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),
}));
```

### 2. Use Narrow Selectors

```ts
// ✅ Good: Subscribe only to what you need
const selectedUserId = useUserStore((state) => state.data?.id);
const hasChanges = useUserStore(
  (state) => state.added.length > 0 || state.deleted.length > 0
);

// ❌ Avoid: Subscribe to entire store
const { data, added, deleted } = useUserStore();
```

### 3. Compose Gradually

Start simple and add slices as you need them:

````ts
// Phase 1: Basic data
const useUserStore = create((...args) => ({
  ...createDataSlice<User>(null)(...args),
}));

// Phase 2: Add mutations
const useUserStore = create((...args) => ({
  ...createDataSlice<User>(null)(...args),
  ...createMutableDataSlice<User>(null)(...args),
}));

// Phase 3: Add reset capability
const useUserStore = create((...args) => ({
  ...createDataSlice<User>(null)(...args),
  ...createMutableDataSlice<User>(null)(...args),
  ...createRestorableDataSlice<User>(null)(...args),
})); **+ Ordering**: `createReorderableListSlice<ID>()` - Drag and drop support
- **+ Pagination**: `createPaginatableListSlice<ID>()` - Page-based access
- **+ Filtering**: `createFilterableListSlice<ID, T>()` - Dynamic filtering
This composition approach ensures you only pay for complexity you actually use.
## Generic Usage Examples

### Single Data Item
```ts
import { create } from "zustand";
import { createMutableDataSlice } from "./data-mutable/data-mutable.store.slice";

type User = {
  id: string;
  name: string;
  email: string;
  profile: {
    bio: string;
    avatar: string;
  };
};

// Generic usage - works immediately
const useUserStore = create((...args) => ({
  ...createMutableDataSlice<User>(null)(...args),
}));

// Usage in component
function UserProfile() {
  const { data: user, setData, updateData } = useUserStore();

  return (
    <div>
      <input
        value={user?.name ?? ''}
        onChange={(e) => updateData(draft => {
          draft.name = e.target.value; // Safe nested updates
        })}
      />
      <textarea
        value={user?.profile.bio ?? ''}
        onChange={(e) => updateData(draft => {
          draft.profile.bio = e.target.value; // Deep updates work
        })}
      />
    </div>
  );
}
````

### Collection with Mutations

```ts
import { createListSlice } from "./list/list.store.slice";
import { createMutableListSlice } from "./list-mutable/list-mutable.store.slice";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

// Generic collection with change tracking
const useProductStore = create((...args) => ({
  ...createListSlice<string, Product>({})(...args),
  ...createMutableListSlice<string, Product>()(...args),
}));

// Usage in component
function ProductManager() {
  const { list: products, add, remove, added, deleted } = useProductStore();

  const addProduct = (product: Product) => {
    add(product.id, product); // Tracked in 'added' array
  };

  const removeProduct = (id: string) => {
    remove(id); // Tracked in 'deleted' array
  };

  return (
    <div>
      {Object.values(products || {}).map((product) => (
        <div key={product.id}>
          {product.name} - ${product.price}
          <button onClick={() => removeProduct(product.id)}>Remove</button>
        </div>
      ))}

      {(added.length > 0 || deleted.length > 0) && (
        <div>
          Changes: +{added.length} -{deleted.length}
        </div>
      )}
    </div>
  );
}
```

## Specialized Usage Examples

When you need custom domain logic, copy and customize:

### Custom User Store

```ts
// Copy from createDataSlice and specialize
export interface UserStoreState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

export interface UserStoreActions {
  setCurrentUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User["profile"]>) => void;
}

export const createUserStoreSlice = (
  initialUser: User | null = null
): StateCreator<UserStoreState & UserStoreActions> => {
  return (set) => ({
    currentUser: initialUser,
    isAuthenticated: initialUser !== null,

    setCurrentUser: (user) =>
      set({
        currentUser: user,
        isAuthenticated: user !== null,
      }),

    login: (user) =>
      set({
        currentUser: user,
        isAuthenticated: true,
      }),

    logout: () =>
      set({
        currentUser: null,
        isAuthenticated: false,
      }),

    updateProfile: (updates) =>
      set(
        produce<UserStoreState & UserStoreActions>((draft) => {
          if (draft.currentUser) {
            Object.assign(draft.currentUser.profile, updates);
          }
        })
      ),
  });
};

// Usage
const useUserStore = create((...args) => ({
  ...createUserStoreSlice(null)(...args),
}));
```

### Custom Product Collection

````ts
// Specialized product store with domain logic
export const createProductCollectionSlice = () => {
  return (set, get): ProductCollectionSlice => ({
    products: {},
    categories: [],
    selectedCategory: null,

    addProduct: (product) => set(
      produce<ProductCollectionSlice>((draft) => {
        draft.products[product.id] = product;
        if (!draft.categories.includes(product.category)) {
          draft.categories.push(product.category);
        }
      })
    ),

    removeProduct: (id) => set(
      produce<ProductCollectionSlice>((draft) => {
        delete draft.products[id];
      })
    ),

    getProductsByCategory: (category: string) => {
      const { products } = get();
      return Object.values(products).filter(p => p.category === category);
    },

    updatePrice: (id: string, price: number) => set(
      produce<ProductCollectionSlice>((draft) => {
        if (draft.products[id]) {
          draft.products[id].price = price;
        }
      })
    ),
  });
};
```### Specialize by copy-pasteCopy a generic slice and replace generics with your domain type:- Rename `data` to your domain name if desired (e.g., `car`)
- Keep the action semantics intact
## When to Use Generic vs Specializedat unlocks your use case### Use Generic When:
- ✅ Standard CRUD operations are sufficient
- ✅ You want to start quickly and iterate
- ✅ Type safety is more important than custom methods
- ✅ You're prototyping or building MVPs### Use Specialized When:
- ✅ You need custom business logic methods
- ✅ Domain-specific validation or computed properties
- ✅ Custom state shape beyond our patterns
- ✅ Team prefers explicit over generic code
````
