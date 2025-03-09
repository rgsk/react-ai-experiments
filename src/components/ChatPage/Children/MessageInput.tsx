import { ArrowUp } from "iconsax-react";
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
  disabled?: boolean;
  interruptEnabled: boolean;
}
const MessageInput: React.FC<MessageInputProps> = ({
  handleSend,
  loading,
  interrupt,
  placeholder,
  disabled,
  interruptEnabled,
}) => {
  const [inputFocused, setInputFocused] = useState(false);

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
        "border border-input",
        inputFocused && "ring-1 ring-ring",
        "bg-transparent rounded-lg py-[16px] px-[16px]",
        disabled &&
          "border-gslearnlightmodeGrey1 bg-gslearnlightmodeGrey6 cursor-not-allowed"
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
          onFocus={() => {
            setInputFocused(true);
          }}
          onBlur={() => {
            setInputFocused(false);
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
            `w-full resize-none
            placeholder:text-muted-foreground text-[14px] focus:outline-none bg-transparent`,
            disabled && "cursor-not-allowed"
          )}
          style={{
            // 36 is size of button container
            paddingRight: 36,
          }}
        />
        <div className="absolute bottom-1/2 translate-y-1/2 right-0">
          {loading && interruptEnabled ? (
            <ActionButton onClick={interrupt}>
              <div className="h-[8px] w-[8px] md:h-[12px] md:w-[12px] rounded-[1px] md:rounded-[2px] bg-background"></div>
            </ActionButton>
          ) : (
            <ActionButton onClick={handleSubmit} disabled={!canSend}>
              <ArrowUp className="text-background" size={18} />
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
        "bg-foreground",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
