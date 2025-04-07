import { useCallback, useEffect, useState } from "react";
import { Chat } from "~/lib/typesJsonData";

import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import usePrevious from "~/hooks/usePrevious";
import { uuidPlaceholder } from "~/lib/constants";
import jsonDataService from "~/services/jsonDataService";
import usePrefixChatRelatedKey from "./usePrefixChatRelatedKey";
const incrementItemsLoaded = 100;
const useChatHistory = () => {
  const { id: chatId } = useParams<{ id: string }>();
  const { prefixChatRelatedKey } = usePrefixChatRelatedKey();

  const [initialRowNumber, setInitialRowNumber] = useState<number>();
  useEffect(() => {
    if (chatId && initialRowNumber === undefined) {
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
  const [historyItemsPerPage, setHistoryItemsPerPage] = useState<number>();
  useEffect(() => {
    if (typeof initialRowNumber === "number") {
      /*
              calculation explaination -
              let result = Math.ceil(initialRowNumber / incrementItemsLoaded) * incrementItemsLoaded
  
              let incrementItemsLoaded = 10
              let initialRowNumber = 14
              then result = 20
              let initialRowNumber = 28
              then result = 30
  
              we also add incrementItemsLoaded, to fetch one extra page
              this prevents another page fetch on automatic scroll to that item
           */
      setHistoryItemsPerPage(
        Math.ceil(initialRowNumber / incrementItemsLoaded) *
          incrementItemsLoaded +
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
      enabled:
        typeof initialRowNumber === "number" &&
        typeof historyItemsPerPage === "number",
    }
  );

  const previousChatHistory = usePrevious(_chatHistory);
  const chatHistory = _chatHistory || previousChatHistory;
  const loadMoreChatHistory = useCallback(() => {
    setHistoryItemsPerPage((prev) => (prev ?? 0) + incrementItemsLoaded);
  }, []);
  const queryClient = useQueryClient();
  // we don't want to fetch when enabled is false
  // alternative implementation could be check if enabled = true, call refetch
  const refetchChatHistory = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [
        "json-data/key-like",
        prefixChatRelatedKey(`chats/${uuidPlaceholder}`),
      ],
    });
  }, [prefixChatRelatedKey, queryClient]);
  return { chatHistory, loadMoreChatHistory, refetchChatHistory };
};
export default useChatHistory;
