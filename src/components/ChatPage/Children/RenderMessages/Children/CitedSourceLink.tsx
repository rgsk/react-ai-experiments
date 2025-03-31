import { useMemo } from "react";
import ShowOnHover from "~/components/Shared/ShowOnHover";
import TargetBlankLink from "~/components/Shared/TargetBlankLink";
import { Button } from "~/components/ui/button";
import { GoogleSearchResult } from "~/lib/typesJsonData";
import GoogleSearchResultDisplay from "./GoogleSearchResultDisplay";

interface CitedSourceLinkProps {
  link: string;
  googleSearchResults: GoogleSearchResult[];
}
const CitedSourceLink: React.FC<CitedSourceLinkProps> = ({
  link,
  googleSearchResults,
}) => {
  const searchResult = useMemo(() => {
    return googleSearchResults.find((sr) => sr.link === link);
  }, [googleSearchResults, link]);
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
  return <div>{link}</div>;
};
export default CitedSourceLink;
