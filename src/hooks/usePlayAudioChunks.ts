import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { arraysEqual, endOfStreamUint8Array } from "~/lib/audioUtils";

const usePlayAudioChunks = ({
  audioPlayerRef,
  autoStartOnChunk = false,
}: {
  audioPlayerRef: RefObject<HTMLAudioElement>;
  autoStartOnChunk?: boolean;
}) => {
  const audioQueue = useRef<Uint8Array[]>([]);
  const currentMediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  // Tracks whether playback has been initialized
  const initializedRef = useRef(false);

  const resetInternalState = () => {
    initializedRef.current = false;
    audioQueue.current = [];
    currentMediaSourceRef.current = null;
    sourceBufferRef.current = null;
  };

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

  const initPlayback = useCallback(() => {
    if (initializedRef.current) return;

    setLoading(true);
    const audioPlayer = audioPlayerRef.current!;
    const mediaSource = new MediaSource();
    currentMediaSourceRef.current = mediaSource;
    initializedRef.current = true;

    mediaSource.addEventListener("sourceopen", () => {
      const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
      sourceBufferRef.current = sourceBuffer;

      sourceBuffer.addEventListener("updateend", () => {
        appendNextBuffer(sourceBuffer);
      });
      // Flush any queued chunks
      appendNextBuffer(sourceBuffer);
    });

    audioPlayer.src = URL.createObjectURL(mediaSource);
    audioPlayer.play();
  }, [audioPlayerRef]);

  // Allows manual start
  const startPlayback = useCallback(() => {
    initPlayback();
  }, [initPlayback]);

  const addChunk = useCallback(
    (chunk: Uint8Array) => {
      // Enqueue the incoming chunk.
      audioQueue.current.push(chunk);

      // Auto-start if enabled and not already initialized.
      if (autoStartOnChunk && !initializedRef.current) {
        initPlayback();
      }

      // Try to flush the queue if sourceBuffer is available.
      const sourceBuffer = sourceBufferRef.current;
      if (sourceBuffer && !sourceBuffer.updating) {
        appendNextBuffer(sourceBuffer);
      }
    },
    [autoStartOnChunk, initPlayback]
  );

  // Signals that no further audio chunks will be provided.
  const completeAudio = useCallback(() => {
    addChunk(endOfStreamUint8Array);
  }, [addChunk]);

  const stopPlaying = useCallback(() => {
    const audioPlayer = audioPlayerRef.current!;
    audioPlayer.pause();
    setPlaying(false);
    setLoading(false);
    resetInternalState();
  }, [audioPlayerRef]);

  useEffect(() => {
    const audioPlayer = audioPlayerRef.current;
    if (!audioPlayer) return;

    const handleEnded = () => {
      setPlaying(false);
      // Reset internal state to allow a new playback session.
      resetInternalState();
    };

    const handlePlay = () => {
      setPlaying(true);
      setLoading(false);
    };

    audioPlayer.addEventListener("ended", handleEnded);
    audioPlayer.addEventListener("play", handlePlay);
    return () => {
      audioPlayer.removeEventListener("ended", handleEnded);
      audioPlayer.removeEventListener("play", handlePlay);
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
