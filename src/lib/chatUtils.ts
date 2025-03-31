import { Chat, Message, SharedChat, SharedPreview } from "./typesJsonData";

import { v4 } from "uuid";
import { memoizeFn } from "~/lib/utils";
import jsonDataService from "~/services/jsonDataService";
import { messageContentParsers } from "./messageContentParsers";

export function createMarkdownContent(messages: Message[]): string {
  let markdownContent = "# Chat Export\n\n";
  messages.forEach((message) => {
    const role = message.role.charAt(0).toUpperCase() + message.role.slice(1);
    if (message.role === "user" || message.role === "assistant") {
      if (
        !(
          typeof message.content === "string" &&
          message.content.startsWith("calling tools - ")
        )
      ) {
        markdownContent += `## ${role}\n\n`;
        if (message.type === "image_url") {
          const { fileName, url } = messageContentParsers.image_url(
            message.content
          );
          markdownContent += `<img src="${url}" alt="${fileName}" width="500"/>`;
        } else if (message.type === "file") {
          const { fileName, url } = messageContentParsers.file(message.content);
          markdownContent += `[📄 ${fileName}](${url})`;
        } else if (message.type === "image_ocr") {
          const { fileName, url } = messageContentParsers.image_ocr(
            message.content
          );
          markdownContent += `<img src="${url}" alt="${fileName}" width="500"/>`;
        } else {
          markdownContent += `${message.content}`;
        }
        markdownContent += `\n\n`;
      }
    }
  });
  return markdownContent;
}

export const getSharedChatLink = memoizeFn(
  async ({ messages, chat }: { messages: Message[]; chat: Chat }) => {
    const sharedChatId = v4();
    const key = `admin/public/sharedChats/${sharedChatId}`;
    const sharedChat = await jsonDataService.setKey<SharedChat>({
      key,
      value: {
        id: sharedChatId,
        chat,
        messages,
        createdAt: new Date().toISOString(),
      },
    });
    const link = `${window.location.origin}/shared-chat/${sharedChatId}`;
    return link;
  }
);

export const getSharedPreviewLink = memoizeFn(
  async ({ language, code }: { language: string; code: string }) => {
    const sharedPreviewId = v4();
    const key = `admin/public/sharedPreviews/${sharedPreviewId}`;
    await jsonDataService.setKey<SharedPreview>({
      key,
      value: {
        id: sharedPreviewId,
        code: code,
        language: language,
        createdAt: new Date().toISOString(),
      },
    });
    const link = `${window.location.origin}/shared-preview/${sharedPreviewId}`;
    return link;
  }
);
