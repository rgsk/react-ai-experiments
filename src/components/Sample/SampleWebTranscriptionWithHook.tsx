import { useCallback, useState } from "react";

import useWebSTT from "~/hooks/auth/useWebSTT";
import { Button } from "../ui/button";

interface SampleWebTranscriptionWithHookProps {}
const SampleWebTranscriptionWithHook: React.FC<
  SampleWebTranscriptionWithHookProps
> = ({}) => {
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const onFinalTranscript = useCallback((transcript: string) => {
    console.log({ transcript });
    setTranscripts((prev) => [...prev, transcript]);
  }, []);
  const onInterimTranscript = useCallback((transcript: string) => {
    console.log({ transcript });
  }, []);
  const { startRecognition, stopRecognition } = useWebSTT({
    onFinalTranscript,
    onInterimTranscript,
  });
  return (
    <div className="space-y-4">
      <h2 className="text-lg">Web Transcripts</h2>
      <div className="flex gap-4">
        <Button onClick={startRecognition}>Start</Button>
        <Button onClick={() => stopRecognition()}>Stop</Button>
      </div>
      <div>
        <div>
          {transcripts.map((transcript, i) => {
            return <p key={i}>{transcript}</p>;
          })}
        </div>
      </div>
    </div>
  );
};
export default SampleWebTranscriptionWithHook;
