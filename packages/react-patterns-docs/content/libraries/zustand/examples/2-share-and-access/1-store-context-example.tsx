/**
 * Sharing and accessing the store
 *
 * Normally we will use store inside the component or hooks.
 * To reduce the tight coupling between component and the store I prefer to use a component context over passing a props.
 *
 * We create a context and provider for the components to use, the consumer responsible to set a store for component to functional correctly.
 *
 * We also create a set of hooks to access the store, attributes and actions.
 */

import React from "react";
import { StoreApi } from "zustand";
import { ReactNode, createContext, memo, useContext, useMemo } from "react";
import {
  UserStoreSlice,
  BookmarkStoreSlice,
  createUserAndBookmarkStore,
} from "../1-create-store-and-slices/3-create-complex-slice-example";
import { User } from "../1-create-store-and-slices/2-create-slice-example";

// Create a type that combines the user and bookmark store slices to create a single store instance
export type UserAndBookmarksStore = UserStoreSlice & BookmarkStoreSlice;

// Create a context for the store to be used within current module
// It could be one or group of components and hooks that needs access
export const StoreContext =
  createContext<StoreApi<UserAndBookmarksStore> | null>(null);

// Store most probably created and memorized in the top-level client component
// and passed down to the context provider
export const StoreContextProvider = ({
  children,
  store,
}: React.PropsWithChildren<{ store: StoreApi<UserAndBookmarksStore> }>) => {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

// Top level component
// - Creates the store
// - Memorize the store to prevent re-creation on re-render
// - Passes the store to the context provider
//
// Top level component that creates the store and passes it to the context provider
// It is memoized to prevent re-creation on re-render
// user has to be memorized outside of the component to prevent re-creation on re-render
//
export const TopLevelUserComponent = memo(
  function TopLevelUserComponent({ user }: { user: User }) {
    const store: StoreApi<UserAndBookmarksStore> = useMemo(
      () => createUserAndBookmarkStore(user, []),
      [user.id] // Re-create store if user.id changes
    );
    return (
      <StoreContextProvider store={store}>
        <ExampleUserComponent />
      </StoreContextProvider>
    );
  },
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id
); // Re-renders only if parent props changes

// Simple example that access the store from the context.
// It could be a hook or a component.
// For efificent work with a store we will introduce sets of hooks to access the store.
function ExampleUserComponent(): ReactNode {
  // Accessing store from the context
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("Store not found");
  }
  const user = store.getState().user;
  return <h1>{user?.name}</h1>;
}
