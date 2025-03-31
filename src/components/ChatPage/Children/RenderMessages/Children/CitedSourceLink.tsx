import { useMemo } from "react";
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
      <div>
        <GoogleSearchResultDisplay googleSearchResult={searchResult} />
      </div>
    );
  }
  return <div>{link}</div>;
};
export default CitedSourceLink;
