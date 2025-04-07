import NewChatIcon from "~/components/Icons/NewChatIcon";
import { Button } from "~/components/ui/button";
import useChatHistory from "~/hooks/chat/useChatHistory";
import { SearchDialog } from "../SearchDialog";
import ChatHistory from "./ChatHistory";
interface LeftPanelProps {
  openNewChat: () => void;
  openNewChatLoading: boolean;
  chatHistoryProps: ReturnType<typeof useChatHistory>;
}
const LeftPanel: React.FC<LeftPanelProps> = ({
  openNewChat,
  openNewChatLoading,
  chatHistoryProps,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-[16px] flex justify-between items-center">
        <Button
          onClick={() => {
            openNewChat();
          }}
          disabled={openNewChatLoading}
        >
          <NewChatIcon />
          <span>New Chat</span>
        </Button>
        <SearchDialog />
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatHistory chatHistoryProps={chatHistoryProps} />
      </div>
    </div>
  );
};
export default LeftPanel;
