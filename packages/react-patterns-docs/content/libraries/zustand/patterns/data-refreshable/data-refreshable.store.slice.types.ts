import {
  RestorableDataSliceActions,
  RestorableDataSliceState,
} from "../data-restorable/data-restorable.store.slice.types";

export interface RefreshableDataSliceState<TData>
  extends RestorableDataSliceState<TData> {
  freshData: TData | null;
}

export interface RefreshableDataSliceActions<TData>
  extends RestorableDataSliceActions<TData> {
  refresh: (data: TData | null) => void;
}

export interface RefreshableDataSlice<TData>
  extends RefreshableDataSliceState<TData>,
    RefreshableDataSliceActions<TData> {}
