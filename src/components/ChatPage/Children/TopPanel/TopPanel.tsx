import {
  Check,
  Download,
  Home,
  PanelLeft,
  PanelRight,
  Share,
} from "lucide-react";
import { Link } from "react-router-dom";
import NewChatIcon from "~/components/Icons/NewChatIcon";
import { ModeToggle } from "~/components/Shared/ModeToggle";
import { Button } from "~/components/ui/button";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import { SetSharedState } from "~/hooks/useJsonData";
import { Chat } from "~/lib/typesJsonData";

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
  const { copy, copied } = useCopyToClipboard();

  return (
    <div className="border-b border-b-input p-4 flex justify-between items-center">
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
        <Link to="/">
          <Button variant="outline" size="icon">
            <Home />
          </Button>
        </Link>
      </span>
      <span>{chat?.title || "New Chat"}</span>
      <span className="flex gap-2">
        <Button
          variant="outline"
          onClick={async () => {
            const sharedChatLink = await shareChat();
            if (sharedChatLink) {
              copy(sharedChatLink);
            }
          }}
          size="icon"
        >
          {copied ? <Check /> : <Share />}
        </Button>
        <Button variant="outline" onClick={exportChat} size="icon">
          <Download />
        </Button>
        <ModeToggle />

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
