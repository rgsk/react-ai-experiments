import { useRef, useState } from "react";
import useAudioAIResponse from "~/hooks/useAudioAIResponse";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface SampleAudioAIResponseProps {}
const SampleAudioAIResponse: React.FC<SampleAudioAIResponseProps> = ({}) => {
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [value, setValue] = useState("");
  const { playAudio, playing } = useAudioAIResponse({ audioPlayerRef });
  return (
    <div>
      <p>Playing: {playing ? "true" : "false"}</p>
      <audio className="hidden" ref={audioPlayerRef}></audio>

      <Input value={value} onChange={(e) => setValue(e.target.value)} />

      <Button
        onClick={() => {
          playAudio({
            messages: [
              {
                role: "user",
                content: value,
              },
            ] as any,
          });
        }}
      >
        Play
      </Button>
    </div>
  );
};
export default SampleAudioAIResponse;
