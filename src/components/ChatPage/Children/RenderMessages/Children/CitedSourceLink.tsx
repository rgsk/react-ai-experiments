import ShowOnHover from "~/components/Shared/ShowOnHover";
import TargetBlankLink from "~/components/Shared/TargetBlankLink";
import { Button } from "~/components/ui/button";
import useBreakpoints from "~/hooks/useBreakpoints";
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
  const { md } = useBreakpoints();
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
            md,
            <Button variant={show ? "default" : "secondary"}>
              {googleSearchResult.displayLink}
            </Button>
          )
        }
        hiddenElement={conditionallyWrapWithLink(
          !md,
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
            md,
            <Button variant={show ? "default" : "secondary"}>
              {getDomain(fetchedWebPage.url)}
            </Button>
          )
        }
        hiddenElement={conditionallyWrapWithLink(
          !md,
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
