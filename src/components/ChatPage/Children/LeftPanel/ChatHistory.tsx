import React, { useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import HistoryBlock from "../History/HistoryBlock/HistoryBlock";

import CentralLoader from "~/components/Shared/CentralLoader";
import useChatHistory from "~/hooks/chat/useChatHistory";
import { getHistoryBlocks } from "../History/HistoryBlock/getHistoryBlocks";
interface ChatHistoryProps {}
const ChatHistory: React.FC<ChatHistoryProps> = ({}) => {
  const { chatHistory, loadMoreChatHistory, refetchChatHistory } =
    useChatHistory();
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
        next={loadMoreChatHistory}
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
