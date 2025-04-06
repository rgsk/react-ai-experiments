import { useCallback, useMemo, useRef, useState } from "react";

const useWebSTT = ({
  onFinalTranscript,
  onInterimTranscript,
}: {
  onFinalTranscript: (transcript: string) => void;
  onInterimTranscript: (transcript: string) => void;
}) => {
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  onFinalTranscriptRef.current = onFinalTranscript;
  const [recognitionActive, setRecognitionActive] = useState(false);
  const recognitionActiveRef = useRef(recognitionActive);
  recognitionActiveRef.current = recognitionActive;
  const onInterimTranscriptRef = useRef(onInterimTranscript);
  onInterimTranscriptRef.current = onInterimTranscript;
  const recognitionInstance = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = function (event) {
      let finalTranscripts = "";
      let interimTranscripts = "";
      // console.log(event.results);
      // console.log(event.resultIndex);
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          // console.log("final", transcript);
          finalTranscripts += transcript;
        } else {
          // console.log("interim", transcript);
          interimTranscripts += transcript;
        }
      }
      // console.log({ finalTranscripts, interimTranscripts });
      if (finalTranscripts) {
        onFinalTranscriptRef.current(finalTranscripts);
      } else {
        onInterimTranscriptRef.current(interimTranscripts);
      }
    };
    return recognition;
  }, []);

  const startRecognition = useCallback(() => {
    setRecognitionActive(true);
    recognitionInstance!.start();
  }, [recognitionInstance]);

  const stopRecognition = useCallback(
    (abort?: boolean) => {
      setRecognitionActive(false);
      if (abort) {
        // don't make the last recorded speech as final
        recognitionInstance!.abort();
      } else {
        recognitionInstance!.stop();
      }
    },
    [recognitionInstance]
  );
  return {
    startRecognition,
    stopRecognition,
    recognitionActive,
  };
};
export default useWebSTT;
