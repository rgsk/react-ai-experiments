import { Paperclip2 } from "iconsax-react";
import { FileObject } from "openai/resources/files";
import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import useBreakpoints from "~/hooks/useBreakpoints";
import { cn } from "~/lib/utils";
import assistantsService, {
  supportedExtensions,
} from "~/services/assistantsService";
import { HandleSend } from "../../AssistantsChatPage";
import FileUploadedPreview from "../FileUploadedPreview/FileUploadedPreview";

export type FileEntry = {
  id: string;
  file: File;
  fileObject?: FileObject;
};
interface MessageInputProps {
  handleSend: HandleSend;
  loading: boolean;
  interrupt: () => void;
  placeholder: string;
  attachedFiles: FileEntry[];
  setAttachedFiles: Dispatch<SetStateAction<FileEntry[]>>;
  handleFilesChange: (files: File[]) => void;
  interruptEnabled: boolean;
  disabled?: boolean;
  showFilesUploadedPreview: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  handleSend,
  loading,
  interrupt,
  placeholder,
  attachedFiles,
  setAttachedFiles,
  handleFilesChange,
  interruptEnabled,
  disabled,
  showFilesUploadedPreview,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the file input click
    }
  };
  const [text, setText] = useState("");
  const { md } = useBreakpoints();
  const canSend = useMemo(() => {
    return (
      !loading &&
      !disabled &&
      (!!text || !!attachedFiles.length) &&
      attachedFiles.every((fe) => !!fe.fileObject)
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
        "border border-foreground",
        canSend ? "outline outline-[#FFFF66]" : "",
        "bg-white rounded-[2px] py-[16px] px-[16px]",
        disabled &&
          "border-gslearnlightmodeGrey1 bg-gslearnlightmodeGrey6 cursor-not-allowed"
      )}
    >
      {attachedFiles.length > 0 && showFilesUploadedPreview && (
        <div className="flex gap-[16px] pb-[24px] pt-[12px]">
          {attachedFiles.map((fileEntry) => (
            <FileUploadedPreview
              key={fileEntry.id}
              fileEntry={fileEntry}
              onRemove={() => {
                if (fileEntry.fileObject) {
                  assistantsService.deleteFile(fileEntry.fileObject.id);
                }

                setAttachedFiles((prev) =>
                  prev.filter((entry) => entry.id !== fileEntry.id)
                );
              }}
              onFileObjectUpload={(fileObject) => {
                setAttachedFiles((prev) =>
                  prev.map((entry) =>
                    entry.id === fileEntry.id ? { ...entry, fileObject } : entry
                  )
                );
              }}
            />
          ))}
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
          accept={supportedExtensions.map((ext) => `.${ext}`).join(",")}
          onClick={(event: any) => {
            // Reset the value so that the same file/files can be selected again
            event.target.value = null;
          }}
        />
        <button onClick={handleFileInputClick}>
          <Paperclip2 />
        </button>
        <div className="w-[8px]"></div>
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
          onPaste={(event) => {
            const items = event.clipboardData.items;
            const files: File[] = [];
            for (let i = 0; i < items.length; i++) {
              const item = items[i];

              if (item.kind === "file") {
                const file = item.getAsFile();

                if (file) {
                  files.push(file);
                }
              }
            }
            if (files.length > 0) {
              // Prevent default paste behavior (which pastes the file name)
              event.preventDefault();
              handleFilesChange(files);
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            `w-full resize-none text-foreground
            placeholder:text-[#030a2180] text-[14px] focus:outline-none bg-transparent`,
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
              <div className="h-[8px] w-[8px] md:h-[12px] md:w-[12px] rounded-[1px] md:rounded-[2px] bg-white"></div>
            </ActionButton>
          ) : (
            <ActionButton onClick={handleSubmit} disabled={!canSend}>
              <img
                width={md ? 24 : 14}
                height={md ? 24 : 14}
                src="/icons/direct-right.svg"
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
        "bg-foreground disabled:bg-gslearnlightmodeGrey1",
        disabled && "cursor-not-allowed"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
