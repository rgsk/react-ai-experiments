import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { arraysEqual, endOfStreamUint8Array } from "~/lib/audioUtils";

const usePlayAudioChunks = ({
  audioPlayerRef,
}: {
  audioPlayerRef: RefObject<HTMLAudioElement>;
}) => {
  const audioQueue = useRef<Uint8Array[]>([]);
  const currentMediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const appendNextBuffer = (sourceBuffer: SourceBuffer) => {
    if (audioQueue.current.length > 0 && !sourceBuffer.updating) {
      const nextChunk = audioQueue.current.shift();
      if (nextChunk) {
        if (arraysEqual(endOfStreamUint8Array, nextChunk)) {
          currentMediaSourceRef.current?.endOfStream();
        } else {
          sourceBuffer.appendBuffer(nextChunk);
        }
      }
    }
  };

  // Initializes playback by setting up a new MediaSource
  const startPlayback = useCallback(() => {
    setLoading(true);
    const audioPlayer = audioPlayerRef.current!;
    const mediaSource = new MediaSource();
    currentMediaSourceRef.current = mediaSource;

    mediaSource.addEventListener("sourceopen", () => {
      const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
      sourceBufferRef.current = sourceBuffer;

      sourceBuffer.addEventListener("updateend", () => {
        appendNextBuffer(sourceBuffer);
      });
      // If there are any already queued chunks, start appending them
      appendNextBuffer(sourceBuffer);
    });

    audioPlayer.src = URL.createObjectURL(mediaSource);
    audioPlayer.play();
  }, [audioPlayerRef]);

  // This function should be called externally when new audio chunk data is available
  const addChunk = useCallback((chunk: Uint8Array) => {
    audioQueue.current.push(chunk);
    const sourceBuffer = sourceBufferRef.current;
    if (sourceBuffer && !sourceBuffer.updating) {
      appendNextBuffer(sourceBuffer);
    }
  }, []);

  // Call this function to signal that no more audio chunks will be provided
  const completeAudio = useCallback(() => {
    addChunk(endOfStreamUint8Array);
  }, [addChunk]);

  const stopPlaying = useCallback(() => {
    const audioPlayer = audioPlayerRef.current!;
    audioPlayer.pause();
    // Optionally clear the queue and reset states here
    setPlaying(false);
    setLoading(false);
  }, [audioPlayerRef]);

  useEffect(() => {
    const audioPlayer = audioPlayerRef.current;
    const handleEnded = () => {
      setPlaying(false);
    };
    const handlePlay = () => {
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

  return {
    startPlayback,
    addAudioChunk: addChunk,
    completeAudio,
    stopPlaying,
    playing,
    loading,
  };
};

export default usePlayAudioChunks;
