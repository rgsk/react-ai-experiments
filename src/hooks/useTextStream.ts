import { useCallback, useEffect, useRef, useState } from "react";
import { Message, Tool, ToolCall } from "~/lib/typesJsonData";

import experimentsService from "~/services/experimentsService";
import useSocket from "./useSocket";

const useTextStream = ({
  handleToolCall,
  handleToolCallOutput,
  model,
}: {
  handleToolCall: (toolCall: ToolCall) => Promise<void>;
  handleToolCallOutput: (entry: {
    toolCall: ToolCall;
    toolCallOutput: string;
  }) => Promise<void>;
  model: string;
}) => {
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array>>(undefined);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const { socketRef } = useSocket();
  const handleToolCallRef = useRef(handleToolCall);
  handleToolCallRef.current = handleToolCall;
  const handleToolCallOutputRef = useRef(handleToolCallOutput);
  handleToolCallOutputRef.current = handleToolCallOutput;
  useEffect(() => {
    const socket = socketRef.current;
    if (socket) {
      socket.on("toolCall", (toolCall) => {
        handleToolCallRef.current(toolCall);
      });
      socket.on("toolCallOutput", (entry) => {
        handleToolCallOutputRef.current(entry);
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
      tools,
    }: {
      messages: Message[];
      onComplete?: ({ toolCalls }: { toolCalls: ToolCall[] }) => void;
      tools: Tool[];
    }) => {
      if (readerRef.current) {
        await readerRef.current.cancel();
      }
      setLoading(true);
      setText("");
      const result = await experimentsService.getText({
        messages,
        socketId: socketRef.current?.id,
        tools: tools,
        model,
      });
      setLoading(false);
      onComplete?.({ toolCalls: result.toolCalls });
    },
    [model, socketRef]
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
