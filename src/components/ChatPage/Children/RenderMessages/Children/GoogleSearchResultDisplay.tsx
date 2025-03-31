import { GoogleSearchResult } from "~/lib/typesJsonData";
import { cn, getFavicon } from "~/lib/utils";

interface GoogleSearchResultDisplayProps {
  googleSearchResult: GoogleSearchResult;
  type: "cited-source" | "tool-call";
}
const GoogleSearchResultDisplay: React.FC<GoogleSearchResultDisplayProps> = ({
  googleSearchResult,
  type,
}) => {
  return (
    <div
      className={cn(
        "flex gap-[20px] group hover:bg-muted rounded-lg p-3 min-w-[400px]",
        type === "cited-source" && "bg-muted"
      )}
    >
      <div>
        <div className="flex gap-3">
          <img
            src={getFavicon(googleSearchResult.displayLink)}
            className="w-[24px] h-[24px]"
          />
          <p>{googleSearchResult.displayLink}</p>
        </div>
        <p className="font-bold group-hover:underline">
          {googleSearchResult.title}
        </p>
        <p>{googleSearchResult.snippet}</p>
      </div>
      <div className="flex-1"></div>
      <div>
        <img
          src={googleSearchResult.image}
          className="max-w-[100px] w-[100px] rounded-lg"
        />
      </div>
    </div>
  );
};
export default GoogleSearchResultDisplay;
