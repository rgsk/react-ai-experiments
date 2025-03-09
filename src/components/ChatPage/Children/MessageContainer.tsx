import { Message } from "~/lib/typesJsonData";
import { cn } from "~/lib/utils";

interface MessageContainerProps {
  role: Message["role"];
  children: any;
}
const MessageContainer: React.FC<MessageContainerProps> = ({
  role,
  children,
}) => {
  return (
    <div
      className={cn(
        "rounded-lg",
        role === "assistant"
          ? "bg-transparent w-full"
          : "bg-gray-100 dark:bg-gray-800",
        role === "user" ? "ml-auto text-right max-w-[80%] mr-4" : ""
      )}
    >
      {children}
    </div>
  );
};

export default MessageContainer;
