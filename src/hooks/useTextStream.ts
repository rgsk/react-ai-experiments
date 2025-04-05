import { useCallback, useEffect, useRef, useState } from "react";
import { Message, Tool, ToolCall } from "~/lib/typesJsonData";

import { Model } from "~/lib/constants";
import experimentsService from "~/services/experimentsService";
import useSocket from "./useSocket";

const useTextStream = ({
  handleToolCall,
  handleToolCallOutput,
  addAudioChunk,
  completeAudio,
}: {
  handleToolCall: (toolCall: ToolCall) => Promise<void>;
  handleToolCallOutput: (entry: {
    toolCall: ToolCall;
    toolCallOutput: string;
  }) => Promise<void>;
  addAudioChunk?: (chunk: Uint8Array) => void;
  completeAudio?: () => void;
}) => {
  const [text, setText] = useState("");
  const [reasoningText, setReasoningText] = useState("");
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  const { socketRef } = useSocket();

  const [toolCallsInProgress, setToolCallsInProgress] = useState(false);
  useEffect(() => {
    const socket = socketRef.current;
    if (socket) {
      socket.on("toolCall", (toolCall) => {
        handleToolCall(toolCall);
      });
      socket.on("toolCallOutput", (entry) => {
        handleToolCallOutput(entry);
      });
      socket.on("content", (content) => {
        setText((prev) => prev + content);
      });
      socket.on("tool_calls", () => {
        setToolCallsInProgress(true);
      });
      socket.on("reasoning_content", (content) => {
        setReasoningText((prev) => prev + content);
      });
      socket.on("audio", (chunk) => {
        console.log({ chunk });
        addAudioChunk?.(chunk);
      });
      socket.on("audio-complete", () => {
        completeAudio?.();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketRef]);
  const handleStop = useCallback(() => {
    const socket = socketRef.current;
    if (socket) {
      socket.emit("stop");
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
      onComplete?: ({ toolCalls }: { toolCalls: ToolCall[] }) => Promise<void>;
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
      setToolCallsInProgress(false);
      await onComplete?.({ toolCalls: result.toolCalls });
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
    toolCallsInProgress,
  };
};
export default useTextStream;
