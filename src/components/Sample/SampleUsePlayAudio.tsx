import { useRef, useState } from "react";
import usePlayAudio from "~/hooks/usePlayAudio";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface SampleUsePlayAudioProps {}
const SampleUsePlayAudio: React.FC<SampleUsePlayAudioProps> = ({}) => {
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [value, setValue] = useState("");
  const { playAudio, playing } = usePlayAudio({ audioPlayerRef });
  return (
    <div>
      <p>Playing: {playing ? "true" : "false"}</p>
      <audio className="hidden" ref={audioPlayerRef}></audio>

      <Input value={value} onChange={(e) => setValue(e.target.value)} />

      <Button
        onClick={() => {
          playAudio({ text: value });
        }}
      >
        Play
      </Button>
    </div>
  );
};
export default SampleUsePlayAudio;
