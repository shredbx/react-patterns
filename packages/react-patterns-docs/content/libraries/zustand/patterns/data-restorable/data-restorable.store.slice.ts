/**
 * @title: Restorable Data Slice
 * @usage:
 *   - Forms with reset/cancel functionality (user profiles, settings panels)
 *   - Editing workflows with restore to original values capability
 *   - Settings panels with "restore defaults" functionality
 *   - When you need reset() and initialData tracking in addition to setData
 * @examples:
 *   Generic: createRestorableDataSlice<UserForm>(defaultForm) adds reset() and initialData
 *   Specialized: Copy and add custom reset behaviors like resetToDefaults, resetField
 *   Composition: Extends createDataSlice, foundation for refreshable slice
 */
import { StateCreator } from "zustand";
import { produce } from "immer";

import { RestorableDataSlice } from "./data-restorable.store.slice.types";
import { createDataStoreSlice } from "../data/data.store.slice";

export const createRestorableDataStoreSlice = <TData>(
  initialData: TData | null = null
): StateCreator<
  RestorableDataSlice<TData>,
  [],
  [],
  RestorableDataSlice<TData>
> => {
  return (set, get, api) => ({
    ...createDataStoreSlice<TData>(initialData)(set, get, api),
    initialData,

    reset: (data?: TData | null) => {
      set(
        produce<RestorableDataSlice<TData>>((draft) => {
          const nextInitial =
            data !== undefined
              ? data
              : (draft.initialData as unknown as TData | null);
          (draft.initialData as unknown as TData | null) = nextInitial;
          (draft.data as unknown as TData | null) = nextInitial;
        })
      );
    },
  });
};
