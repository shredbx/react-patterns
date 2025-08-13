import React from "react";
import { create } from "zustand";
import type { DataSlice } from "./data.store.slice.types";
import { createDataStoreSlice } from "./data.store.slice";

// Generic example (stores arbitrary data type with null safety)
// - Shows minimal get/set flow
// - Demonstrates null-safe access in UI
type User = {
  id: string;
  name: string;
  email: string;
};

// 1) Create a store from the slice (generic usage)
//    - We compose a store with only the data slice
export const useUserStore = create<DataSlice<User>>()((set, get, api) =>
  createDataStoreSlice<User>(null)(set, get, api)
);

// 2) Consume in a component with narrow selectors
export function UserProfileGeneric() {
  // Subscribe only to the specific fields used to minimize re-renders
  const user = useUserStore((s) => s.data);
  const setUser = useUserStore.getState().setData;

  // Render null-safe UI
  if (!user) {
    return (
      <div>
        <p>No user selected</p>
        <button
          onClick={() =>
            setUser({ id: "1", name: "Jane Doe", email: "jane@example.com" })
          }
        >
          Load User
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={() => setUser(null)}>Clear</button>
    </div>
  );
}

// Specialized example (rename fields for domain clarity)
// - Same slice, but we alias state/actions to domain words
type CurrentUser = User;

type CurrentUserStore = DataSlice<CurrentUser> & {
  readonly currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
};

export const useCurrentUserStore = create<CurrentUserStore>()((...args) => ({
  // Still generic slice under the hood
  ...createDataStoreSlice<CurrentUser>(null)(...args),

  // Aliases (optional) for readability in domain code
  get currentUser() {
    return (useCurrentUserStore.getState().data as CurrentUser | null) ?? null;
  },
  setCurrentUser(user: CurrentUser | null) {
    useCurrentUserStore.getState().setData(user);
  },
}));

export function CurrentUserPanel() {
  const currentUser = useCurrentUserStore((s) => s.data);
  const setCurrentUser = useCurrentUserStore.getState().setData;

  return (
    <section>
      <h2>Current User</h2>
      <pre>{currentUser ? JSON.stringify(currentUser, null, 2) : "(none)"}</pre>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() =>
            setCurrentUser({
              id: "u-42",
              name: "Ada",
              email: "ada@example.com",
            })
          }
        >
          Set Ada
        </button>
        <button onClick={() => setCurrentUser(null)}>Clear</button>
      </div>
    </section>
  );
}

// Example composite usage (shows flexibility of slices)
// - In larger apps, you can compose multiple slices into one store
//   Here we keep it minimal to demonstrate slice-as-store usage
export function DemoPage() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <UserProfileGeneric />
      <CurrentUserPanel />
    </div>
  );
}
