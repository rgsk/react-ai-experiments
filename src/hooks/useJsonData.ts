import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 } from "uuid";
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
  const watchedDataId = useMemo(() => v4(), []);
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
  const populateState = useCallback(async () => {
    if (!enabled) return;
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
    setLocalValue(undefined);
    setLoading(true);

    const result = await jsonDataService.getKey({
      key,
    });
    const value = result?.value;
    lastFetchedValueRef.current = value;
    if (value !== undefined) {
      if (migrationRef.current) {
        const migratedValue = migrationRef.current(value);
        setLocalValue(migratedValue);
      } else {
        setLocalValue(value);
      }
    } else {
      const finalInitialValue =
        initialValueRef.current instanceof Function
          ? initialValueRef.current()
          : initialValueRef.current;
      setLocalValue(finalInitialValue);
    }
    setLoading(false);
  }, [enabled, key]);

  useEffect(() => {
    void populateState();
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

  useEffect(() => {
    if (
      localValue !== undefined &&
      localValue !== lastFetchedValueRef.current // this check so that we don't keep pushing expirationTime
    ) {
      const timer = setTimeout(() => {
        void jsonDataService.setKey({
          key: keyRef.current,
          value: localValue,
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [localValue]);

  useEffect(() => {
    const cb = (event: MessageEvent) => {
      if (event.data.type === "watchedDataSetKey") {
        const { key, value, id } = event.data.payload;
        if (keyRef.current === key && id !== watchedDataId) {
          setLocalValue(value);
        }
      }
    };
    window.addEventListener("message", cb);
    return () => {
      window.removeEventListener("message", cb);
    };
  }, [watchedDataId]);

  const augmentedSetLocalValue: Dispatch<SetStateAction<T | undefined>> =
    useCallback(
      (valueOrFunction) => {
        setLocalValue(valueOrFunction);
        const valueToStore =
          valueOrFunction instanceof Function
            ? valueOrFunction(localValueRef.current)
            : valueOrFunction;
        window.postMessage(
          {
            type: "watchedDataSetKey",
            payload: {
              key: keyRef.current,
              value: valueToStore,
              id: watchedDataId,
            },
          },
          "*"
        );
      },
      [watchedDataId]
    );

  return [
    localValue,
    augmentedSetLocalValue,
    { loading, refetch: populateState },
  ] as const;
}
export default useJsonData;
