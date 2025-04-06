import { useCallback, useEffect, useRef, useState } from "react";
import { firebaseAuth } from "~/lib/firebaseApp";
import jsonDataService from "~/services/jsonDataService";
import usePrevious from "./usePrevious";

function useJsonData<T>(
  key: string,
  initialValue?: T | (() => T),
  {
    enabled = true,
    migration,
  }: {
    enabled?: boolean;
    migration?: (previousValue: any) => T;
  } = {}
) {
  const [localValue, setLocalValue] = useState<T | undefined>();

  const localValueRef = useRef(localValue);
  localValueRef.current = localValue;
  const [loading, setLoading] = useState(true);
  const keyRef = useRef(key);
  keyRef.current = key;

  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;

  const previousKey = usePrevious(key);
  const previousKeyRef = useRef(previousKey);
  previousKeyRef.current = previousKey;
  const lastFetchedValueRef = useRef<T | undefined>();
  const migrationRef = useRef(migration);
  migrationRef.current = migration;
  const setSharedState: SetSharedState<T> = useCallback(
    (valueOrFunction, mandatorySetKey = false) => {
      // Allow value to be a function so we have same API as useState
      const newState =
        valueOrFunction instanceof Function
          ? valueOrFunction(localValueRef.current)
          : valueOrFunction;
      setLocalValue(newState);
      setUpdating(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (mandatorySetKey) {
        (async () => {
          await jsonDataService.setKey({
            key: keyRef.current,
            value: newState,
          });
          setUpdating(false);
        })();
      } else {
        timerRef.current = setTimeout(async () => {
          await jsonDataService.setKey({
            key: keyRef.current,
            value: newState,
          });
          setUpdating(false);
        }, 1000);
      }
    },
    [setLocalValue]
  );
  const populateState = useCallback(async () => {
    if (!enabled) {
      setLocalValue(undefined);
      return;
    }
    setLocalValue(undefined);
    setLoading(true);
    try {
      if (
        previousKeyRef.current !== undefined &&
        localValueRef.current != undefined
      ) {
        // takes care of updating before we change the current key
        void jsonDataService.setKey({
          key: previousKeyRef.current,
          value: localValueRef.current,
        });
      }

      const result = await jsonDataService.getKey<T>({
        key,
      });
      const value = result?.value;
      lastFetchedValueRef.current = value;
      if (value !== undefined) {
        if (migrationRef.current) {
          const migratedValue = migrationRef.current(value);
          setSharedState(migratedValue);
        } else {
          setLocalValue(value);
        }
      } else {
        const finalInitialValue =
          initialValueRef.current instanceof Function
            ? initialValueRef.current()
            : initialValueRef.current;
        if (finalInitialValue !== undefined) {
          setSharedState(finalInitialValue);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [enabled, key, setLocalValue, setSharedState]);

  useEffect(() => {
    void populateState();
  }, [populateState]);

  useEffect(() => {
    return firebaseAuth.onAuthStateChanged(async (user) => {
      populateState();
    });
  }, [populateState]);

  useEffect(() => {
    return () => {
      // takes care of updating on unmount
      if (keyRef.current !== undefined && localValueRef.current !== undefined) {
        void jsonDataService.setKey({
          key: keyRef.current,
          value: localValueRef.current,
        });
      }
    };
  }, []);
  const [updating, setUpdating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const refetch = useCallback(async () => {
    const result = await jsonDataService.getKey<T>({
      key,
    });
    const value = result?.value;
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [key]);
  return [
    localValue,
    setSharedState,
    { loading, refetch: refetch, updating },
  ] as const;
}
export default useJsonData;

export type SetSharedState<T> = (
  valueOrFunction: (T | undefined) | ((prev: T | undefined) => T | undefined),
  mandatorySetKey?: boolean
) => void;
