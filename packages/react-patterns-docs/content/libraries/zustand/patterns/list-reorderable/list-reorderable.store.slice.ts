/**
 * @title: Reorderable List Slice
 * @usage:
 *   - Drag and drop interfaces (image galleries, playlist management, task prioritization)
 *   - Manual ordering with move operations independent of data content
 *   - Priority-based lists with moveToTop, moveToBottom functionality
 *   - When you need order: ID[] with move, moveUp, moveDown operations
 * @examples:
 *   Generic: createReorderableListSlice<string>([]) provides { order, move, moveToTop, moveUp }
 *   Specialized: Copy and add custom ordering like sortByPriority, groupByCategory
 *   Composition: Combine with createListSlice and createMutableListSlice for full management
 */
import { StateCreator } from "zustand";
import { produce } from "immer";
import type {
  ReorderableListSlice,
  ReorderableListSliceAction,
  ReorderableListSliceState,
} from "./list-reorderable.store.slice.types";

export const createReorderableListStoreSlice = <
  TId extends string | number | symbol
>(
  initialOrder: TId[] = []
): StateCreator<
  ReorderableListSlice<TId>,
  [],
  [],
  ReorderableListSlice<TId>
> => {
  // Helper: constrain number to valid range
  const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));

  return (set) => ({
    order: initialOrder,

    setOrder: (order: TId[]) => {
      set(
        produce<ReorderableListSlice<TId>>((draft) => {
          (draft.order as unknown as TId[]) = order;
        })
      );
    },

    move: (id: TId, newIndex: number) => {
      set(
        produce<ReorderableListSlice<TId>>((draft) => {
          const orderArray = draft.order as unknown as TId[];
          const currentIndex = orderArray.indexOf(id);
          if (currentIndex === -1) return; // Item not found, no-op

          const bounded = clamp(newIndex, 0, orderArray.length - 1);

          // Move item using Immer-safe array operations
          const item = orderArray.splice(currentIndex, 1)[0];
          orderArray.splice(bounded, 0, item);
        })
      );
    },

    moveToTop: (id: TId) => {
      set(
        produce<ReorderableListSlice<TId>>((draft) => {
          const orderArray = draft.order as unknown as TId[];
          const idx = orderArray.indexOf(id);
          if (idx <= 0) return; // Already at top or not found

          const item = orderArray.splice(idx, 1)[0];
          orderArray.unshift(item);
        })
      );
    },

    moveToBottom: (id: TId) => {
      set(
        produce<ReorderableListSlice<TId>>((draft) => {
          const orderArray = draft.order as unknown as TId[];
          const idx = orderArray.indexOf(id);
          if (idx === -1 || idx === orderArray.length - 1) return; // Not found or already at bottom

          const item = orderArray.splice(idx, 1)[0];
          orderArray.push(item);
        })
      );
    },

    moveUp: (id: TId) => {
      set(
        produce<ReorderableListSlice<TId>>((draft) => {
          const orderArray = draft.order as unknown as TId[];
          const idx = orderArray.indexOf(id);
          if (idx <= 0) return; // Already at top or not found

          const item = orderArray.splice(idx, 1)[0];
          orderArray.splice(idx - 1, 0, item);
        })
      );
    },

    moveDown: (id: TId) => {
      set(
        produce<ReorderableListSlice<TId>>((draft) => {
          const orderArray = draft.order as unknown as TId[];
          const idx = orderArray.indexOf(id);
          if (idx === -1 || idx === orderArray.length - 1) return; // Not found or already at bottom

          const item = orderArray.splice(idx, 1)[0];
          orderArray.splice(idx + 1, 0, item);
        })
      );
    },
  });
};
