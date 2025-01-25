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
        const readStream = () => {
          reader.read().then(({ done, value: entireChunk }) => {
            if (done) {
              readerRef.current = undefined;
              setLoading(false);
              onComplete?.();
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

  return {
    text,
    loading,
    handleGenerate,
  };
};
export default useTextStream;
