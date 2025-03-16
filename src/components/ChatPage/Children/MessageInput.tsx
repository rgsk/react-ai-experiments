import { ArrowUp, Paperclip2 } from "iconsax-react";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EditableMathField } from "react-mathquill";
import TextareaAutosize from "react-textarea-autosize";
import { cn, handleInputOnPaste } from "~/lib/utils";
import experimentsService from "~/services/experimentsService";
import { FileEntry, HandleSend } from "../ChatPage";
import FileUploadedPreview, {
  CloseButton,
} from "./FileUploadedPreview/FileUploadedPreview";

interface MessageInputProps {
  handleSend: HandleSend;
  loading: boolean;
  interrupt: () => void;
  placeholder: string;
  disabled?: boolean;
  interruptEnabled: boolean;
  handleFilesChange: (files: File[]) => void;
  attachedFiles: FileEntry[];
  setAttachedFiles: Dispatch<SetStateAction<FileEntry[]>>;
}
const MessageInput: React.FC<MessageInputProps> = ({
  handleSend,
  loading,
  interrupt,
  placeholder,
  disabled,
  interruptEnabled,
  handleFilesChange,
  attachedFiles,
  setAttachedFiles,
}) => {
  const [latex, setLatex] = useState("");
  const [latexActive, setLatexActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaInputRef = useRef<HTMLTextAreaElement>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the file input click
    }
  };
  const [text, setText] = useState("");

  useEffect(() => {
    if (text.includes("/math")) {
      setLatexActive(true);
      setText(text.replace("/math", ""));
    }
  }, [text]);
  const canSend = useMemo(() => {
    return (
      !loading &&
      !disabled &&
      (!!text || !!attachedFiles.length) &&
      attachedFiles.every((fe) => !!fe.s3Url)
    );
  }, [attachedFiles, disabled, loading, text]);
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
      {attachedFiles.length > 0 && (
        <div className="flex gap-[16px] pb-[24px] pt-[12px]">
          {attachedFiles.map((fileEntry) => (
            <FileUploadedPreview
              key={fileEntry.id}
              fileEntry={fileEntry}
              onRemove={() => {
                if (fileEntry.s3Url) {
                  experimentsService.deleteFileFromS3(fileEntry.s3Url);
                }

                setAttachedFiles((prev) =>
                  prev.filter((entry) => entry.id !== fileEntry.id)
                );
              }}
              onS3Upload={(s3Url) => {
                setAttachedFiles((prev) =>
                  prev.map((entry) =>
                    entry.id === fileEntry.id ? { ...entry, s3Url } : entry
                  )
                );
              }}
            />
          ))}
        </div>
      )}
      {latexActive && (
        <div className="flex pb-[24px]">
          <div className="relative">
            <CloseButton
              onClick={() => {
                setLatex("");
                setLatexActive(false);
              }}
            />
            <EditableMathField
              id="EditableMathField"
              mathquillDidMount={(mathField) => {
                mathField.focus();
              }}
              style={{ padding: 8 }}
              latex={latex}
              onChange={(mathField) => {
                setLatex(mathField.latex());
              }}
              onKeyDown={(e) => {
                const textarea = textAreaInputRef.current;
                if (!textarea) return;
                if (e.key === "Escape") {
                  setLatex("");
                  setLatexActive(false);
                  textarea.focus();
                } else if (e.key === "Enter") {
                  e.preventDefault();

                  if (text.includes("/^math")) {
                    const newLatex = `\\(${latex}\\)`;
                    const newText = text.replace("/^math", newLatex);
                    setText(newText);
                    textarea.focus();
                    setTimeout(() => {
                      const idx = newText.indexOf(newLatex);
                      textarea.setSelectionRange(idx, idx + newLatex.length);
                    });
                  } else {
                    setText(text + `\\(${latex}\\)`);
                    textarea.focus();
                  }
                  setLatex("");
                  setLatexActive(false);
                }
              }}
            />
          </div>
        </div>
      )}
      <form
        className="relative flex"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={(ev) => {
            const files = ev.target.files;
            if (files) {
              handleFilesChange(Array.from(files));
            }
          }}
          multiple
          className="hidden"
          onClick={(event: any) => {
            // Reset the value so that the same file/files can be selected again
            event.target.value = null;
          }}
        />
        <button onClick={handleFileInputClick}>
          <Paperclip2 size={20} />
        </button>
        <div className="w-[8px]"></div>
        <TextareaAutosize
          ref={textAreaInputRef}
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
            if (e.key === "e") {
              const textarea = textAreaInputRef.current;
              if (textarea) {
                const selection = text
                  .substring(textarea.selectionStart, textarea.selectionEnd)
                  .trim();
                if (selection.startsWith("\\(") && selection.endsWith("\\)")) {
                  // user has performed edit action on latex
                  e.preventDefault();
                  setText((prev) => prev.replace(selection, "/^math"));
                  setLatex(selection.substring(3, selection.length - 3));
                  setLatexActive(true);
                }
              }
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          onPaste={(event) => {
            handleInputOnPaste(event, handleFilesChange);
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
