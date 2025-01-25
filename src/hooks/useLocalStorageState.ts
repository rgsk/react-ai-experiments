import { addSeconds } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import useRunOnWindowFocus from "./useRunOnWindowFocus";

export const localStorageWithExpiry = {
  getItem<T>(key: string, { version }: { version?: string } = {}) {
    if (typeof window !== "undefined") {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      const details = JSON.parse(item) as {
        value: T;
        version?: string;
        expireAt?: string;
      };
      // currently we don't delete the item from localStorage after expiration
      // we just don't return it
      if (
        (!details.expireAt || new Date() < new Date(details.expireAt)) &&
        details.version === version
      ) {
        return details.value ?? null;
      }
      return null;
    }
    return null;
  },
  setItem<T>(
    key: string,
    value: T,
    { version, expireAt }: { version?: string; expireAt?: Date }
  ) {
    if (typeof window !== "undefined") {
      const details = { value, expireAt, version };
      window.localStorage.setItem(key, JSON.stringify(details));
    }
  },
  removeItem: (key: string) => {
    window.localStorage.removeItem(key);
  },
  getExpireAt: (expirationTime?: number) => {
    return typeof expirationTime === "number"
      ? addSeconds(new Date(), expirationTime)
      : undefined;
  },
};

// expirationTime in seconds
const useLocalStorageState = <T>(
  key: string,
  initialValue: T | (() => T),
  {
    expirationTime,
    version,
    enabled = true,
  }: {
    expirationTime?: number;
    version?: string;
    enabled?: boolean;
  } = {}
) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>();

  const [loading, setLoading] = useState(true);

  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;
  const populateStateFromLocalStorage = useCallback(() => {
    if (!enabled) return;
    // Get from local storage by key
    setLoading(true);
    setStoredValue(undefined);
    const value = localStorageWithExpiry.getItem<T>(key, { version });
    if (value === null) {
      const finalInitialValue =
        initialValueRef.current instanceof Function
          ? initialValueRef.current()
          : initialValueRef.current;
      localStorageWithExpiry.setItem(key, finalInitialValue, {
        expireAt: localStorageWithExpiry.getExpireAt(expirationTime),
        version,
      });
      setStoredValue(finalInitialValue);
    } else {
      setStoredValue(value);
    }
    setLoading(false);
  }, [enabled, expirationTime, key, version]);

  useEffect(() => {
    populateStateFromLocalStorage();
  }, [populateStateFromLocalStorage]);

  // below takes care of populating the state if user loggedin in another tab and
  // then when he comes back on this tab
  useRunOnWindowFocus(populateStateFromLocalStorage);

  const storedValueRef = useRef(storedValue);
  storedValueRef.current = storedValue;
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback(
    (
      valueOrFunction:
        | (T | undefined)
        | ((prev: T | undefined) => T | undefined)
    ) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          valueOrFunction instanceof Function
            ? valueOrFunction(storedValueRef.current)
            : valueOrFunction;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        localStorageWithExpiry.setItem(key, valueToStore, {
          expireAt: localStorageWithExpiry.getExpireAt(expirationTime),
          version,
        });
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.log(error);
      }
    },
    [expirationTime, key, version]
  );

  return [
    storedValue,
    setValue,
    {
      loading,
      refetch: populateStateFromLocalStorage,
    },
  ] as const;
};

export default useLocalStorageState;
