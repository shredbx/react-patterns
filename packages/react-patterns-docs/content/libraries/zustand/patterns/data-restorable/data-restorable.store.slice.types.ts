import {
  DataSliceActions,
  DataSliceState,
} from "../data/data.store.slice.types";

export interface RestorableDataSliceState<TData> extends DataSliceState<TData> {
  initialData: TData | null;
}

export interface RestorableDataSliceActions<TData>
  extends DataSliceActions<TData> {
  reset: (data?: TData | null) => void;
}

export interface RestorableDataSlice<TData>
  extends RestorableDataSliceState<TData>,
    RestorableDataSliceActions<TData> {}
