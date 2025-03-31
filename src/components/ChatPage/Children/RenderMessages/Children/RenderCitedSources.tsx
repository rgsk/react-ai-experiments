import { Label } from "@radix-ui/react-label";
import { useMemo } from "react";
import { messageContentParsers } from "~/lib/messageContentParsers";
import toolCallParser from "~/lib/toolCallParser";
import {
  FetchedWebPage,
  GoogleSearchResult,
  Message,
} from "~/lib/typesJsonData";
import CitedSourceLink from "./CitedSourceLink";

interface RenderCitedSourcesProps {
  sources: string[];
  messages: Message[];
}
const RenderCitedSources: React.FC<RenderCitedSourcesProps> = ({
  sources,
  messages,
}) => {
  const { googleSearchResults, fetchedWebPages } = useMemo(() => {
    let localGoogleSearchResults: GoogleSearchResult[] = [];
    let localFetchedWebPages: { url: string; webPage: FetchedWebPage }[] = [];
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (message.role === "tool" && message.status === "completed") {
        const { toolCall } =
          messageContentParsers.tool({ messages: messages, index: i }) ?? {};
        if (toolCall) {
          if (toolCall.function.name === "googleSearch") {
            const {
              output: { googleSearchResults },
            } = toolCallParser.googleSearch({
              toolCall,
              messageContent: message.content,
            });
            localGoogleSearchResults = [
              ...localGoogleSearchResults,
              ...googleSearchResults,
            ];
          } else if (toolCall.function.name === "getUrlContent") {
            const {
              arguments: { url, type },
              output: { content },
            } = toolCallParser.getUrlContent({
              toolCall,
              messageContent: message.content,
            });

            const page = content as FetchedWebPage;
            localFetchedWebPages.push({ url, webPage: page });
          }
        }
      }
    }
    return {
      googleSearchResults: localGoogleSearchResults,
      fetchedWebPages: localFetchedWebPages,
    };
  }, [messages]);

  return (
    <div>
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
                  <div className="flex gap-2">
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
                  <div className="flex gap-2">
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
