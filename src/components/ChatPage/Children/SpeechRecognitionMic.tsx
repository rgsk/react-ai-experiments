import { MicIcon, MicOffIcon } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import useWebSTT from "~/hooks/useWebSTT";

interface SpeechRecognitionMicProps {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  textInputDisabled: boolean;
  setTextInputDisabled: Dispatch<SetStateAction<boolean>>;
}
const SpeechRecognitionMic: React.FC<SpeechRecognitionMicProps> = ({
  text,
  setText,
  setTextInputDisabled,
  textInputDisabled,
}) => {
  const [localText, setLocalText] = useState(text);
  const { startRecognition, stopRecognition, recognitionActive } = useWebSTT({
    onFinalTranscript: (transcript, recognitionActive) => {
      setLocalText(text);
      if (!recognitionActive) {
        setTextInputDisabled(false);
      }
    },
    onInterimTranscript: (transcript) => {
      setText(localText + (localText ? "\n" : "") + transcript.trim());
    },
  });
  useEffect(() => {
    if (recognitionActive) {
      setTextInputDisabled(true);
    }
  }, [recognitionActive, setTextInputDisabled]);
  useEffect(() => {
    if (!textInputDisabled) {
      setLocalText(text);
    }
  }, [text, textInputDisabled]);

  return (
    <div>
      <Button
        className="rounded-full"
        size="icon"
        variant="outline"
        onClick={() => {
          if (recognitionActive) {
            stopRecognition();
          } else {
            startRecognition();
          }
        }}
      >
        {recognitionActive ? <MicOffIcon /> : <MicIcon />}
      </Button>
    </div>
  );
};
export default SpeechRecognitionMic;
