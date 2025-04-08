import { ArrowUp } from "iconsax-react";
import {
  AudioLinesIcon,
  PlusIcon,
  Volume2Icon,
  VolumeOffIcon,
  X,
} from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { isMobile } from "react-device-detect";

import { EditableMathField } from "react-mathquill";
import TextareaAutosize from "react-textarea-autosize";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { Button } from "~/components/ui/button";
import { cn, handleInputOnPaste } from "~/lib/utils";
import experimentsService from "~/services/experimentsService";
import { FileEntry, HandleSend } from "../ChatPage";
import FileUploadedPreview, {
  CloseButton,
} from "./FileUploadedPreview/FileUploadedPreview";
import SpeechRecognitionMic from "./SpeechRecognitionMic";

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
  autoReadAloudProps: {
    stop: () => void;
    loading: boolean;
    playing: boolean;
    enabled: boolean;
  };
  voiceModeProps: {
    voiceModeEnabled: boolean;
    setVoiceModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    voiceModeLoading: boolean;
  };
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
  autoReadAloudProps,
  voiceModeProps,
}) => {
  const [latex, setLatex] = useState("");
  const [latexActive, setLatexActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaInputRef = useRef<HTMLTextAreaElement>(null);
  const [textInputDisabled, setTextInputDisabled] = useState(false);
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

  const scrollTextAreaToBottom = () => {
    const scrollContainer = textAreaInputRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight - scrollContainer.clientHeight,
      });
    }
  };

  return (
    <div
      className={cn(
        "border border-input",
        inputFocused && "ring-1 ring-ring",
        "bg-transparent rounded-[18px] px-4 py-2",
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
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="space-y-2">
          <div>
            <TextareaAutosize
              ref={textAreaInputRef}
              minRows={1}
              maxRows={6}
              value={text}
              onChange={(e) => {
                if (!textInputDisabled) {
                  setText(e.target.value);
                }
              }}
              autoFocus={!isMobile}
              onFocus={() => {
                setInputFocused(true);
              }}
              onBlur={() => {
                setInputFocused(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "e") {
                  const textarea = textAreaInputRef.current;
                  if (textarea) {
                    const selection = text
                      .substring(textarea.selectionStart, textarea.selectionEnd)
                      .trim();
                    if (
                      selection.startsWith("\\(") &&
                      selection.endsWith("\\)")
                    ) {
                      // user has performed edit action on latex
                      e.preventDefault();
                      setText((prev) => prev.replace(selection, "/^math"));
                      setLatex(selection.substring(3, selection.length - 3));
                      setLatexActive(true);
                    }
                  }
                }
                if (isMobile) {
                  if (e.key === "Enter" && e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                } else {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }
              }}
              onPaste={(event) => {
                handleInputOnPaste(event, handleFilesChange);
              }}
              placeholder={placeholder}
              className={cn(
                `w-full resize-none
            placeholder:text-muted-foreground focus:outline-none bg-transparent px-2 pt-2 disabled:text-foreground`,
                disabled && "cursor-not-allowed"
              )}
            />
          </div>
          <div className="flex justify-between items-center">
            <div>
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
              <Button
                onClick={handleFileInputClick}
                size="icon"
                variant="outline"
                className="rounded-full"
              >
                <PlusIcon size={20} />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                size="icon"
                disabled={loading}
                onClick={() => {
                  voiceModeProps.setVoiceModeEnabled((prev) => !prev);
                }}
              >
                {voiceModeProps.voiceModeEnabled ? (
                  <X />
                ) : voiceModeProps.voiceModeLoading ? (
                  <LoadingSpinner />
                ) : (
                  <AudioLinesIcon />
                )}
              </Button>
              {autoReadAloudProps.enabled && (
                <Button
                  variant="outline"
                  className="rounded-full"
                  size="icon"
                  onClick={autoReadAloudProps.stop}
                  disabled={!autoReadAloudProps.playing}
                >
                  {autoReadAloudProps.loading ? (
                    <LoadingSpinner />
                  ) : autoReadAloudProps.playing ? (
                    <VolumeOffIcon />
                  ) : (
                    <Volume2Icon />
                  )}
                </Button>
              )}

              <SpeechRecognitionMic
                text={text}
                setText={setText}
                textInputDisabled={textInputDisabled}
                setTextInputDisabled={setTextInputDisabled}
                scrollTextAreaToBottom={scrollTextAreaToBottom}
                onMicStart={() => {
                  autoReadAloudProps.stop();
                }}
                disabled={loading}
              />
              {loading && interruptEnabled ? (
                <Button
                  onClick={interrupt}
                  className="rounded-full"
                  size="icon"
                >
                  <div className="h-[9px] w-[9px] md:h-[10px] md:w-[10px] rounded-[1px] md:rounded-[2px] bg-background"></div>
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canSend}
                  className="rounded-full"
                  size="icon"
                >
                  <ArrowUp />
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
