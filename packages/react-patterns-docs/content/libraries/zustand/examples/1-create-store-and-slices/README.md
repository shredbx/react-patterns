# Create a Store

Before we create a store we should undertand how and where we want to use it.
The store could be in memory or persistant and it's mostly up to the top-level client's or the specifi module to make a specific store and manage it.

Zustand it not accessible from server components, then it should not be used in Layout or Page.

Zustand allows to create a slice of the store. It allows to encapsulate specific states and actions in a slice and reuse it later.

Slice could extends another slice, they could be composed into more complex slice or integrated directly to the final store.

- ** [Create Simple Store](1-create-store-example.tsx)**
- ** [Create Reusable Store Slices](2-create-slice-example.tsx)**
- ** [Create Complex Store from Slices](3-create-complex-slice-example.tsx)**
