import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "~/lib/typesJsonData";
import { uint8ArrayToString } from "~/lib/utils";
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
      const reader = await experimentsService.getTextStreamReader({
        messages,
        socketId: socketRef.current?.id,
      });

      if (reader) {
        readerRef.current = reader;
        const readStream = () => {
          reader.read().then(({ done, value: entireChunk }) => {
            if (done) {
              readerRef.current = undefined;
              setLoading(false);
              onComplete?.({ toolCalls: toolCallsRef.current });
              return;
            }
            if (entireChunk) {
              const stringValue = uint8ArrayToString(entireChunk);
              setText((prev) => prev + stringValue);
            }
            readStream();
          });
        };

        readStream();
      }
    },
    []
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
