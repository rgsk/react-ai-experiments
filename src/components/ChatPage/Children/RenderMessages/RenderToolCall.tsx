import { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";
import CollapsibleWrapper from "~/components/Shared/CollapsibleWrapper";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { Separator } from "~/components/ui/separator";
import { Message } from "~/lib/typesJsonData";
import { recursiveParseJson } from "~/lib/utils";
import SyntaxHighlighter from "../SyntaxHighlighter";

interface RenderToolCallProps {
  toolCall: ChatCompletionMessageToolCall;
  message: Message;
}
const RenderToolCall: React.FC<RenderToolCallProps> = ({
  toolCall,
  message,
}) => {
  const renderFunction = () => {
    return (
      <div className="pl-4">
        <p className="whitespace-pre-wrap">
          {JSON.stringify(toolCall, null, 4)}
        </p>
      </div>
    );
  };
  const renderOutput = () => {
    let parsedJsonContent = undefined;
    try {
      parsedJsonContent = recursiveParseJson(message.content as any);
    } catch (err) {}
    return (
      <div className="pl-4">
        <div className="my-4">
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
            heading={`Function`}
            loading={message.status === "in_progress"}
          >
            {renderFunction()}
          </CollapsibleWrapper>
        </div>

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
