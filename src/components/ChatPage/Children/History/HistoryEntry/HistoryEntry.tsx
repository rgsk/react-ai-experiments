import React from "react";
import { Link, useParams } from "react-router-dom";
import { Chat } from "~/lib/typesJsonData";
import { cn } from "~/lib/utils";
interface HistoryEntryProps {
  chat: Chat;
}

const HistoryEntry: React.FC<HistoryEntryProps> = ({ chat }) => {
  const { id: chatId } = useParams<{ id: string }>();
  if (!chat.title) {
    return null;
  }
  const active = chat.id === chatId;
  return (
    <Link to={`/chat/${chatId}`}>
      <div
        className={cn(
          "px-[8px] py-[8px] overflow-hidden flex items-center relative rounded-lg",
          active && "bg-gray-200 dark:bg-accent",
          "hover:bg-accent dark:hover:bg-accent/70"
        )}
      >
        <span className={cn("text-[14px]")}>{chat.title}</span>
      </div>
    </Link>
  );
};

export default HistoryEntry;
