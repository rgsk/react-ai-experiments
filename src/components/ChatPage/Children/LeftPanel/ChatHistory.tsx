import React, { useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { Chat } from "~/lib/typesJsonData";
import HistoryBlock from "../History/HistoryBlock/HistoryBlock";

import { useSearchParams } from "react-router-dom";
import CentralLoader from "~/components/Shared/CentralLoader";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import usePrevious from "~/hooks/usePrevious";
import { uuidPlaceholder } from "~/lib/constants";
import { getHistoryBlocks } from "../History/HistoryBlock/getHistoryBlocks";
const incrementItemsLoaded = 100;
interface ChatHistoryProps {}
const ChatHistory: React.FC<ChatHistoryProps> = ({}) => {
  const [searchParams] = useSearchParams();

  const personaId = searchParams?.get("personaId") ?? undefined;
  const attachPersonaPrefixIfPresent = (key: string) => {
    if (personaId) {
      return `personas/${personaId}/${key}`;
    }
    return key;
  };
  const [historyItemsPerPage, setHistoryItemsPerPage] =
    useState(incrementItemsLoaded);
  const { data: _chatHistory } = useJsonDataKeysLike<Chat>({
    key: attachPersonaPrefixIfPresent(`chats/${uuidPlaceholder}`),
    page: 1,
    perPage: historyItemsPerPage,
  });
  const previousChatHistory = usePrevious(_chatHistory);
  const chatHistory = _chatHistory || previousChatHistory;
  const historyBlocks = useMemo(() => {
    return getHistoryBlocks(chatHistory?.data.map(({ value }) => value) || []);
  }, [chatHistory]);
  if (!chatHistory) return <CentralLoader />;
  return (
    <div
      id="scrollableDiv"
      className="h-full overflow-auto space-y-[20px] px-[16px]"
    >
      <InfiniteScroll
        dataLength={chatHistory.data.length}
        next={() => {
          setHistoryItemsPerPage((prev) => prev + incrementItemsLoaded);
        }}
        hasMore={chatHistory.data.length < chatHistory.count}
        // hasMore={false}
        loader={
          <div className="flex justify-center items-center pb-4">
            <LoadingSpinner />
          </div>
        }
        endMessage={<div>{/* <p>You have seen it all!</p> */}</div>}
        scrollableTarget="scrollableDiv"
        className="space-y-5"
      >
        {historyBlocks.map(([date, items], i) => (
          <HistoryBlock key={i} date={date} chats={items} />
        ))}
      </InfiniteScroll>
    </div>
  );
};
export default ChatHistory;
