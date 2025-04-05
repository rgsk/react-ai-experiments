import { Download, Menu, PanelLeft, PanelRight, Share } from "lucide-react";
import NewChatIcon from "~/components/Icons/NewChatIcon";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SetSharedState } from "~/hooks/useJsonData";
import { Chat } from "~/lib/typesJsonData";
interface TopPanelProps {
  setLeftPanelOpen: SetSharedState<boolean>;
  setRightPanelOpen: SetSharedState<boolean>;
  openNewChat: () => void;
  openNewChatLoading: boolean;
  chat?: Chat;
  exportChat: () => void;
  shareChat: () => void;
}
const TopPanel: React.FC<TopPanelProps> = ({
  setLeftPanelOpen,
  setRightPanelOpen,
  openNewChat,
  openNewChatLoading,
  exportChat,
  shareChat,
  chat,
}) => {
  return (
    <div className="border-b border-b-input p-4 flex justify-between items-center gap-3">
      <span className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setLeftPanelOpen((prev) => !prev);
          }}
        >
          <PanelLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={openNewChatLoading}
          onClick={() => {
            openNewChat();
          }}
        >
          <NewChatIcon />
        </Button>
      </span>
      <span className="text-center line-clamp-1">
        {chat?.title || "New Chat"}
      </span>
      <span className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent avoidCollisions align="end" side="bottom">
            <DropdownMenuItem onClick={shareChat}>
              <Share />
              <span>Share Chat</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportChat}>
              <Download />
              <span>Export Chat</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setRightPanelOpen((prev) => !prev);
          }}
        >
          <PanelRight />
        </Button>
      </span>
    </div>
  );
};
export default TopPanel;
