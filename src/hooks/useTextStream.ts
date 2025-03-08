import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "~/lib/typesJsonData";
import experimentsService, { ToolCall } from "~/services/experimentsService";
import useSocket from "./useSocket";

const useTextStream = ({
  handleToolCalls,
}: {
  handleToolCalls: (toolCalls: ToolCall[]) => Promise<void>;
}) => {
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array>>(undefined);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const { socketRef } = useSocket();
  const handleToolCallsRef = useRef(handleToolCalls);
  handleToolCallsRef.current = handleToolCalls;
  const [toolCalls, setToolCalls] = useState([]);
  const toolCallsRef = useRef(toolCalls);
  toolCallsRef.current = toolCalls;
  useEffect(() => {
    const socket = socketRef.current;
    if (socket) {
      socket.on("toolCallsToExecute", (toolCallsToExecute) => {
        console.log("toolCallsToExecute", toolCallsToExecute);
        setToolCalls(toolCallsToExecute);
        handleToolCallsRef.current(toolCallsToExecute);
      });
      socket.on("chunk", (chunk) => {
        setText((prev) => prev + chunk);
      });
    }
  }, [socketRef]);
  const handleGenerate = useCallback(
    async ({
      messages,
      onComplete,
    }: {
      messages: Message[];
      onComplete?: ({ toolCalls }: { toolCalls: ToolCall[] }) => void;
    }) => {
      if (readerRef.current) {
        await readerRef.current.cancel();
      }
      setLoading(true);
      setToolCalls([]);
      setText("");
      const result = await experimentsService.getText({
        messages,
        socketId: socketRef.current?.id,
      });
      setLoading(false);
      onComplete?.({ toolCalls: toolCallsRef.current });
    },
    [socketRef]
  );
  const reset = useCallback(() => {
    setText("");
  }, []);

  return {
    text,
    loading,
    handleGenerate,
    reset,
  };
};
export default useTextStream;
