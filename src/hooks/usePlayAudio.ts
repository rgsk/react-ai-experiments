import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { arraysEqual, endOfStreamUint8Array } from "~/lib/audioUtils";
import experimentsService from "~/services/experimentsService";

const usePlayAudio = ({
  audioPlayerRef,
}: {
  audioPlayerRef: RefObject<HTMLAudioElement>;
}) => {
  const audioQueue = useRef<Uint8Array[]>([]);
  const currentMediaSourceRef = useRef<MediaSource>();
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array>>();
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const appendNextBuffer = (sourceBuffer: SourceBuffer) => {
    if (audioQueue.current.length > 0 && !sourceBuffer.updating) {
      const nextChunk = audioQueue.current.shift();
      if (nextChunk) {
        if (arraysEqual(endOfStreamUint8Array, nextChunk)) {
          const currentMediaSource = currentMediaSourceRef.current;
          if (currentMediaSource) {
            currentMediaSource.endOfStream();
          }
        } else {
          sourceBuffer.appendBuffer(nextChunk);
        }
      }
    }
  };

  const playAudio = useCallback(
    async ({ text }: { text: string }) => {
      setLoading(true);
      const reader = await experimentsService.getPlayAudioStreamReader({
        text: text,
      });
      readerRef.current = reader;

      const audioPlayer = audioPlayerRef.current!;

      const mediaSource = new MediaSource();
      currentMediaSourceRef.current = mediaSource;

      mediaSource.addEventListener("sourceopen", () => {
        const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
        sourceBuffer.addEventListener("updateend", () => {
          appendNextBuffer(sourceBuffer);
        });
        const processAudioChunk = (chunk: Uint8Array) => {
          if (sourceBuffer.updating) {
            audioQueue.current.push(chunk);
          } else {
            audioQueue.current.push(chunk);
            appendNextBuffer(sourceBuffer);
          }
        };
        const readStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              processAudioChunk(endOfStreamUint8Array);
              return;
            }

            processAudioChunk(value);
            readStream();
          });
        };

        readStream();
      });

      audioPlayer.src = URL.createObjectURL(mediaSource);
      audioPlayer.play();
    },
    [audioPlayerRef]
  );

  useEffect(() => {
    const audioPlayer = audioPlayerRef.current;
    const handleEnded = () => {
      // console.log("Audio has ended");
      // Add your logic here for when the audio ends
      setPlaying(false);
    };
    const handlePlay = () => {
      // console.log("Audio has started playing");
      // Add your logic here for when the audio starts playing
      setPlaying(true);
      setLoading(false);
    };

    if (audioPlayer) {
      audioPlayer.addEventListener("ended", handleEnded);
      audioPlayer.addEventListener("play", handlePlay);
    }

    return () => {
      if (audioPlayer) {
        audioPlayer.removeEventListener("ended", handleEnded);
        audioPlayer.removeEventListener("play", handlePlay);
      }
    };
  }, [audioPlayerRef]);
  const stopPlaying = () => {
    const audioPlayer = audioPlayerRef.current!;
    audioPlayer.pause();
    readerRef.current?.cancel();
    setPlaying(false);
    setLoading(false);
  };
  return {
    playAudio,
    playing,
    stopPlaying,
    loading,
  };
};
export default usePlayAudio;
