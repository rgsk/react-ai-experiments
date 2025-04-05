import { Download, Menu, PanelLeft, PanelRight, Share, X } from "lucide-react";
import { useState } from "react";
import NewChatIcon from "~/components/Icons/NewChatIcon";
import DialogWrapper from "~/components/Shared/DialogWrapper";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import useBreakpoints from "~/hooks/useBreakpoints";
import { SetSharedState } from "~/hooks/useJsonData";
import { useWindowSize } from "~/hooks/useWindowSize";
import { Chat } from "~/lib/typesJsonData";
import ShareChatPreview from "../ShareChatPreview";
interface TopPanelProps {
  setLeftPanelOpen: SetSharedState<boolean>;
  setRightPanelOpen: SetSharedState<boolean>;
  openNewChat: () => void;
  openNewChatLoading: boolean;
  chat?: Chat;
  exportChat: () => void;
  shareChat: () => Promise<string | undefined>;
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
  const [shareChatLoading, setShareChatLoading] = useState(false);
  const [sharedChatId, setSharedChatId] = useState<string>();
  const windowSize = useWindowSize();
  const { md } = useBreakpoints();
  return (
    <div className="border-b border-b-input p-4 flex justify-between items-center gap-3">
      <DialogWrapper
        open={!!sharedChatId}
        onClose={() => {
          setSharedChatId(undefined);
        }}
      >
        <div
          style={{ height: md ? windowSize.height / 2 : windowSize.height }}
          className="flex flex-col"
        >
          <div className="p-4 border-b border-b-input flex justify-between items-center">
            <span>Share public link to chat</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setSharedChatId(undefined);
              }}
            >
              <X />
            </Button>
          </div>
          {sharedChatId && <ShareChatPreview sharedChatId={sharedChatId} />}
        </div>
      </DialogWrapper>
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
            <DropdownMenuItem
              onClick={async () => {
                setShareChatLoading(true);
                const id = await shareChat();
                if (id) {
                  setSharedChatId(id);
                }
                setShareChatLoading(false);
              }}
            >
              {shareChatLoading ? <LoadingSpinner /> : <Share />}
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
