import React, { useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { Chat } from "~/lib/typesJsonData";
import HistoryBlock from "../History/HistoryBlock/HistoryBlock";

import { useParams } from "react-router-dom";
import CentralLoader from "~/components/Shared/CentralLoader";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import usePrevious from "~/hooks/usePrevious";
import { uuidPlaceholder } from "~/lib/constants";
import jsonDataService from "~/services/jsonDataService";
import usePrefixChatRelatedKey from "../../hooks/usePrefixChatRelatedKey";
import { getHistoryBlocks } from "../History/HistoryBlock/getHistoryBlocks";
const incrementItemsLoaded = 100;
interface ChatHistoryProps {}
const ChatHistory: React.FC<ChatHistoryProps> = ({}) => {
  const { id: chatId } = useParams<{ id: string }>();
  const { prefixChatRelatedKey } = usePrefixChatRelatedKey();

  const [initialRowNumber, setInitialRowNumber] = useState<number>();
  useEffect(() => {
    if (chatId && !initialRowNumber) {
      (async () => {
        const { rowNumber } = await jsonDataService
          .getRowNumber({
            key: prefixChatRelatedKey(`chats/${chatId}`),
            keyLike: prefixChatRelatedKey(`chats/${uuidPlaceholder}`),
          })
          .queryFn();

        setInitialRowNumber(rowNumber);
      })();
    }
  }, [chatId, initialRowNumber, prefixChatRelatedKey]);
  const [historyItemsPerPage, setHistoryItemsPerPage] =
    useState(incrementItemsLoaded);
  useEffect(() => {
    if (initialRowNumber) {
      setHistoryItemsPerPage(
        Math.ceil(initialRowNumber / incrementItemsLoaded) *
          incrementItemsLoaded
      );
    }
  }, [initialRowNumber]);
  const { data: _chatHistory } = useJsonDataKeysLike<Chat>(
    {
      key: prefixChatRelatedKey(`chats/${uuidPlaceholder}`),
      page: 1,
      perPage: historyItemsPerPage,
    },
    {
      enabled: !!initialRowNumber,
    }
  );

  const previousChatHistory = usePrevious(_chatHistory);
  const chatHistory = _chatHistory || previousChatHistory;
  const historyBlocks = useMemo(() => {
    return getHistoryBlocks(chatHistory?.data.map(({ value }) => value) || []);
  }, [chatHistory]);

  if (!chatHistory || !initialRowNumber) return <CentralLoader />;
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
