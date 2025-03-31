import { FileEntry } from "~/components/ChatPage/ChatPage";
import { extractTagContent, recursiveParseJson } from "~/lib/utils";
import { separator } from "./specialMessageParser";

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
    let hasQuestionSuggestions = false;
    let questionSuggestions: string[] = [];
    let questionSuggestionsLoading = false;
    const text = restContent;
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
      reasoningContent,
      hasQuestionSuggestions,
      questionSuggestions,
      questionSuggestionsLoading,
      text,
    };
  },
};
