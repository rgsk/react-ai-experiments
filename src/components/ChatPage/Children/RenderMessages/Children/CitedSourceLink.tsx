import { useMemo } from "react";
import ShowOnHover from "~/components/Shared/ShowOnHover";
import TargetBlankLink from "~/components/Shared/TargetBlankLink";
import { Button } from "~/components/ui/button";
import { FetchedWebPage, GoogleSearchResult } from "~/lib/typesJsonData";
import { getDomain } from "~/lib/utils";
import FetchedWebPageDisplay from "./FetchedWebPageDisplay";
import GoogleSearchResultDisplay from "./GoogleSearchResultDisplay";

interface CitedSourceLinkProps {
  link: string;
  googleSearchResults: GoogleSearchResult[];
  fetchedWebPages: {
    url: string;
    webPage: FetchedWebPage;
  }[];
}
const CitedSourceLink: React.FC<CitedSourceLinkProps> = ({
  link,
  googleSearchResults,
  fetchedWebPages,
}) => {
  const searchResult = useMemo(() => {
    return googleSearchResults.find((sr) => sr.link === link);
  }, [googleSearchResults, link]);
  const webPage = useMemo(() => {
    return fetchedWebPages.find((p) => p.url === link);
  }, [fetchedWebPages, link]);
  if (searchResult) {
    return (
      <TargetBlankLink href={link}>
        <ShowOnHover
          getMainElement={(hovered) => (
            <Button variant={hovered ? "default" : "secondary"}>
              {searchResult.displayLink}
            </Button>
          )}
          hiddenElement={
            <GoogleSearchResultDisplay
              googleSearchResult={searchResult}
              type="cited-source"
            />
          }
        />
      </TargetBlankLink>
    );
  }
  if (webPage) {
    return (
      <TargetBlankLink href={link}>
        <ShowOnHover
          getMainElement={(hovered) => (
            <Button variant={hovered ? "default" : "secondary"}>
              {getDomain(webPage.url)}
            </Button>
          )}
          hiddenElement={
            <FetchedWebPageDisplay
              fetchedWebPage={webPage.webPage}
              url={webPage.url}
              type="cited-source"
            />
          }
        />
      </TargetBlankLink>
    );
  }

  return <div>{link}</div>;
};
export default CitedSourceLink;
