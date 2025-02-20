import { useCallback, useEffect, useRef } from "react";
import { Socket, io } from "socket.io-client";
import environmentVars from "~/lib/environmentVars";
const socketUrl = environmentVars.EXPERIMENTS_SERVER_URL;

const useSocket = () => {
  const socketRef = useRef<Socket>(undefined);

  const connect = useCallback(() => {
    if (socketUrl) {
      const socket = io(socketUrl);
      socketRef.current = socket;
    }
  }, []);
  const disconnect = useCallback(() => {
    const socket = socketRef.current;
    if (socket) {
      socket.disconnect();
    }
  }, []);
  const resetConnection = useCallback(() => {
    disconnect();
    connect();
  }, [connect, disconnect]);
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  return { socketRef, resetConnection };
};
export default useSocket;
