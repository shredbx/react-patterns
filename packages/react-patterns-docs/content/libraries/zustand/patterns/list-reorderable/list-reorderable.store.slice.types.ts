/**
 @title: Reorderable List Slice Types
 @category: list
 @order: 30
 @dependsOn: ["ListSlice"]
 @provides: ["types"]
 @summary: Types for maintaining an array ordering of IDs for display
*/

export interface ReorderableListSliceState<
  TId extends string | number | symbol
> {
  order: TId[];
}

export interface ReorderableListSliceAction<
  TId extends string | number | symbol
> {
  setOrder: (order: TId[]) => void;
  move: (id: TId, newIndex: number) => void;
  moveToTop: (id: TId) => void;
  moveToBottom: (id: TId) => void;
  moveUp: (id: TId) => void;
  moveDown: (id: TId) => void;
}

export type ReorderableListSlice<TId extends string | number | symbol> =
  ReorderableListSliceState<TId> & ReorderableListSliceAction<TId>;
