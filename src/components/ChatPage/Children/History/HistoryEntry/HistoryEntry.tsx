import React, { useEffect, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import useGlobalContext from "~/hooks/useGlobalContext";
import { Chat } from "~/lib/typesJsonData";
import { cn } from "~/lib/utils";
interface HistoryEntryProps {
  chat: Chat;
}

const HistoryEntry: React.FC<HistoryEntryProps> = ({ chat }) => {
  const { id: chatId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const personaId = searchParams?.get("personaId") ?? undefined;
  const active = chat.id === chatId;

  const entryRef = useRef<HTMLDivElement>(null);
  const { isFirstHistoryRender, setIsFirstHistoryRender } = useGlobalContext();
  useEffect(() => {
    if (active && entryRef.current && isFirstHistoryRender) {
      setIsFirstHistoryRender(false);
      entryRef.current.scrollIntoView({ behavior: "instant", block: "center" });
    }
  }, [active, isFirstHistoryRender, setIsFirstHistoryRender]);
  if (!chat.title) {
    return null;
  }
  return (
    <Link
      to={
        personaId
          ? `/chat/${chat.id}?personaId=${personaId}`
          : `/chat/${chat.id}`
      }
    >
      <div
        ref={entryRef}
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
