/**
 * @title: Mutable List Slice
 * @usage:
 *   - Optimistic UI updates with add/remove change tracking (shopping carts, todo lists)
 *   - Form lists with dirty state management before server sync
 *   - Collaborative editing with local change tracking for conflict resolution
 *   - When you need add(id, item), remove(id) with added[] and deleted[] arrays
 * @examples:
 *   Generic: createMutableListSlice<string, Product>() adds { added, deleted, add, remove }
 *   Specialized: Copy and add custom operations like bulkAdd, undoRemove, syncChanges
 *   Composition: Requires createListSlice, combine with reorderable for full management
 */
import { StateCreator } from "zustand";
import { produce } from "immer";
import type {
  MutableListSlice,
  MutableListSliceAction,
  MutableListSliceState,
} from "./list-mutable.store.slice.types";

export const createMutableListStoreSlice = <
  TId extends string | number | symbol,
  TData
>(): StateCreator<
  MutableListSlice<TId, TData>,
  [],
  [],
  MutableListSliceState<TId> & MutableListSliceAction<TId, TData>
> => {
  return (set) => ({
    added: [],
    deleted: [],

    add: (id: TId, element: TData) => {
      set(
        produce<MutableListSlice<TId, TData>>((draft) => {
          // Add to data (O(1) operation)
          (draft.data as unknown as Record<TId, TData>)[id] = element;

          // Track in added array (unless already there)
          const addedArray = draft.added as unknown as TId[];
          if (!addedArray.includes(id)) {
            addedArray.push(id);
          }

          // Remove from deleted if it was there (restoration case)
          const deletedArray = draft.deleted as unknown as TId[];
          (draft.deleted as unknown as TId[]) = deletedArray.filter(
            (deletedId) => deletedId !== id
          );
        })
      );
    },

    remove: (id: TId) => {
      set(
        produce<MutableListSlice<TId, TData>>((draft) => {
          // Remove from data
          delete (draft.data as unknown as Record<TId, TData>)[id];

          // Track in deleted array (unless already there)
          const deletedArray = draft.deleted as unknown as TId[];
          if (!deletedArray.includes(id)) {
            deletedArray.push(id);
          }

          // Remove from added if it was there (cancel addition)
          const addedArray = draft.added as unknown as TId[];
          (draft.added as unknown as TId[]) = addedArray.filter(
            (addedId) => addedId !== id
          );
        })
      );
    },
  });
};
