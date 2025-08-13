/**
 @title: List Slice Types (Base)
 @category: list
 @order: 10
 @dependsOn: []
 @provides: ["types"]
 @summary: Types for a generic list keyed by ID for O(1) lookups
 @usage:
   - Use as generics: ListSlice<ID, DATA>
   - Specialize by copy-paste and replace generics with domain types
*/

import {
  DataSliceActions,
  DataSliceState,
} from "../data/data.store.slice.types";

// Current example uses generic Data type from data pattern
// We can rename `data` to `list` and use it as a standalone list slice,
// but we will lose the ability to extend it with other Data type store slices
// as mutable, refreshable, restorable, etc.
// Data is a Record<TId, TData>, access to the data takes O(1) time
// This is the most efficient way to access the data
export interface ListSliceState<TId extends string | number | symbol, TData>
  extends DataSliceState<Record<TId, TData>> {}

export interface ListSliceActions<TId extends string | number | symbol, TData>
  extends DataSliceActions<Record<TId, TData>> {}

export type ListSlice<
  TId extends string | number | symbol,
  TData
> = ListSliceState<TId, TData> & ListSliceActions<TId, TData>;
