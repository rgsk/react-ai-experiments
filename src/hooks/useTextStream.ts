import { useCallback, useEffect, useRef, useState } from "react";
import { Message, Tool, ToolCall } from "~/lib/typesJsonData";

import { Model } from "~/lib/constants";
import experimentsService from "~/services/experimentsService";
import useSocket from "./useSocket";

const useTextStream = ({
  handleToolCall,
  handleToolCallOutput,
}: {
  handleToolCall: (toolCall: ToolCall) => Promise<void>;
  handleToolCallOutput: (entry: {
    toolCall: ToolCall;
    toolCallOutput: string;
  }) => Promise<void>;
}) => {
  const [text, setText] = useState("");
  const [reasoningText, setReasoningText] = useState("");
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(loading);
  loadingRef.current = loading;
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
      socket.on("reasoning_content", (content) => {
        setReasoningText((prev) => prev + content);
      });
    }
  }, [socketRef]);
  const handleStop = useCallback(() => {
    const socket = socketRef.current;
    if (socket) {
      socket.emit("stop");
    }
    if (loadingRef.current) {
      return new Promise<undefined>((resolve) => {
        window.addEventListener(
          "message",
          (e) => {
            if (e.data.type === "textStreamComplete") {
              resolve(undefined);
            }
          },
          { once: true }
        );
      });
    }
  }, [socketRef]);
  const handleGenerate = useCallback(
    async ({
      messages,
      onComplete,
      tools,
      model,
    }: {
      messages: Message[];
      onComplete?: ({ toolCalls }: { toolCalls: ToolCall[] }) => void;
      tools?: Tool[];
      model: Model;
    }) => {
      setLoading(true);
      setText("");
      setReasoningText("");
      const result = await experimentsService.getText({
        messages,
        socketId: socketRef.current?.id,
        tools: tools,
        model,
      });
      setLoading(false);
      onComplete?.({ toolCalls: result.toolCalls });
      window.postMessage(
        {
          type: "textStreamComplete",
        },
        "*"
      );
    },
    [socketRef]
  );
  const reset = useCallback(() => {
    setText("");
    setReasoningText("");
  }, []);

  return {
    text,
    loading,
    handleGenerate,
    reset,
    reasoningText,
    handleStop,
  };
};
export default useTextStream;
