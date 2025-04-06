import { MicIcon, MicOffIcon } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import useWebSTT from "~/hooks/useWebSTT";

interface SpeechRecognitionMicProps {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  textInputDisabled: boolean;
  setTextInputDisabled: Dispatch<SetStateAction<boolean>>;
  scrollTextAreaToBottom: () => void;
}
const SpeechRecognitionMic: React.FC<SpeechRecognitionMicProps> = ({
  text,
  setText,
  setTextInputDisabled,
  textInputDisabled,
  scrollTextAreaToBottom,
}) => {
  const [localText, setLocalText] = useState(text);
  const { startRecognition, stopRecognition, recognitionActive } = useWebSTT({
    onFinalTranscript: (transcript) => {
      setLocalText(text);
    },
    onInterimTranscript: (transcript) => {
      setText(localText + (localText ? "\n" : "") + transcript.trim());
      scrollTextAreaToBottom();
    },
  });
  useEffect(() => {
    if (recognitionActive) {
      setTextInputDisabled(true);
    }
  }, [recognitionActive, setTextInputDisabled]);

  useEffect(() => {
    if (!recognitionActive && text === localText) {
      setTextInputDisabled(false);
    }
  }, [localText, recognitionActive, setTextInputDisabled, text]);

  useEffect(() => {
    if (!textInputDisabled) {
      setLocalText(text);
    }
  }, [text, textInputDisabled]);
  useEffect(() => {
    if (text === "") {
      stopRecognition();
      setLocalText("");
    }
  }, [stopRecognition, text]);

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
