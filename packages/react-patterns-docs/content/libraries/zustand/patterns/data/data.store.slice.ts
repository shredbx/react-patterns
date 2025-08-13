/**
 * @title: Data Slice (Base)
 * @usage:
 *   - Form state management (user profiles, settings, selected items)
 *   - Simple state with explicit null safety
 *   - Foundation for mutable, restorable, and refreshable patterns
 *   - When you need get/set operations for single items
 * @examples:
 *   Generic: createDataSlice<User>(null) provides { data: User | null, setData }
 *   Specialized: Copy and replace T with concrete type like UserProfile
 *   Composition: Combine with createMutableDataSlice for form editing
 */
import { StateCreator } from "zustand";
import { produce } from "immer";
import { DataSlice } from "./data.store.slice.types";

export const createDataStoreSlice = <TData>(
  initialData: TData | null = null
): StateCreator<DataSlice<TData>, [], [], DataSlice<TData>> => {
  return (set) => ({
    data: initialData,

    setData: (data: TData | null) => {
      set(
        produce<DataSlice<TData>>((draft) => {
          (draft.data as unknown as TData | null) = data;
        })
      );
    },
  });
};
