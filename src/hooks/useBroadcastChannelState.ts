import { useCallback, useEffect, useRef, useState } from "react";

const channels: Record<string, BroadcastChannel> = {};

const useBroadcastChannelState = <T>(channelName: string, initialValue?: T) => {
  if (!channels[channelName]) {
    channels[channelName] = new BroadcastChannel(channelName);
  }
  const channel = channels[channelName];

  const [state, setState] = useState<T | undefined>(initialValue);
  const isLocalUpdate = useRef(false); // ✅ Prevent recursive updates

  useEffect(() => {
    // Request latest state from other tabs
    channel.postMessage({ type: "REQUEST_STATE", payload: null });

    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;

      if (type === "REQUEST_STATE" && state !== undefined) {
        channel.postMessage({ type: "SYNC_STATE", payload: state });
      } else if (type === "SYNC_STATE" || type === "UPDATE_STATE") {
        if (!isLocalUpdate.current) {
          setState(payload as T);
        }
      }
    };

    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
    };
  }, [channel, state]);

  const setSharedState = useCallback(
    (newState: T | undefined) => {
      isLocalUpdate.current = true; // ✅ Mark as local update
      setState(newState);
      channel.postMessage({ type: "UPDATE_STATE", payload: newState });

      // ✅ Reset flag after short delay to allow external updates later
      setTimeout(() => {
        isLocalUpdate.current = false;
      }, 100);
    },
    [channel]
  );

  return [state, setSharedState] as const;
};

export default useBroadcastChannelState;
