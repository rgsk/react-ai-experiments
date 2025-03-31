import ShowOnHover from "~/components/Shared/ShowOnHover";
import TargetBlankLink from "~/components/Shared/TargetBlankLink";
import { Button } from "~/components/ui/button";
import { FetchedWebPage, GoogleSearchResult } from "~/lib/typesJsonData";
import { getDomain } from "~/lib/utils";
import FetchedWebPageDisplay from "./FetchedWebPageDisplay";
import GoogleSearchResultDisplay from "./GoogleSearchResultDisplay";

interface CitedSourceLinkProps {
  link: string;
  googleSearchResult?: GoogleSearchResult;
  fetchedWebPage?: {
    url: string;
    webPage: FetchedWebPage;
  };
}
const CitedSourceLink: React.FC<CitedSourceLinkProps> = ({
  link,
  googleSearchResult,
  fetchedWebPage,
}) => {
  if (googleSearchResult) {
    return (
      <TargetBlankLink href={link}>
        <ShowOnHover
          getMainElement={(hovered) => (
            <Button variant={hovered ? "default" : "secondary"}>
              {googleSearchResult.displayLink}
            </Button>
          )}
          hiddenElement={
            <GoogleSearchResultDisplay
              googleSearchResult={googleSearchResult}
              type="cited-source"
            />
          }
        />
      </TargetBlankLink>
    );
  }
  if (fetchedWebPage) {
    return (
      <TargetBlankLink href={link}>
        <ShowOnHover
          getMainElement={(hovered) => (
            <Button variant={hovered ? "default" : "secondary"}>
              {getDomain(fetchedWebPage.url)}
            </Button>
          )}
          hiddenElement={
            <FetchedWebPageDisplay
              fetchedWebPage={fetchedWebPage.webPage}
              url={fetchedWebPage.url}
              type="cited-source"
            />
          }
        />
      </TargetBlankLink>
    );
  }

  return <div>{link} (!!unknown source!!)</div>;
};
export default CitedSourceLink;
