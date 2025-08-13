/**
 * In this file we show how to use the store hooks to access the store
 * and how to use the store actions to update the store
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useUserAndBookmarksStaticStore,
  useUserAndBookmarksStoreActions,
  useUserAndBookmarksStoreSelector,
} from "./2-store-hooks-example";

/**
 * This is example of subscription to the reactive name updates
 * The body (state.user?.name) will be triggered on every single store change so it has to be as lightweight as possible
 * But the component will be re-rendered only if the name is changed
 *
 */
export function UserNameReactiveDisplay() {
  const name = useUserAndBookmarksStoreSelector((state) => state.user?.name);
  return <div>{name}</div>;
}

/**
 * This is example of controlled input that updates the store
 * It uses the store actions to update the store
 * It uses the store selector to get the current value
 * It uses the useEffect to sync the local state with the store value
 * It uses the useCallback to handle the change event
 *
 * @returns
 */
export function UserNameControlledInput() {
  const { updateUser } = useUserAndBookmarksStoreActions();
  const storeName = useUserAndBookmarksStoreSelector(
    (state) => state.user?.name
  );
  const [localValue, setLocalValue] = useState(storeName || "");

  // Sync local state when store value changes from external sources
  useEffect(() => {
    if (storeName !== localValue) {
      setLocalValue(storeName || "");
    }
  }, [storeName]);

  const handleUserNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue); // Update immediately for instant feedback

      updateUser((draft) => {
        // Update only name field using selector
        draft.name = newValue;
      });
    },
    [updateUser]
  );

  // Using localValue for instant feedback
  // Using callback handler to update the store
  return (
    <input type="text" value={localValue} onChange={handleUserNameChange} />
  );
}

/**
 * This is example of uncontrolled input, it manages local state and updates the store
 * It uses the store actions to update the store
 * It uses the useRef to get the input element
 * It uses the useCallback to handle the change event
 *
 * It not get updated if store has been changed from another place
 * It is useful when we have only one input so we reduce subscription to the store increasing performance
 *
 *
 */
export function UserNameUncontrolledInput() {
  const { updateUser } = useUserAndBookmarksStoreActions();
  const inputRef = useRef<HTMLInputElement>(null);

  const name = useUserAndBookmarksStaticStore().user?.name;

  const handleUserNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateUser((draft) => {
        draft.name = e.target.value;
      });
    },
    [updateUser]
  );

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={name || ""}
      onChange={handleUserNameChange}
    />
  );
}
