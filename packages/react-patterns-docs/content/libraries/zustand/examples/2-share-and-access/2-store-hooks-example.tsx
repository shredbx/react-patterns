// For efficient work with a store we define sets of hooks to access the store.

import { StoreApi, useStore } from "zustand";
import { useContext, useMemo } from "react";
import { StoreContext, UserAndBookmarksStore } from "./1-store-context-example";
import { useShallow } from "zustand/react/shallow";
import { useDebouncedCallback } from "use-debounce";
import {
  User,
  UserStoreSliceActions,
} from "../1-create-store-and-slices/2-create-slice-example";
import { BookmarkStoreSliceActions } from "../1-create-store-and-slices/3-create-complex-slice-example";

// Access the store from the context
// Normally we won't be using this hook directly
// Components or Hooks will be using the hooks below
export function useUserAndBookmarksStore(): StoreApi<UserAndBookmarksStore> {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStoreContext must be used within a StoreProvider");
  }
  return context;
}

// Use this hook to access the store state as a reactive subscription
// Use selector to re-render the component when the return value of the selector is different
// from the previous result
// The body of the selector is executed on every single store change,
// so the body has to be fast and not to contain any side effects
// If we need to access the store state as a shallow to return object/array,
// we can use the shallow selector below
// This hook is the most efficient way to access the store state
export function useUserAndBookmarksStoreSelector<T>(
  selector: (state: UserAndBookmarksStore) => T
): T {
  const store = useUserAndBookmarksStore();

  return useStore(store, selector);
}

// Use this hook to access the store state as a shallow object/array
// It will not return a new object/array and not cause re-render if the result of the selector is the same
// as the previous result, otherwise it will be re-rendered
export function useUserAndBookmarksStoreShallowSelector<T>(
  selector: (state: UserAndBookmarksStore) => T
): T {
  const store = useUserAndBookmarksStore();

  // ✅ CORRECT: Modern Zustand v5+ useShallow syntax
  // useShallow wraps the selector for shallow equality comparison
  // This replaced the old v4 pattern: useStore(store, selector, shallow)
  return useStore(store, useShallow(selector));
}

// Use this hook for uncontrolled inputs or static components that requires only initial state
// It's a lightweight way to access the current store state without subscribing to re-renders
export function useUserAndBookmarksStaticStore(): UserAndBookmarksStore {
  const store = useUserAndBookmarksStore();
  return store.getState();
}

// Use this hook to access the store actions as single entry point
// It is a good place to add debouncing, caching, etc.
export function useUserAndBookmarksStoreActions(): UserStoreSliceActions &
  BookmarkStoreSliceActions {
  const store = useUserAndBookmarksStore();

  return {
    ...store.getState(),
    updateUser: useDebouncedCallback(store.getState().updateUser, 300),
  } as UserStoreSliceActions & BookmarkStoreSliceActions;
}
