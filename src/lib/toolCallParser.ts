import { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";
import { GoogleSearchResult, UrlContentType } from "./typesJsonData";
import { recursiveParseJson } from "./utils";

const toolCallParser = {
  googleSearch: ({
    toolCall,
    messageContent,
  }: {
    toolCall: ChatCompletionMessageToolCall;
    messageContent: any;
  }) => {
    const args = toolCall.function.arguments as any;
    const query: string = args.query;
    const googleSearchResults = recursiveParseJson(messageContent).content[0]
      .text as GoogleSearchResult[];
    return { arguments: { query }, output: { googleSearchResults } };
  },
  getUrlContent: ({
    toolCall,
    messageContent,
  }: {
    toolCall: ChatCompletionMessageToolCall;
    messageContent: any;
  }) => {
    const args = toolCall.function.arguments as any;
    const url: string = args.url;
    const type: UrlContentType | undefined = args.type;
    const finalArguments = { url, type };
    const firstItemText = recursiveParseJson(messageContent).content[0].text;
    return { arguments: finalArguments, output: { content: firstItemText } };
  },
};
export default toolCallParser;
