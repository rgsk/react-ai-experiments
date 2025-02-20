import {
  Message,
  MessageContentDelta,
} from "openai/resources/beta/threads/messages";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { TemporaryUserMessageId } from "~/components/AssistantsChatPage/AssistantsChatPage";
import useSocket from "./useSocket";
export const useAssistantsChatSocketListeners = ({
  runLoading,
  setMessages,
  setAssistantMessageLoading,
  threadId,
}: {
  threadId: string | null;
  runLoading: boolean;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setAssistantMessageLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  const { socketRef, resetConnection } = useSocket();
  const runLoadingRef = useRef(runLoading);
  runLoadingRef.current = runLoading;

  const onUserMessageCreated = ({ message }: { message: Message }) => {
    setMessages((prev) => {
      return [
        ...prev.filter((m) => {
          if (m.id === TemporaryUserMessageId) {
            if (
              message.content.some(
                (c) =>
                  c.type === "text" &&
                  c.text.value === (m.content[0] as any).text.value
              )
            ) {
              return false;
            }
          }
          return true;
        }),
        message,
      ];
    });
  };
  const onUserMessageCreatedRef = useRef(onUserMessageCreated);
  onUserMessageCreatedRef.current = onUserMessageCreated;

  const onThreadMessageCreated = (data: { message: Message }) => {
    const { message } = data;
    setAssistantMessageLoading(false);
    setMessages((prev) => {
      return [...prev, message];
    });
  };
  const onThreadMessageCreatedRef = useRef(onThreadMessageCreated);
  onThreadMessageCreatedRef.current = onThreadMessageCreated;

  const onThreadMessageCompleted = (data: { message: Message }) => {
    const { message } = data;
    setTimeout(() => {
      if (runLoadingRef.current) {
        setAssistantMessageLoading(true);
      }
    }, 500);

    // replace the last assistant message by this message
    setMessages((prev) => {
      let lastAssistantMessageIndex = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].role === "assistant") {
          lastAssistantMessageIndex = i;
          break;
        }
      }
      if (lastAssistantMessageIndex === -1) return prev;
      return [
        ...prev.slice(0, lastAssistantMessageIndex),
        message,
        ...prev.slice(lastAssistantMessageIndex + 1),
      ];
    });
  };
  const onThreadMessageCompletedRef = useRef(onThreadMessageCompleted);
  onThreadMessageCompletedRef.current = onThreadMessageCompleted;

  const onThreadMessageIncomplete = (data: { message: Message }) => {
    const { message } = data;
    // replace the last assistant message by this message
    setMessages((prev) => {
      let lastAssistantMessageIndex = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].role === "assistant") {
          lastAssistantMessageIndex = i;
          break;
        }
      }
      if (lastAssistantMessageIndex === -1) return prev;
      return [
        ...prev.slice(0, lastAssistantMessageIndex),
        message,
        ...prev.slice(lastAssistantMessageIndex + 1),
      ];
    });
  };

  const onThreadMessageIncompleteRef = useRef(onThreadMessageIncomplete);
  onThreadMessageIncompleteRef.current = onThreadMessageIncomplete;

  const onThreadMessageDelta = (data: {
    content: Array<MessageContentDelta>;
  }) => {
    const { content: contentDeltas } = data;
    setMessages((prev) => {
      let lastAssistantMessageIndex = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].role === "assistant") {
          lastAssistantMessageIndex = i;
          break;
        }
      }
      if (lastAssistantMessageIndex === -1) return prev;
      const lastAssistantMessage = prev[lastAssistantMessageIndex];
      const content = JSON.parse(JSON.stringify(lastAssistantMessage.content));
      for (const contentDelta of contentDeltas) {
        if (contentDelta.type === "text" && content[contentDelta.index]) {
          const item = content[contentDelta.index];
          if (item.type === "text") {
            item.text.value += contentDelta.text?.value ?? "";
          }
        } else {
          const { index, ...rest } = contentDelta;
          content[contentDelta.index] = rest as any;
        }
      }
      return [
        ...prev.slice(0, lastAssistantMessageIndex),
        {
          ...lastAssistantMessage,
          content: content,
        },
        ...prev.slice(lastAssistantMessageIndex + 1),
      ];
    });
  };
  const onThreadMessageDeltaRef = useRef(onThreadMessageDelta);
  onThreadMessageDeltaRef.current = onThreadMessageDelta;

  useEffect(() => {
    const [] = [threadId];
    resetConnection();
    // we reset connection on thread change

    // below we would get the new socket (we can attach the listeners on it)
    const socket = socketRef.current;
    if (socket) {
      socket.on("thread.message.created", (data) => {
        onThreadMessageCreatedRef.current(data);
      });
      socket.on("thread.message.completed", (data) => {
        onThreadMessageCompletedRef.current(data);
      });
      socket.on("thread.message.incomplete", (data) => {
        onThreadMessageIncompleteRef.current(data);
      });
      socket.on("thread.message.delta", (data) => {
        onThreadMessageDeltaRef.current(data);
      });
      socket.on("userMessage.created", (data) => {
        onUserMessageCreatedRef.current(data);
      });
    }
  }, [resetConnection, socketRef, threadId]);

  return {
    socketRef,
  };
};
