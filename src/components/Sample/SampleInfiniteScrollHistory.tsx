import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import usePrevious from "~/hooks/usePrevious";
import { uuidPlaceholder } from "~/lib/constants";
import { Chat } from "~/lib/typesJsonData";
import { LoadingSpinner } from "../Shared/LoadingSpinner";

interface SampleInfiniteScrollHistoryProps {}
const SampleInfiniteScrollHistory: React.FC<
  SampleInfiniteScrollHistoryProps
> = ({}) => {
  const [perPage, setPerPage] = useState(20);
  const { data: _chatHistory, refetch: refetchChatHistory } =
    useJsonDataKeysLike<Chat>({
      key: `chats/${uuidPlaceholder}`,
      page: 1,
      perPage: perPage,
    });

  const previousChatHistory = usePrevious(_chatHistory);
  const chatHistory = _chatHistory || previousChatHistory;
  useEffect(() => {
    console.log({ chatHistory });
  }, [chatHistory]);
  if (!chatHistory) return <LoadingSpinner />;
  return (
    <div>
      <div
        id="scrollableDiv"
        className="h-[300px] overflow-auto border border-red-500"
      >
        <InfiniteScroll
          dataLength={chatHistory.data.length}
          next={() => {
            setPerPage((prev) => prev + 10);
          }}
          hasMore={chatHistory.data.length < chatHistory.count}
          // hasMore={false}
          loader={
            <div className="flex justify-center items-center border border-blue-600 py-3">
              <LoadingSpinner />
            </div>
          }
          endMessage={
            <div className="border border-green-400">
              <p>You have seen it all!</p>
            </div>
          }
          scrollableTarget="scrollableDiv"
          className="space-y-5"
        >
          {chatHistory.data.map((item, index) => (
            <div key={index} className="border border-[#ccc] py-3">
              Item # {index} - {item.value.title}
            </div>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};
export default SampleInfiniteScrollHistory;
