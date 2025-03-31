import { GoogleSearchResult } from "~/lib/typesJsonData";

interface GoogleSearchResultDisplayProps {
  googleSearchResult: GoogleSearchResult;
}
const GoogleSearchResultDisplay: React.FC<GoogleSearchResultDisplayProps> = ({
  googleSearchResult,
}) => {
  return (
    <div className="flex gap-[20px] group hover:bg-muted rounded-lg p-3">
      <div>
        <div className="flex gap-3">
          <img
            src={`https://www.google.com/s2/favicons?domain=${googleSearchResult.displayLink}&sz=64`}
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
