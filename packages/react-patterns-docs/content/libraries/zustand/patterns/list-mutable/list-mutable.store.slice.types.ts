/**
 @title: Mutable List Slice Types
 @category: list
 @order: 20
 @dependsOn: ["ListSlice"]
 @provides: ["types"]
 @summary: Types for add/remove tracking for list slices
*/

export interface MutableListSliceState<TId extends string | number | symbol> {
  added: TId[];
  deleted: TId[];
}

export interface MutableListSliceAction<
  TId extends string | number | symbol,
  TData
> {
  add: (id: TId, element: TData) => void;
  remove: (id: TId) => void;
}

export type MutableListSlice<
  TId extends string | number | symbol,
  TData
> = MutableListSliceState<TId> &
  MutableListSliceAction<TId, TData> & {
    // if we use this pattern for a standalone list slice/store then rename `data` to `list`
    data: Record<TId, TData>;
  };
