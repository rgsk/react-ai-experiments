import { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";
import CollapsibleWrapper from "~/components/Shared/CollapsibleWrapper";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import TargetBlankLink from "~/components/Shared/TargetBlankLink";
import { Separator } from "~/components/ui/separator";
import { GoogleSearchResult, Message } from "~/lib/typesJsonData";
import { recursiveParseJson } from "~/lib/utils";
import SyntaxHighlighter from "../SyntaxHighlighter";
import GoogleSearchResultDisplay from "./Children/GoogleSearchResultDisplay";

interface RenderToolCallProps {
  toolCall: ChatCompletionMessageToolCall;
  message: Message;
  scrollContainerRef?: React.MutableRefObject<HTMLDivElement | null>;
}
const RenderToolCall: React.FC<RenderToolCallProps> = ({
  toolCall,
  message,
  scrollContainerRef,
}) => {
  let parsedJsonContent = undefined;
  try {
    parsedJsonContent = recursiveParseJson(message.content as any);
  } catch (err) {}
  const renderFunction = () => {
    return (
      <div className="pl-4">
        <div className="mb-4">
          <p>Function:</p>
        </div>
        <p className="whitespace-pre-wrap">
          {JSON.stringify(toolCall, null, 4)}
        </p>
      </div>
    );
  };
  const renderOutput = () => {
    return (
      <div className="pl-4">
        <div className="mb-4">
          <p>Output:</p>
        </div>
        {message.status === "in_progress" ? (
          <LoadingSpinner size={20} />
        ) : (
          <p className="whitespace-pre-wrap">
            {JSON.stringify(parsedJsonContent, null, 4)}
          </p>
        )}
      </div>
    );
  };
  const renderSeparator = () => {
    return <Separator className="my-4 h-[2px]" />;
  };
  if (toolCall.function.name === "executeCode") {
    const { code, language } = toolCall.function.arguments as any;
    return (
      <>
        <div className="pl-4">
          <CollapsibleWrapper
            scrollContainerRef={scrollContainerRef}
            level={2}
            heading={`Function`}
            loading={message.status === "in_progress"}
          >
            {renderFunction()}
          </CollapsibleWrapper>
        </div>
        {renderSeparator()}
        {renderOutput()}
        {renderSeparator()}
        <div className="pl-4">
          <div className="my-4">
            <p>Code:</p>
          </div>
          <SyntaxHighlighter
            loading={false}
            code={code}
            language={language}
            codeProps={{}}
            isCodeOutput={false}
          />
        </div>
      </>
    );
  } else if (toolCall.function.name === "googleSearch") {
    const { query } = toolCall.function.arguments as any;

    const entries = parsedJsonContent.content[0].text as GoogleSearchResult[];
    return (
      <>
        <div className="pl-4">
          <CollapsibleWrapper
            scrollContainerRef={scrollContainerRef}
            heading={`Function`}
            loading={message.status === "in_progress"}
            level={2}
          >
            {renderFunction()}
          </CollapsibleWrapper>
        </div>
        {renderSeparator()}
        <div className="pl-4">
          <CollapsibleWrapper
            scrollContainerRef={scrollContainerRef}
            heading={`Output`}
            loading={message.status === "in_progress"}
            level={2}
          >
            {renderOutput()}
          </CollapsibleWrapper>
        </div>
        {renderSeparator()}
        <div className="pl-4">
          <div className="my-4">
            <p>Query: {query}</p>
          </div>
          <div className="my-4">
            <p>Results:</p>
          </div>
          <div className="flex flex-col">
            {entries.map((entry) => (
              <TargetBlankLink href={entry.link} key={entry.title}>
                <GoogleSearchResultDisplay
                  googleSearchResult={entry}
                  type="tool-call"
                />
              </TargetBlankLink>
            ))}
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      {renderFunction()}
      {renderSeparator()}
      {renderOutput()}
    </>
  );
};
export default RenderToolCall;
