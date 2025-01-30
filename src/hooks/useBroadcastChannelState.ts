import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 } from "uuid";

const channels: Record<string, BroadcastChannel> = {};

const useBroadcastChannelState = <T>(channelName: string, initialValue?: T) => {
  if (!channels[channelName]) {
    channels[channelName] = new BroadcastChannel(channelName);
  }
  const channel = channels[channelName];

  const [state, setState] = useState<T | undefined>(initialValue);
  const stateRef = useRef(state);
  stateRef.current = state;
  const id = useMemo(() => v4(), []);
  useEffect(() => {
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
  }, [channel, id]);

  const setSharedState = useCallback(
    (newState: T | undefined) => {
      setState(newState);
      channel.postMessage({
        type: "UPDATE_STATE",
        payload: newState,
        postId: id,
      });
    },
    [channel, id]
  );

  return [state, setSharedState] as const;
};

export default useBroadcastChannelState;
