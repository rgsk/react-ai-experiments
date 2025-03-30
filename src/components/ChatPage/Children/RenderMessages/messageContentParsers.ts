import { recursiveParseJson } from "~/lib/utils";
import { FileEntry } from "../../ChatPage";

const messageContentParsers = {
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
};

export default messageContentParsers;
