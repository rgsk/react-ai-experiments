import NewChatIcon from "~/components/Icons/NewChatIcon";
import { Button } from "~/components/ui/button";
import { SearchDialog } from "../SearchDialog";
import ChatHistory from "./ChatHistory";
interface LeftPanelProps {
  openNewChat: () => void;
  openNewChatLoading: boolean;
}
const LeftPanel: React.FC<LeftPanelProps> = ({
  openNewChat,
  openNewChatLoading,
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
        <ChatHistory />
      </div>
    </div>
  );
};
export default LeftPanel;
