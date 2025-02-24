import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Conversation } from "~/lib/typesJsonData";
import { cn, encodeQueryParams } from "~/lib/utils";
interface HistoryEntryProps {
  conversation: Conversation;
}

const HistoryEntry: React.FC<HistoryEntryProps> = ({ conversation }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const [searchParams] = useSearchParams();
  const threadId = searchParams?.get("threadId");
  const personaId = searchParams?.get("personaId") ?? undefined;
  if (!conversation.title) {
    return null;
  }

  const active = threadId === conversation.threadId;
  return (
    <Link
      to={`${pathname}?${encodeQueryParams({
        threadId: conversation.threadId,
        personaId,
      })}`}
    >
      <div
        className={cn(
          "px-[8px] py-[8px] overflow-hidden flex items-center relative rounded-lg",
          active && "bg-gray-200 dark:bg-accent",
          "hover:bg-accent dark:hover:bg-accent/70"
        )}
      >
        <span className={cn("text-[14px]")}>{conversation.title}</span>
      </div>
    </Link>
  );
};

export default HistoryEntry;
