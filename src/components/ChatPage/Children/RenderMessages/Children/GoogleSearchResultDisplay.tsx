import useBreakpoints from "~/hooks/useBreakpoints";
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
  const { md } = useBreakpoints();
  return (
    <div
      className={cn(
        "flex gap-[20px] group hover:bg-muted p-3",
        type === "cited-source" && "bg-muted rounded-lg"
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
        <div className="flex items-start gap-2 mt-3 md:mt-0">
          <p className="text-sm">{googleSearchResult.snippet}</p>
          {!md && (
            <>
              <img
                src={googleSearchResult.image}
                className="max-w-[75px] w-[75px] rounded-sm"
              />
            </>
          )}
        </div>
      </div>
      {md && (
        <>
          <div className="flex-1"></div>
          <div>
            <img
              src={googleSearchResult.image}
              className="max-w-[92px] w-[92px] rounded-lg"
            />
          </div>
        </>
      )}
    </div>
  );
};
export default GoogleSearchResultDisplay;
