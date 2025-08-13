import { createStore, StateCreator, StoreApi } from "zustand";
import { produce } from "immer";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  name: string;
  email: string;
};

// Create a state interface, define properties of the store
// We separete sate from actions for clarify as well as it allows us to create
// a initial state for the store with a default values without dealing with actions
export interface UserStoreSliceState {
  user: User | null;
}

// Create a actions interface, define actions to manipulate data in the store
// Separating actions from state allows us to create a hook for actions and use it in the component
// The action hook could add debounce or other logic to the action
export interface UserStoreSliceActions {
  setUser: (user: User | null) => void;
  updateUser: (updater: (draft: User) => void) => void;
}

// Create a type that combines state and actions to create a store instance
export type UserStoreSlice = UserStoreSliceState & UserStoreSliceActions;

// Create a reusable slice
export const createUserStoreSlice = (
  initialUser: User | null = null
): StateCreator<UserStoreSlice, [], [], UserStoreSlice> => {
  return (set) => ({
    user: initialUser,

    setUser: (user: User | null) => {
      set(
        produce<UserStoreSlice>((draft) => {
          draft.user = user;
        })
      );
    },

    updateUser: (updater: (draft: User) => void) =>
      set(
        // We use immer to mutate the state
        // We pass a function that will be executed with the draft of the state
        // The draft is a mutable object that we can mutate
        // Consumer can efficiently update only required properties
        // and not the whole state
        produce<UserStoreSlice>((draft) => {
          if (draft.user) {
            updater(draft.user);
          }
        })
      ),
  });
};

// Example for the final persisant store created by the Page or another top-level component
// Create store function that returns a persistent store instance
// Integrating UserStore slice into a persistent store
export function createPersistentUserStore(
  initial: User | null = null
): StoreApi<UserStoreSlice> {
  const userSliceCreator = createUserStoreSlice(initial);

  return createStore<UserStoreSlice>()(
    persist(
      (set, get, api) => ({
        ...userSliceCreator(set, get, api),
      }),
      {
        name: initial?.id ? `user-store-${initial.id}` : "user-store",
      }
    )
  );
}
