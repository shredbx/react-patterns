import { createStore, StoreApi } from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";

export type User = {
  id: string;
  name: string;
  email: string;
};

// Create a state interface, define properties of the store
// We separete sate from actions for clarify as well as it allows us to create
// a initial state for the store with a default values without dealing with actions
export interface UserStoreState {
  user: User | null;
}

// Create a actions interface, define actions to manipulate data in the store
// Separating actions from state allows us to create a hook for actions and use it in the component
// The action hook could add debounce or other logic to the action
export interface UserStoreActions {
  setUser: (user: User | null) => void;
}

// Create a type that combines state and actions to create a store instance
export type UserStore = UserStoreState & UserStoreActions;

// Create store function that returns in-memory store instance
export function createUserStore(
  initial: User | null = null
): StoreApi<UserStore> {
  return createStore<UserStore>((set) => ({
    user: initial,
    setUser: (user: User | null) => {
      set(
        // Using `produce` (Immer) ensures safe, immutable updates even for deeply nested/complex state.
        // This prevents accidental mutation bugs and enables efficient structural sharing.
        // For simple primitives, direct assignment is slightly faster, but for complex objects,
        // Immer's structural sharing gives O(1) unchanged subtree performance and avoids full object cloning.
        // Without `produce`, manual immutable updates are error-prone and can cause unnecessary re-renders.
        produce<UserStore>((draft) => {
          draft.user = user;
        })
      );
    },
  }));
}

// Create store function that returns a persistent store instance
export function createPersistentUserStore(
  initial: User | null = null
): StoreApi<UserStore> {
  return createStore<UserStore>()(
    // Persist create a store with a persistent storage in a browser local storage
    persist(
      (set, get, api) => ({
        user: initial,
        setUser: (user) =>
          set(
            // For efficiency we use immer to mutate the state
            produce((draft) => {
              draft.user = user;
            })
          ),
      }),
      {
        // We can use the id of the user to create a unique name for the store
        // This is useful to create a separate store for each user
        // and not to share the store between users
        // This is useful to create a separate store for each user
        name: initial?.id ? `user-store-${initial.id}` : "user-store",
      }
    )
  );
}
