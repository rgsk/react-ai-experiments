import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { ToolCall } from "~/services/experimentsService";

export type ISODateString = string;

export type JsonData<T> = {
  id: string;
  key: string;
  value: T;
  version: string;
  expireAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type Message = ChatCompletionMessageParam & {
  id: string;
  status: "in_progress" | "incomplete" | "completed";
  tool_calls?: ToolCall[];
  type?: "image_url" | "image_ocr" | "file";
};
export type Role = Message["role"];
export type MessageFeedback = {
  id: string;
  type: "like" | "dislike";
  text?: string;
  createdAt: ISODateString;
};
export type Chat = {
  id: string | undefined;
  title: string;
  createdAt: ISODateString;
};
export type UserData = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: ISODateString;
};
export type Memory = {
  id: string;
  statement: string;
  createdAt: ISODateString;
};
export type Conversation = {
  id: string | undefined;
  threadId: string;
  title: string;
  createdAt: ISODateString;
};

export type Persona = {
  id: string;
  name: string;
  collectionName: string;
  description: string;
  instructions: string;
};

interface BasePersonaKnowledgeItem {
  id: string;
  source: string;
  url: string;
  embedded: boolean;
}

export type PersonaKnowledgeItem = BasePersonaKnowledgeItem &
  (
    | {
        type: "website";
        metadata: {};
      }
    | {
        type: "file";
        metadata: {
          filename: string;
          filetype: string;
        };
      }
  );

export type CreditDetails = {
  id: string;
  userEmail: string;
  balance: number;
};
