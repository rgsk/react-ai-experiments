import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import experimentsService, {
  CompletionMessage,
} from "~/services/experimentsService";

const SampleRealtimeWebRTC = ({
  initialMessages,
}: {
  initialMessages: CompletionMessage[];
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const pcRef = useRef<any>(null);
  const dcRef = useRef<any>(null);
  const localStreamRef = useRef<any>(null);
  const audioRef = useRef<any>(null);
  const ephemeralKeyRef = useRef<any>(null);

  const handleStart = async () => {
    if (isRunning) return;

    try {
      // Fetch ephemeral key
      const data = await experimentsService.getSession();
      ephemeralKeyRef.current = data.client_secret.value;

      // Create a peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Set up remote audio playback
      const audioEl = new Audio();
      audioEl.autoplay = true;
      audioRef.current = audioEl;

      pc.ontrack = (e) => {
        if (audioRef.current) {
          audioRef.current.srcObject = e.streams[0];
        }
      };

      // Get local microphone audio
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = ms;
      ms.getTracks().forEach((track) => pc.addTrack(track, ms));

      // Create data channel
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;
      dc.addEventListener("open", () => {
        console.log("Data channel is open");
        for (const message of initialMessages) {
          const responseCreate = {
            type: "conversation.item.create",
            previous_item_id: null,
            item: {
              type: "message",
              role: message.role,
              content: [
                {
                  type: message.role === "user" ? "input_text" : "text",
                  text: message.content,
                },
              ],
            },
          };
          dc.send(JSON.stringify(responseCreate));
        }
      });

      dc.addEventListener("message", (e) => {
        // console.log("Realtime event : ", e.data);
        const realtimeEvent = JSON.parse(e.data);
        if (realtimeEvent.type === sampleAudioTranscriptDoneEvent.type) {
          // const event = realtimeEvent as typeof sampleAudioTranscriptDoneEvent;
          // console.log("Transcript received: ", event.transcript);
        } else if (
          realtimeEvent.type ===
          sampleInputAudioTranscriptionCompletedEvent.type
        ) {
          // const event =
          //   realtimeEvent as typeof sampleInputAudioTranscriptionCompletedEvent;
          // console.log("Transcript sent: ", event.transcript);
        } else if (
          realtimeEvent.type === sampleAudioTranscriptDeltaEvent.type
        ) {
          const event = realtimeEvent as typeof sampleAudioTranscriptDeltaEvent;
          console.log(event.delta);
        }
      });

      // Create offer and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Exchange SDP with OpenAI Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKeyRef.current}`,
          "Content-Type": "application/sdp",
        },
      });

      const answerSDP = await sdpResponse.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSDP });

      setIsRunning(true);
    } catch (err) {
      console.error("Error starting session:", err);
    }
  };

  const handleStop = () => {
    // Close data channel
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }

    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // Stop local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track: any) => track.stop());
      localStreamRef.current = null;
    }

    // Clear audio element
    if (audioRef.current) {
      audioRef.current.srcObject = null;
      audioRef.current = null;
    }

    ephemeralKeyRef.current = null;

    setIsRunning(false);
  };

  return (
    <div className="p-5">
      <p className="text-lg mb-2">Test Realtime WebRTC API</p>
      <div className="flex gap-2">
        <div>
          <Button onClick={handleStart} disabled={isRunning}>
            Start
          </Button>
        </div>
        <div>
          <Button onClick={handleStop} disabled={!isRunning}>
            Stop
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SampleRealtimeWebRTC;

const sampleInputAudioTranscriptionCompletedEvent = {
  type: "conversation.item.input_audio_transcription.completed",
  event_id: "event_AucppWPtRXNgx2ksKAVLi",
  item_id: "item_AucpnWc39PkRqHsRla7Cf",
  content_index: 0,
  transcript: "Do you know who Steve Jobs is?\n",
};

const sampleAudioTranscriptDoneEvent = {
  type: "response.audio_transcript.done",
  event_id: "event_AucqzwgNVcoLvF9upRLzC",
  response_id: "resp_AucqyyqtK01CJr1XNI8c9",
  item_id: "item_AucqyNm6lp32vpEN08KLq",
  output_index: 0,
  content_index: 0,
  transcript: "Hi there! How's it going today? ",
};

const sampleAudioTranscriptDeltaEvent = {
  type: "response.audio_transcript.delta",
  event_id: "event_Audqx2Upmna4SoL36aDg7",
  response_id: "resp_Audqxa3yBNwzQe4ZN3yGx",
  item_id: "item_AudqxsoubuEPNX7m7SOQJ",
  output_index: 0,
  content_index: 0,
  delta: " there",
};
