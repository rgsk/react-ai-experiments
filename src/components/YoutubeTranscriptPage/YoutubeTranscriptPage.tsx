import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Input } from "~/components/ui/input";
import experimentsService from "~/services/experimentsService";

interface YoutubeTranscriptPageProps {}
const YoutubeTranscriptPage: React.FC<YoutubeTranscriptPageProps> = ({}) => {
  const [videoUrlOrId, setVideoUrlOrId] = useState("");
  const transcriptQuery = useMemo(() => {
    return experimentsService.getYoutubeVideoTranscripts({ videoUrlOrId });
  }, [videoUrlOrId]);
  const transcriptQueryResult = useQuery({
    queryFn: transcriptQuery.fn,
    queryKey: transcriptQuery.key,
  });

  return (
    <div className="p-[20px]">
      <Input
        type="text"
        placeholder="Enter youtube video url or id"
        value={videoUrlOrId}
        onChange={(e) => setVideoUrlOrId(e.target.value)}
      />
      <div className="mt-[20px]">
        {transcriptQueryResult.isLoading && <div>Loading...</div>}

        {transcriptQueryResult.isSuccess && (
          <div>
            {transcriptQueryResult.data.map((transcript, i) => (
              <div key={i}>
                <div>{transcript.text}</div>
                <div>{transcript.offset}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default YoutubeTranscriptPage;
