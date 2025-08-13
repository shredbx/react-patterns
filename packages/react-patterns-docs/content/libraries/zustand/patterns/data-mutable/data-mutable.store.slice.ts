/**
 * @title: Mutable Data Slice
 * @usage:
 *   - Form fields with nested object updates (user profiles, complex settings)
 *   - Real-time editing with direct mutation syntax via Immer
 *   - Performance optimization for deeply nested state structures
 *   - When you need updateData(draft => void) in addition to setData
 * @examples:
 *   Generic: createMutableDataSlice<UserProfile>(defaultProfile) adds updateData method
 *   Specialized: Copy and add custom domain mutations like updateEmail, updatePreferences
 *   Composition: Extends createDataSlice, combine with restorable for form reset
 */
import { StateCreator } from "zustand";
import { produce } from "immer";

import { MutableDataSlice } from "./data-mutable.store.slice.types";
import { createDataStoreSlice } from "../data/data.store.slice";

export const createMutableDataStoreSlice = <TData>(
  initialData: TData | null = null
): StateCreator<MutableDataSlice<TData>, [], [], MutableDataSlice<TData>> => {
  return (set, get, api) => ({
    ...createDataStoreSlice<TData>(initialData)(set, get, api),

    updateData: (updater: (draft: TData) => void) => {
      set(
        produce<MutableDataSlice<TData>>((draft) => {
          // Guard: only update if data exists
          if (draft.data == null) return;
          updater(draft.data as TData);
        })
      );
    },
  });
};
