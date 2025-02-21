import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Conversation } from "~/lib/typesJsonData";
import { cn, encodeQueryParams } from "~/lib/utils";
interface HistoryEntryProps {
  conversation: Conversation;
}

const HistoryEntry: React.FC<HistoryEntryProps> = ({ conversation }) => {
  const location = useLocation();
  const pathname = location.pathname;
  if (!conversation.title) {
    return null;
  }
  return (
    <Link
      to={`${pathname}?${encodeQueryParams({
        threadId: conversation.threadId,
      })}`}
    >
      <div className="px-[6px] py-[8px] overflow-hidden flex items-center relative">
        <span className={cn("text-[14px]")}>{conversation.title}</span>
      </div>
    </Link>
  );
};

export default HistoryEntry;
