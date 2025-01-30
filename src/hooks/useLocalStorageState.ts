import { addSeconds } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import useRunOnWindowFocus from "./useRunOnWindowFocus";
import useWindowMessageAndBroadcastChannelState from "./useWindowMessageAndBroadcastChannelState";

export const localStorageWithExpiry = {
  getItem<T>(key: string, { version }: { version?: string } = {}) {
    if (typeof window !== "undefined") {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return undefined;
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
        return details.value ?? undefined;
      }
      return undefined;
    }
    return undefined;
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
  initialValue?: T | (() => T),
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
  const [storedValue, setStoredValue] =
    useWindowMessageAndBroadcastChannelState<T>(key);

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
  }, [enabled, expirationTime, key, setStoredValue, version]);

  useEffect(() => {
    populateStateFromLocalStorage();
  }, [populateStateFromLocalStorage]);

  // below ensures if we change something in Inspect -> Application
  // that change is visible
  useRunOnWindowFocus(populateStateFromLocalStorage);

  useEffect(() => {
    if (!loading) {
      localStorageWithExpiry.setItem(key, storedValue, {
        expireAt: localStorageWithExpiry.getExpireAt(expirationTime),
        version,
      });
    }
  }, [expirationTime, key, loading, storedValue, version]);

  return [
    storedValue,
    setStoredValue,
    {
      loading,
      refetch: populateStateFromLocalStorage,
    },
  ] as const;
};

export default useLocalStorageState;
