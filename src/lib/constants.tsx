import { DocumentText1, Gallery } from "iconsax-react";

export const fileIcons = {
  document: <DocumentText1 size={16} />,
  image: <Gallery size={16} />,
};

export const uuidPlaceholder = "________-____-____-____-____________";
export const openaiIdPlaceholder = "_____________________________";
export const defaultModel = "openai/gpt-4o";
export type Model =
  | "deepseek/deepseek-chat"
  | "deepseek/deepseek-reasoner"
  | "openai/gpt-4o"
  | "openai/gpt-4o-mini";
export const modelOptions: Record<
  Model,
  {
    toolsSupport: boolean;
    imageSupport: boolean;
    successiveMessagesSupport: boolean;
  }
> = {
  "deepseek/deepseek-chat": {
    toolsSupport: true,
    imageSupport: false,
    successiveMessagesSupport: true,
  },
  "deepseek/deepseek-reasoner": {
    toolsSupport: false,
    imageSupport: false,
    successiveMessagesSupport: false,
  },
  "openai/gpt-4o": {
    toolsSupport: true,
    imageSupport: true,
    successiveMessagesSupport: true,
  },
  "openai/gpt-4o-mini": {
    toolsSupport: true,
    imageSupport: true,
    successiveMessagesSupport: true,
  },
};
