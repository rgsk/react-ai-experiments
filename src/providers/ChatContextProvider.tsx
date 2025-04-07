import {
  ChatContext,
  useChatContextValue,
} from "~/providers/context/useChatContext";

interface IChatContextProviderProps {
  children: any;
}
export const ChatContextProvider: React.FC<IChatContextProviderProps> = ({
  children,
}) => {
  const value = useChatContextValue();
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
