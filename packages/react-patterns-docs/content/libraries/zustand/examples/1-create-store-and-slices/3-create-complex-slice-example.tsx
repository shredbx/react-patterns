import { createStore, StateCreator, StoreApi } from "zustand";
import { produce } from "immer";

import {
  User,
  UserStoreSlice,
  createUserStoreSlice,
} from "./2-create-slice-example";

export { UserStoreSlice, createUserStoreSlice };

// Sample data to compbine two data entities into a single store using slices
export type Bookmark = {
  id: string;
  url: string;
};

// Bookmark store slice state to be combined with the user store slice state
export interface BookmarkStoreSliceState {
  // Good practice to use Record over array for O(1) access during subscription
  bookmarks: Record<string, Bookmark>;

  // For the ordered list we create an record with the index as key and the id as value
  // It allows to access the bookmark by the index in the list without the need to iterate over the array
  orderedBookmarkIds: Record<number, string>;
}

// Bookmark store slice actions to be combined with the user store slice actions to create a single store instance
export interface BookmarkStoreSliceActions {
  setBookmark: (bookmark: Bookmark) => void;
}

// Create a type that combines state and actions to create a store instance
export type BookmarkStoreSlice = BookmarkStoreSliceState &
  BookmarkStoreSliceActions;

// Create a reusable slice for the bookmark store
// This slice could be used separately or combined with the user store slice to create a single store instance
export const createBookmarkStoreSlice = (
  initialBookmarks: Bookmark[] = []
): StateCreator<BookmarkStoreSlice, [], [], BookmarkStoreSlice> => {
  return (set) => ({
    bookmarks: initialBookmarks.reduce((acc, bookmark) => {
      acc[bookmark.id] = bookmark;
      return acc;
    }, {} as Record<string, Bookmark>),
    orderedBookmarkIds: initialBookmarks.reduce((acc, bookmark, index) => {
      acc[index] = bookmark.id;
      return acc;
    }, {} as Record<number, string>),

    setBookmark: (bookmark: Bookmark) => {
      set(
        produce<BookmarkStoreSlice>((draft) => {
          draft.bookmarks[bookmark.id] = bookmark;
          const maxIndex = Object.keys(draft.orderedBookmarkIds).length;
          draft.orderedBookmarkIds[maxIndex] = bookmark.id;
        })
      );
    },
  });
};

// Create store function that returns a store instance
// Integrating UserStore slice into a store instance
export function createUserAndBookmarkStore(
  initialUser: User | null,
  initialBookmarks: Bookmark[] = []
): StoreApi<BookmarkStoreSlice & UserStoreSlice> {
  const userSliceCreator = createUserStoreSlice(initialUser);
  const bookmarkSliceCreator = createBookmarkStoreSlice(initialBookmarks);

  return createStore<BookmarkStoreSlice & UserStoreSlice>()(
    (set, get, api) => ({
      ...bookmarkSliceCreator(set, get, api),
      ...userSliceCreator(set, get, api),
    })
  );
}
