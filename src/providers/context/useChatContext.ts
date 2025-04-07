// context/ChatContext.tsx

import { createContext, useContext } from "react";
import useChatHistory from "~/components/ChatPage/hooks/useChatHistory";

export const useChatContextValue = () => {
  const { chatHistory, loadMoreChatHistory, refetchChatHistory } =
    useChatHistory();
  return { chatHistory, loadMoreChatHistory, refetchChatHistory };
};

export const ChatContext = createContext<ReturnType<
  typeof useChatContextValue
> | null>(null);

const useChatContext = () => {
  const value = useContext(ChatContext)!;
  return value;
};
export default useChatContext;
