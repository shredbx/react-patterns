/**
 * @title: List Slice (Base)
 * @usage:
 *   - Collections with O(1) ID-based lookups (users, products, images, categories)
 *   - Normalized data structures avoiding nested arrays
 *   - Foundation for mutable and reorderable list patterns
 *   - When you need Record<ID, T> with efficient access by ID
 * @examples:
 *   Generic: createListSlice<string, User>({}) provides { data: Record<string, User>, setData }
 *   Specialized: Copy and replace with concrete types like UserCollection, ProductCatalog
 *   Composition: Combine with createMutableListSlice for add/remove tracking
 */
import { StateCreator } from "zustand";
import { produce } from "immer";
import { ListSlice } from "./list.store.slice.types";

export const createListStoreSlice = <
  TId extends string | number | symbol,
  TData
>(
  initialList: Record<TId, TData> = {} as Record<TId, TData>
): StateCreator<ListSlice<TId, TData>, [], [], ListSlice<TId, TData>> => {
  return (set) => ({
    data: initialList,

    setData: (data: Record<TId, TData> | null) => {
      set(
        produce<ListSlice<TId, TData>>((draft) => {
          (draft.data as unknown as Record<TId, TData> | null) = data;
        })
      );
    },
  });
};
