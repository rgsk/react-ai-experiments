import TargetBlankLink from "~/components/Shared/TargetBlankLink";
import { GoogleSearchResult, WebsiteMeta } from "~/lib/typesJsonData";
import FetchedWebPageDisplay from "./FetchedWebPageDisplay";
import GoogleSearchResultDisplay from "./GoogleSearchResultDisplay";

interface RenderMentionedUrlsProps {
  urls: string[];
  googleSearchResults: GoogleSearchResult[];
  fetchedWebPages: WebsiteMeta[];
}
const RenderMentionedUrls: React.FC<RenderMentionedUrlsProps> = ({
  urls,
  fetchedWebPages,
  googleSearchResults,
}) => {
  return (
    <div className="w-[400px] space-y-4">
      {urls.map((url, i) => {
        const matchedWebPage = fetchedWebPages.find((sr) => sr.url === url);
        const matchedSearchResult = googleSearchResults.find(
          (sr) => sr.link === url
        );
        return (
          <div key={url + i}>
            <TargetBlankLink href={url}>
              {matchedWebPage ? (
                <FetchedWebPageDisplay
                  websiteMeta={matchedWebPage}
                  type="cited-source"
                />
              ) : matchedSearchResult ? (
                <GoogleSearchResultDisplay
                  googleSearchResult={matchedSearchResult}
                  type="cited-source"
                />
              ) : null}
            </TargetBlankLink>
          </div>
        );
      })}
    </div>
  );
};
export default RenderMentionedUrls;
