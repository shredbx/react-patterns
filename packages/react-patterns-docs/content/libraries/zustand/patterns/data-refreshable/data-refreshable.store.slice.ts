/**
 * @title: Refreshable Data Slice
 * @usage:
 *   - Server synchronization with conflict resolution (real-time documents, user profiles)
 *   - WebSocket/SSE data streams with local change tracking
 *   - Optimistic updates with server reconciliation capability
 *   - When you need refresh(freshData) and freshData tracking for server sync
 * @examples:
 *   Generic: createRefreshableDataSlice<Document>(null) adds refresh() and freshData
 *   Specialized: Copy and add custom sync behaviors like conflictResolution, mergeStrategy
 *   Composition: Extends createRestorableDataSlice, use with polling or WebSocket updates
 */
import { StateCreator } from "zustand";
import { RefreshableDataSlice } from "./data-refreshable.store.slice.types";
import { createRestorableDataStoreSlice } from "../data-restorable/data-restorable.store.slice";

import { produce } from "immer";

export const createRefreshableDataStoreSlice = <TData>(
  initialData: TData | null = null
): StateCreator<
  RefreshableDataSlice<TData>,
  [],
  [],
  RefreshableDataSlice<TData>
> => {
  return (set, get, api) => ({
    ...createRestorableDataStoreSlice<TData>(initialData)(set, get, api),
    freshData: initialData,

    refresh: (data: TData | null) => {
      set(
        produce<RefreshableDataSlice<TData>>((draft) => {
          (draft.freshData as unknown as TData | null) = data;
        })
      );
      // Call reset after freshData is updated
      get().reset(data ?? null);
    },
  });
};
