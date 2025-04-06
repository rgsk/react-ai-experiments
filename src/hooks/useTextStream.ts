import { useCallback, useEffect, useRef, useState } from "react";
import { Message, Tool, ToolCall } from "~/lib/typesJsonData";

import { Socket } from "socket.io-client";
import { Model } from "~/lib/constants";
import experimentsService from "~/services/experimentsService";
import useSocket from "./useSocket";

const useTextStream = ({
  handleToolCall,
  handleToolCallOutput,
  autoReadAloudProps,
}: {
  handleToolCall: (toolCall: ToolCall) => Promise<void>;
  handleToolCallOutput: (entry: {
    toolCall: ToolCall;
    toolCallOutput: string;
  }) => Promise<void>;
  autoReadAloudProps?: {
    addAudioChunk: (chunk: Uint8Array) => void;
    completeAudio: () => void;
    startPlayback: (socket: Socket) => void;
    stopPlaying: () => void;
  };
}) => {
  const [text, setText] = useState("");
  const [reasoningText, setReasoningText] = useState("");
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  const { socketRef } = useSocket();

  const [toolCallsInProgress, setToolCallsInProgress] = useState(false);
  const handleToolCallRef = useRef(handleToolCall);
  handleToolCallRef.current = handleToolCall;
  const handleToolCallOutputRef = useRef(handleToolCallOutput);
  handleToolCallOutputRef.current = handleToolCallOutput;
  const autoReadAloudPropsRef = useRef(autoReadAloudProps);
  autoReadAloudPropsRef.current = autoReadAloudProps;

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
      socket.on("tool_calls", () => {
        setToolCallsInProgress(true);
      });
      socket.on("reasoning_content", (content) => {
        setReasoningText((prev) => prev + content);
      });
      socket.on("audio", (chunk) => {
        autoReadAloudPropsRef.current?.addAudioChunk(chunk);
      });
      socket.on("audio-complete", () => {
        autoReadAloudPropsRef.current?.completeAudio();
      });
    }
    return () => {
      if (socket) {
        socket.off("toolCall");
        socket.off("toolCallOutput");
        socket.off("content");
        socket.off("tool_calls");
        socket.off("reasoning_content");
        socket.off("audio");
        socket.off("audio-complete");
      }
    };
  }, [socketRef]);
  const handleStop = useCallback(() => {
    autoReadAloudPropsRef.current?.stopPlaying();
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
      streamAudio,
    }: {
      messages: Message[];
      onComplete?: ({ toolCalls }: { toolCalls: ToolCall[] }) => Promise<void>;
      tools?: Tool[];
      model: Model;
      streamAudio?: boolean;
    }) => {
      const socket = socketRef.current;
      autoReadAloudPropsRef.current?.startPlayback(socket!);
      setLoading(true);
      setText("");
      setReasoningText("");
      const result = await experimentsService.getText({
        messages,
        socketId: socketRef.current?.id,
        tools: tools,
        model,
        streamAudio,
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
