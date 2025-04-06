import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
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
  const [streamLoading, setStreamLoading] = useState(false);
  const socketRef = useRef<Socket>();
  // Tracks whether playback has been initialized

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
    audioQueue.current = [];
    currentMediaSourceRef.current = null;
    sourceBufferRef.current = null;

    const audioPlayer = audioPlayerRef.current!;
    const mediaSource = new MediaSource();
    currentMediaSourceRef.current = mediaSource;

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

  const addChunk = useCallback((chunk: Uint8Array) => {
    // Enqueue the incoming chunk.
    audioQueue.current.push(chunk);
    setLoading(false);
    // Try to flush the queue if sourceBuffer is available.
    const sourceBuffer = sourceBufferRef.current;
    if (sourceBuffer && !sourceBuffer.updating) {
      appendNextBuffer(sourceBuffer);
    }
  }, []);

  // Signals that no further audio chunks will be provided.
  const completeAudio = useCallback(() => {
    addChunk(endOfStreamUint8Array);
    setStreamLoading(false);
  }, [addChunk]);

  const stopPlaying = useCallback(() => {
    const audioPlayer = audioPlayerRef.current!;
    audioPlayer.pause();
    setPlaying(false);
    const socket = socketRef.current;
    if (socket) {
      socket.emit("audio-stop");
    }
  }, [audioPlayerRef]);

  useEffect(() => {
    const audioPlayer = audioPlayerRef.current;
    if (!audioPlayer) return;

    const handleEnded = () => {
      setPlaying(false);
    };

    const handlePlay = () => {
      setPlaying(true);
    };

    audioPlayer.addEventListener("ended", handleEnded);
    audioPlayer.addEventListener("play", handlePlay);
    return () => {
      audioPlayer.removeEventListener("ended", handleEnded);
      audioPlayer.removeEventListener("play", handlePlay);
    };
  }, [audioPlayerRef]);
  const startPlayback = useCallback(
    (socket: Socket) => {
      socketRef.current = socket;
      setLoading(true);
      setStreamLoading(true);
      initPlayback();
    },
    [initPlayback]
  );
  return {
    startPlayback,
    addAudioChunk: addChunk,
    completeAudio,
    stopPlaying,
    playing,
    loading,
    streamLoading,
  };
};

export default usePlayAudioChunks;
