import {
  DataSliceActions,
  DataSliceState,
} from "../data/data.store.slice.types";

export interface MutableDataSliceState<TData> extends DataSliceState<TData> {}

export interface MutableDataSliceActions<TData>
  extends DataSliceActions<TData> {
  updateData: (updater: (draft: TData) => void) => void;
}

export interface MutableDataSlice<TData>
  extends MutableDataSliceState<TData>,
    MutableDataSliceActions<TData> {}
