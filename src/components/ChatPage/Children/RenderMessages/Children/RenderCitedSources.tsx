import { Label } from "@radix-ui/react-label";
import { GoogleSearchResult, WebsiteMeta } from "~/lib/typesJsonData";
import CitedSourceLink from "./CitedSourceLink";

interface RenderCitedSourcesProps {
  sources: string[];
  googleSearchResults: GoogleSearchResult[];
  fetchedWebPages: WebsiteMeta[];
}
const RenderCitedSources: React.FC<RenderCitedSourcesProps> = ({
  sources,
  googleSearchResults,
  fetchedWebPages,
}) => {
  return (
    <div className="space-y-4">
      {(() => {
        const matchedSearchResults = sources
          .map((link, i) => {
            return googleSearchResults.find((sr) => sr.link === link);
          })
          .filter(Boolean);
        return (
          <>
            {matchedSearchResults.length > 0 ? (
              <>
                <div>
                  <Label>Search Results:</Label>
                  <div className="h-1"></div>
                  <div className="flex gap-2 flex-wrap">
                    {matchedSearchResults.map((sr, i) => {
                      const searchResult = sr!;
                      return (
                        <CitedSourceLink
                          key={`${i}`}
                          link={searchResult.link}
                          googleSearchResult={searchResult}
                        ></CitedSourceLink>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}
          </>
        );
      })()}

      {(() => {
        const matchedWebPages = sources
          .map((link, i) => {
            return fetchedWebPages.find((sr) => sr.url === link);
          })
          .filter(Boolean);
        return (
          <>
            {matchedWebPages.length > 0 ? (
              <>
                <div>
                  <Label>Web Pages:</Label>
                  <div className="h-1"></div>
                  <div className="flex gap-2 flex-wrap">
                    {matchedWebPages.map((sr, i) => {
                      const matchedWebPage = sr!;
                      return (
                        <CitedSourceLink
                          key={`${i}`}
                          link={matchedWebPage.url}
                          fetchedWebPage={matchedWebPage}
                        ></CitedSourceLink>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}
          </>
        );
      })()}
    </div>
  );
};
export default RenderCitedSources;
