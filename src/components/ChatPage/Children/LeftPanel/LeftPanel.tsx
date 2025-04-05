import authService from "~/lib/authService";

import NewChatIcon from "~/components/Icons/NewChatIcon";
import ProfileInfo from "~/components/ProfileInfo/ProfileInfo";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Chat } from "~/lib/typesJsonData";
import HistoryBlock from "../History/HistoryBlock/HistoryBlock";
import { SearchDialog } from "../SearchDialog";
interface LeftPanelProps {
  openNewChat: () => void;
  openNewChatLoading: boolean;
  historyBlocks: [string, Chat[]][];
}
const LeftPanel: React.FC<LeftPanelProps> = ({
  openNewChat,
  openNewChatLoading,
  historyBlocks,
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
      <div className="flex-1 overflow-auto space-y-[20px] px-[16px]">
        {historyBlocks.map(([date, items], i) => (
          <HistoryBlock key={i} date={date} chats={items} />
        ))}
      </div>
      <div className="p-[16px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span>
              <ProfileInfo />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent avoidCollisions align="start" side="top">
            <DropdownMenuItem onClick={authService.logout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
export default LeftPanel;
