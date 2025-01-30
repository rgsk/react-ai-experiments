import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
const channels: Record<string, BroadcastChannel> = {};

const useWindowMessageAndBroadcastChannelState = <T>(
  key: string,
  initialValue?: T
) => {
  if (!channels[key]) {
    channels[key] = new BroadcastChannel(key);
  }
  const [state, setState] = useState<T | undefined>(initialValue);
  const stateRef = useRef(state);
  stateRef.current = state;

  const id = useMemo(() => uuidv4(), []); // Unique instance ID
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, payload, postId, messageKey } = event.data;
      if (messageKey !== key || postId === id) {
        return;
      }

      if (type === "REQUEST_STATE") {
        if (stateRef.current !== undefined) {
          window.postMessage(
            {
              type: "UPDATE_STATE",
              payload: stateRef.current,
              postId: id,
              messageKey: key,
            },
            "*"
          );
        }
      } else if (type === "UPDATE_STATE") {
        setState(payload as T);
      }
    };

    window.addEventListener("message", handleMessage);

    // Request latest state from other tabs
    window.postMessage(
      { type: "REQUEST_STATE", postId: id, messageKey: key },
      "*"
    );

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [key, id]);

  useEffect(() => {
    const channel = channels[key];
    // Request latest state from other tabs
    channel.postMessage({ type: "REQUEST_STATE", payload: null, postId: id });

    const handleMessage = (event: MessageEvent) => {
      const { type, payload, postId } = event.data;
      if (id === postId) {
        return;
      }
      if (type === "REQUEST_STATE") {
        if (stateRef.current !== undefined) {
          channel.postMessage({
            type: "UPDATE_STATE",
            payload: stateRef.current,
            postId: id,
          });
        }
      } else if (type === "UPDATE_STATE") {
        setState(payload as T);
      }
    };

    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
    };
  }, [key, id]);

  const setSharedState = useCallback(
    (
      valueOrFunction:
        | (T | undefined)
        | ((prev: T | undefined) => T | undefined)
    ) => {
      // Allow value to be a function so we have same API as useState
      const newState =
        valueOrFunction instanceof Function
          ? valueOrFunction(stateRef.current)
          : valueOrFunction;
      setState(newState);
      window.postMessage(
        {
          type: "UPDATE_STATE",
          payload: newState,
          postId: id,
          messageKey: key,
        },
        "*"
      );
      const channel = channels[key];
      channel.postMessage({
        type: "UPDATE_STATE",
        payload: newState,
        postId: id,
      });
    },
    [id, key]
  );

  return [state, setSharedState] as const;
};

export default useWindowMessageAndBroadcastChannelState;
