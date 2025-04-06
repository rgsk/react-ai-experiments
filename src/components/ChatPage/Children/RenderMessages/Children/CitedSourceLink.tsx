import { isMobile } from "react-device-detect";
import ShowOnHover from "~/components/Shared/ShowOnHover";
import TargetBlankLink from "~/components/Shared/TargetBlankLink";
import { Button } from "~/components/ui/button";
import { GoogleSearchResult, WebsiteMeta } from "~/lib/typesJsonData";
import { getDomain } from "~/lib/utils";
import FetchedWebPageDisplay from "./FetchedWebPageDisplay";
import GoogleSearchResultDisplay from "./GoogleSearchResultDisplay";

interface CitedSourceLinkProps {
  link: string;
  googleSearchResult?: GoogleSearchResult;
  fetchedWebPage?: WebsiteMeta;
}
const CitedSourceLink: React.FC<CitedSourceLinkProps> = ({
  link,
  googleSearchResult,
  fetchedWebPage,
}) => {
  const conditionallyWrapWithLink = (condition: boolean, children: any) => {
    if (condition) {
      return <TargetBlankLink href={link}>{children}</TargetBlankLink>;
    }
    return children;
  };
  if (googleSearchResult) {
    return (
      <ShowOnHover
        getMainElement={(show) =>
          conditionallyWrapWithLink(
            !isMobile,
            <Button variant={show ? "default" : "secondary"}>
              {googleSearchResult.displayLink}
            </Button>
          )
        }
        hiddenElement={conditionallyWrapWithLink(
          isMobile,
          <GoogleSearchResultDisplay
            googleSearchResult={googleSearchResult}
            type="cited-source"
          />
        )}
      />
    );
  }
  if (fetchedWebPage) {
    return (
      <ShowOnHover
        getMainElement={(show) =>
          conditionallyWrapWithLink(
            !isMobile,
            <Button variant={show ? "default" : "secondary"}>
              {getDomain(fetchedWebPage.url)}
            </Button>
          )
        }
        hiddenElement={conditionallyWrapWithLink(
          isMobile,
          <FetchedWebPageDisplay
            websiteMeta={fetchedWebPage}
            type="cited-source"
          />
        )}
      />
    );
  }

  return <div>{link} (!!unknown source!!)</div>;
};
export default CitedSourceLink;
