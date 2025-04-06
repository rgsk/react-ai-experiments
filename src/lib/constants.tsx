export const uuidPlaceholder = "________-____-____-____-____________";
export const openaiIdPlaceholder = "_____________________________";
export const defaultModel = "openai/gpt-4o";
export type Model =
  | "deepseek/deepseek-chat"
  | "deepseek/deepseek-reasoner"
  | "openai/gpt-4o"
  | "openai/gpt-4o-mini"
  | "openrouter/google/gemma-3-27b-it:free";
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
  "openrouter/google/gemma-3-27b-it:free": {
    toolsSupport: false,
    imageSupport: false,
    successiveMessagesSupport: true,
  },
};
