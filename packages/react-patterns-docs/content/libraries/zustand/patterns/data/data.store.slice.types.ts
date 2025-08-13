export interface DataSliceState<TData> {
  data: TData | null;
}

export interface DataSliceActions<TData> {
  setData: (data: TData | null) => void;
}

export interface DataSlice<TData>
  extends DataSliceState<TData>,
    DataSliceActions<TData> {}
