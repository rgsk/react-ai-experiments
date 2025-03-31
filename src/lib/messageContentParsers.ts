import { FileEntry } from "~/components/ChatPage/ChatPage";
import { extractTagContent, recursiveParseJson } from "~/lib/utils";
import { separator } from "./specialMessageParser";
import { Message } from "./typesJsonData";

export const messageContentParsers = {
  image_url: (messageContent: any) => {
    const fileName = messageContent[0].text;
    const url = messageContent[1].image_url.url;
    return { fileName, url };
  },
  image_ocr: (messageContent: any) => {
    const { fileName, url, content } = JSON.parse(messageContent) as {
      fileName: string;
      url: string;
      content: string;
    };
    const { imageModelOutput, imageOCROutput } = content as any;
    return {
      fileName,
      url,
      imageModelOutput,
      imageOCROutput,
    };
  },
  file: (messageContent: any) => {
    const parsedContent = recursiveParseJson(messageContent as string) as {
      fileEntry: FileEntry;
      content: string;
      instruction: string;
      summary: string;
      type: "rag" | "full";
    };
    const fileEntry = parsedContent.fileEntry;
    const fileName = fileEntry.fileMetadata?.name;
    const url = fileEntry.s3Url;
    return { fileEntry, parsedContent, fileName, url };
  },
  assistant: (messageContent: any) => {
    const reasoningContent = extractTagContent(
      messageContent,
      "reasoning_content",
      true
    );
    const restContent = messageContent.includes("</reasoning_content>")
      ? messageContent.slice(
          messageContent.indexOf("</reasoning_content>") +
            "</reasoning_content>".length
        )
      : messageContent;
    const text = restContent;
    const questionSuggestionsResult = extractQuestionSuggestions(text);
    const citedSourcesResult = extractCitedSources(text);
    return {
      reasoningContent,
      questionSuggestionsResult,
      text,
      citedSourcesResult,
    };
  },
  user: (messageContent: any) => {
    return { text: messageContent };
  },
  tool: ({ messages, index }: { messages: Message[]; index: number }) => {
    const message = messages[index];
    if (message.role !== "tool") return undefined;
    const toolCall = messages
      .slice(0, index)
      .reverse()
      .find((m) => m.role === "assistant")
      ?.tool_calls?.find((tc) => tc.id === message.tool_call_id);
    return { toolCall };
  },
};

const extractQuestionSuggestions = (text: string) => {
  let hasQuestionSuggestions = false;
  let questionSuggestions: string[] = [];
  let questionSuggestionsLoading = false;
  const questionsCodeStartIndex = text.indexOf(`<questions>`);
  const questionsCodeEndIndex = text.indexOf(`</questions>`);
  if (questionsCodeStartIndex != -1) {
    hasQuestionSuggestions = true;
    questionSuggestionsLoading = true;
  }
  if (questionsCodeEndIndex !== -1) {
    questionSuggestionsLoading = false;

    questionSuggestions = text
      .slice(
        questionsCodeStartIndex + `<questions>`.length,
        questionsCodeEndIndex
      )
      .split(separator);
  }
  return {
    hasQuestionSuggestions,
    questionSuggestions,
    questionSuggestionsLoading,
  };
};

const extractCitedSources = (text: string) => {
  const citedSourcesTagContent = extractTagContent(text, "cited-sources", true);
  if (!citedSourcesTagContent) return undefined;
  const liRegex = /<li>([^<]+)<\/li>/g;
  const sources: string[] = [];

  let match: RegExpExecArray | null;
  while ((match = liRegex.exec(citedSourcesTagContent)) !== null) {
    sources.push(match[1].trim());
  }
  return { sources };
};
