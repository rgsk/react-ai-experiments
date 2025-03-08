import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "~/lib/typesJsonData";
import experimentsService, { ToolCall } from "~/services/experimentsService";
import useSocket from "./useSocket";

const useTextStream = ({
  handleToolCall,
}: {
  handleToolCall: (toolCall: ToolCall) => Promise<void>;
}) => {
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array>>(undefined);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const { socketRef } = useSocket();
  const handleToolCallRef = useRef(handleToolCall);
  handleToolCallRef.current = handleToolCall;
  useEffect(() => {
    const socket = socketRef.current;
    if (socket) {
      socket.on("toolCall", (toolCall) => {
        handleToolCallRef.current(toolCall);
      });
      socket.on("content", (content) => {
        setText((prev) => prev + content);
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
      setText("");
      const result = await experimentsService.getText({
        messages,
        socketId: socketRef.current?.id,
      });
      setLoading(false);
      onComplete?.({ toolCalls: result.toolCalls });
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
