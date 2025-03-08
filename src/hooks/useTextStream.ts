import { useCallback, useRef, useState } from "react";
import experimentsService, {
  CompletionMessage,
} from "~/services/experimentsService";
export function uint8ArrayToString(uint8Array: Uint8Array) {
  return new TextDecoder().decode(uint8Array);
}
const useTextStream = () => {
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array>>();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const handleGenerate = useCallback(
    async ({
      messages,
      onComplete,
    }: {
      messages: CompletionMessage[];
      onComplete?: () => void;
    }) => {
      if (readerRef.current) {
        await readerRef.current.cancel();
      }
      setLoading(true);
      setText("");
      const reader = await experimentsService.getTextStreamReader({
        messages,
      });

      if (reader) {
        readerRef.current = reader;
        // Object to accumulate the tool call arguments for each index.
        const toolCallAccumulators: any = {};
        // Object to store the full tool call objects (saved once when first received).
        const savedToolCalls: any = {};
        let buffer = "";

        function extractJSONObjects(str: string) {
          const objects = [];
          let braceDepth = 0;
          let startIndex = -1;
          let inString = false;
          let escapeNext = false;

          for (let i = 0; i < str.length; i++) {
            const char = str[i];

            if (escapeNext) {
              escapeNext = false;
              continue;
            }

            // Handle escape characters
            if (char === "\\") {
              escapeNext = true;
              continue;
            }

            // Toggle inString status when encountering a non-escaped quote
            if (char === '"') {
              inString = !inString;
              continue;
            }

            if (!inString) {
              if (char === "{") {
                if (braceDepth === 0) {
                  startIndex = i;
                }
                braceDepth++;
              } else if (char === "}") {
                braceDepth--;
                if (braceDepth === 0 && startIndex !== -1) {
                  const jsonStr = str.slice(startIndex, i + 1);
                  objects.push({ jsonStr, endIndex: i + 1 });
                  startIndex = -1;
                }
              }
            }
          }
          return objects;
        }

        const readStream = () => {
          reader.read().then(({ done, value: entireChunk }) => {
            if (done) {
              // Optionally, handle any remaining data in the buffer.
              if (buffer.trim()) {
                console.warn("Leftover incomplete data:", buffer);
              }
              // Process saved tool calls and clean up.
              for (const idx in savedToolCalls) {
                savedToolCalls[idx].function.arguments = JSON.parse(
                  toolCallAccumulators[idx]
                );
              }
              console.log({ savedToolCalls });
              readerRef.current = undefined;
              setLoading(false);
              onComplete?.();
              return;
            }

            if (entireChunk) {
              // Convert the chunk to string and append it to the persistent buffer.
              buffer += uint8ArrayToString(entireChunk);

              // Extract complete JSON objects from the buffer.
              const extracted = extractJSONObjects(buffer);
              let lastProcessedIndex = 0;

              for (const { jsonStr, endIndex } of extracted) {
                try {
                  const delta = JSON.parse(jsonStr);
                  // Process content if exists.
                  if (delta.content) {
                    setText((prev) => prev + delta.content);
                  }
                  // Process tool_calls if they exist.
                  if (delta.tool_calls) {
                    for (const toolCall of delta.tool_calls) {
                      const idx = toolCall.index;
                      // Save the complete tool call object the first time it appears.
                      if (!savedToolCalls[idx]) {
                        savedToolCalls[idx] = toolCall;
                      }
                      // Initialize the accumulator if needed.
                      if (!toolCallAccumulators[idx]) {
                        toolCallAccumulators[idx] = "";
                      }
                      // Append the current chunk of arguments.
                      toolCallAccumulators[idx] +=
                        toolCall.function?.arguments || "";
                    }
                  }
                  lastProcessedIndex = endIndex; // update the last processed index
                } catch (error) {
                  console.error("JSON parse error for string:", jsonStr, error);
                }
              }

              // Keep the remaining part (incomplete object) in the buffer.
              buffer = buffer.slice(lastProcessedIndex);
            }
            // Continue reading the stream
            readStream();
          });
        };

        readStream();
      }
    },
    []
  );

  return {
    text,
    loading,
    handleGenerate,
  };
};
export default useTextStream;

const v = {
  stringValue:
    '{"role":"assistant","content":null,"tool_calls":[{"index":0,"id":"call_fXslCxzAFC51hzn8iQDmfLbw","type":"function","function":{"name":"GOOGLESHEETS_GET_SPREADSHEET_INFO","arguments":""}}],"refusal":null}{"tool_calls":[{"index":0,"function":{"arguments":"{\\""}}]}',
};
