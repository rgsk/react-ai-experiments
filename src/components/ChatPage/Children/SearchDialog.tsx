"use client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import experimentsService from "~/services/experimentsService";
import { Input } from "../../ui/input";

import { format } from "date-fns";
import { Messages2 } from "iconsax-react";
import { Search } from "lucide-react";
import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import useDebounce from "~/hooks/useDebounce";
import { Chat } from "~/lib/typesJsonData";

export function SearchDialog() {
  const [searchParams] = useSearchParams();

  const [open, setOpen] = React.useState(false);
  const [_searchQuery, setSearchQuery] = React.useState("");
  const searchQuery = useDebounce(_searchQuery, 500);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const personaId = searchParams?.get("personaId") ?? undefined;
  const navigate = useNavigate();

  const searchMessagesQuery = useMemo(
    () => experimentsService.searchMessages({ q: searchQuery }),
    [searchQuery]
  );

  const searchMessagesQueryResult = useQuery({
    queryKey: searchMessagesQuery.key,
    queryFn: searchMessagesQuery.fn,
    enabled: !!searchQuery,
  });
  const messagesJsonDataEntries =
    searchMessagesQueryResult.data?.messagesJsonDataEntries ?? [];
  const chatJsonDataEntries = useMemo(
    () => searchMessagesQueryResult.data?.chatJsonDataEntries ?? [],
    [searchMessagesQueryResult.data?.chatJsonDataEntries]
  );
  const idToChat = useMemo(() => {
    const result: Record<string, Chat> = chatJsonDataEntries.reduce(
      (acc, c) => {
        acc[c.value.id!] = c.value;
        return acc;
      },
      {} as any
    );
    return result;
  }, [chatJsonDataEntries]);

  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="" variant="outline" size="icon">
          <Search />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[650px] p-0 gap-0 bg-white dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700">
        <div className="flex items-center border-b border-gray-300 dark:border-gray-700 px-4 py-2">
          <Search className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
          <Input
            ref={inputRef}
            value={_searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="border-0 pr-10 shadow-none outline-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <div className="h-[360px] overflow-y-auto">
          {messagesJsonDataEntries.length > 0 ? (
            <>
              {messagesJsonDataEntries.map((d) => {
                const messages = d.value;
                const matchingMessage = messages.find(
                  (m) =>
                    ["user", "assistant"].includes(m.role) &&
                    typeof m.content === "string" &&
                    m.content.toLowerCase().includes(searchQuery.toLowerCase())
                );

                let content = matchingMessage?.content as string | undefined;
                let snippet = "";
                if (content) {
                  const index = content
                    .toLowerCase()
                    .indexOf(searchQuery.toLowerCase());

                  if (index !== -1) {
                    const beforeMatch = content.substring(0, index);
                    const match = content.substring(
                      index,
                      index + searchQuery.length
                    );
                    const afterMatch = content.substring(
                      index + searchQuery.length
                    );
                    content = `${beforeMatch}<b>${match}</b>${afterMatch}`;
                  }
                  const snippetLength = 30; // Adjust this to control snippet size

                  snippet = content;
                  if (index !== -1) {
                    const start = Math.max(0, index - snippetLength / 2);

                    snippet = (start > 0 ? "..." : "") + content.slice(start);
                  }
                }

                const match = d.key.match(/\/chats\/([^/]+)\/messages/);

                const chatId = match![1];
                const chat = idToChat[chatId];
                return (
                  <div key={d.id}>
                    <div
                      className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex justify-between items-center gap-2"
                      onClick={() => {
                        setOpen(false);

                        if (personaId) {
                          if (matchingMessage) {
                            navigate(
                              `/chat/${chatId}?personaId=${personaId}#message-${matchingMessage.id}`
                            );
                          } else {
                            navigate(`/chat/${chatId}?personaId=${personaId}`);
                          }
                        } else {
                          if (matchingMessage) {
                            navigate(
                              `/chat/${chatId}#message-${matchingMessage.id}`
                            );
                          } else {
                            navigate(`/chat/${chatId}`);
                          }
                        }
                      }}
                    >
                      <Messages2 className="min-w-[16px] w-[16px] text-gray-600 dark:text-gray-400" />
                      <div className="flex flex-col">
                        <h4 className="text-sm font-medium">{chat?.title}</h4>
                        <p
                          className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1"
                          dangerouslySetInnerHTML={{ __html: snippet }}
                        ></p>
                      </div>
                      <div className="flex-1"></div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {format(chat?.createdAt ?? new Date(), "dd/MM/yy")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          ) : searchQuery ? (
            <>
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No results found for "{searchQuery}"
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
