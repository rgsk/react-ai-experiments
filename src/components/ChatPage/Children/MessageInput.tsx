import { useMemo, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import useBreakpoints from "~/hooks/useBreakpoints";
import { cn } from "~/lib/utils";
import { HandleSend } from "../ChatPage";

interface MessageInputProps {
  handleSend: HandleSend;
  loading: boolean;
  interrupt: () => void;
  placeholder: string;
  interruptEnabled: boolean;
}
const MessageInput: React.FC<MessageInputProps> = ({
  handleSend,
  loading,
  interrupt,
  placeholder,
  interruptEnabled,
}) => {
  const [text, setText] = useState("");
  const { md } = useBreakpoints();
  const canSend = useMemo(() => {
    return !loading && !!text;
  }, [loading, text]);
  const handleSubmit = () => {
    if (!canSend) return;

    handleSend({ text });
    setText("");
  };

  return (
    <div
      className={cn(
        canSend
          ? "border border-gslearnMockingbird"
          : "border border-gslearnlightmodeGrey3",
        "bg-white rounded-[12px] py-[16px] px-[16px]"
      )}
    >
      <form
        className="relative flex"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <TextareaAutosize
          minRows={1}
          maxRows={6}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={placeholder}
          className={cn(
            `w-full resize-none text-gslearnMockingbird
            placeholder:text-gs-light-mode-grey-1 text-[14px] md:text-[16px] focus:outline-none`
          )}
          style={{
            // 36 is size of button container
            paddingRight: 36,
          }}
        />
        <div className="absolute bottom-1/2 translate-y-1/2 right-0">
          {loading && interruptEnabled ? (
            <ActionButton onClick={interrupt}>
              <div className="h-[8px] w-[8px] md:h-[12px] md:w-[12px] rounded-[1px] md:rounded-[2px] bg-white"></div>
            </ActionButton>
          ) : (
            <ActionButton onClick={handleSubmit} disabled={!canSend}>
              <img
                width={md ? 24 : 14}
                height={md ? 24 : 14}
                src="/send.svg"
                alt="Send"
              />
            </ActionButton>
          )}
        </div>
      </form>
    </div>
  );
};

export default MessageInput;

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: any;
}
const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled,
  children,
}) => {
  return (
    <button
      className={cn(
        "rounded-full w-[24px] h-[24px] md:w-[36px] md:h-[36px] flex justify-center items-center",
        "bg-gslearnMockingbird disabled:bg-gslearnlightmodeGrey1"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
