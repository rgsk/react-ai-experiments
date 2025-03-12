import { DocumentText1, Gallery } from "iconsax-react";

export const fileIcons = {
  document: <DocumentText1 size={16} />,
  image: <Gallery size={16} />,
};

export const uuidPlaceholder = "________-____-____-____-____________";
export const openaiIdPlaceholder = "_____________________________";

export const modelsUsed = {
  "deepseek/deepseek-chat": {
    imageSupport: false,
  },
  "openai/gpt-4o": {
    imageSupport: true,
  },
  "openai/gpt-4o-mini": {
    imageSupport: true,
  },
};
