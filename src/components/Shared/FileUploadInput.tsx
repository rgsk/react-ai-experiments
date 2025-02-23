import { Export } from "iconsax-react";
import { FileObject } from "openai/resources/files";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import assistantsService, {
  supportedExtensions,
} from "~/services/assistantsService";
import experimentsService from "~/services/experimentsService";
import { FilePreview } from "../AssistantsChatPage/Children/FileUploadedPreview/FileUploadedPreview";
import { LoadingSpinner } from "./LoadingSpinner";
interface FileUploadInputProps {
  onFileAdd: (data: {
    file: File;
    assistantFileObject?: FileObject;
    s3Url?: string;
  }) => void;
  onFileRemove: (data: {
    file: File;
    assistantFileObject?: FileObject;
    s3Url?: string;
  }) => void;
  uploadDestination: "assistants" | "s3";
}

const FileSizeLimitMB = 500;
const FileUploadInput: React.FC<FileUploadInputProps> = ({
  onFileAdd,
  onFileRemove,
  uploadDestination,
}) => {
  const [fileUploading, setFileUploading] = useState(false);
  const [inputHovered, setInputHovered] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File>();
  const [percentCompleted, setPercentCompleted] = useState(0);
  const [error, setError] = useState<string>();
  const [assistantFileObject, setAssistantFileObject] = useState<FileObject>();
  const [s3Url, setS3Url] = useState<string>();
  const onFileAddRef = useRef(onFileAdd);
  onFileAddRef.current = onFileAdd;
  useEffect(() => {
    (async () => {
      if (selectedFile) {
        // check for extension
        const ext = selectedFile.name.split(".").pop()?.toLowerCase();
        if (!ext || !supportedExtensions.includes(ext)) {
          // this will work when we drag and drop the file
          // input accept doesn't works for drag and drop
          setPercentCompleted(100);
          setError("File format not supported");
          return;
        }

        // check for file size
        const fileSize = selectedFile.size;
        if (fileSize > FileSizeLimitMB * 1024 * 1024) {
          setPercentCompleted(100);
          setError(`File size exceeds ${FileSizeLimitMB} MB`);
          return;
        }

        setFileUploading(true);
        setError(undefined);
        setPercentCompleted(0);
        try {
          if (uploadDestination === "s3") {
            const url = await experimentsService.uploadFileToS3(
              selectedFile,
              (progress) => {
                setPercentCompleted(progress * 100);
              }
            );

            setS3Url(url);

            onFileAddRef.current({ file: selectedFile, s3Url: url });
          } else {
            const obj = await assistantsService.uploadFile(
              selectedFile,
              (progress) => {
                setPercentCompleted(progress * 100);
              }
            );
            setAssistantFileObject(obj);
            onFileAddRef.current({
              file: selectedFile,
              assistantFileObject: obj,
            });
          }
        } catch (err: any) {
          const errorMessage = err.response.data.message as string;
          if (errorMessage.includes("Invalid extension")) {
            setError("File format not supported");
          }
        } finally {
          setPercentCompleted(100);
          setFileUploading(false);
        }
      }
    })();
  }, [selectedFile, setFileUploading, uploadDestination]);

  const { isImage, objectUrl } = useMemo(() => {
    if (selectedFile) {
      return {
        isImage: selectedFile.type.startsWith("image/"),
        objectUrl: URL.createObjectURL(selectedFile),
      };
    }
    return { isImage: false, objectUrl: undefined };
  }, [selectedFile]);

  const onRemove = () => {
    if (selectedFile) {
      setSelectedFile(undefined);
      onFileRemove({ file: selectedFile, assistantFileObject, s3Url });
      if (assistantFileObject) {
        assistantsService.deleteFile(assistantFileObject.id);
        setAssistantFileObject(undefined);
      }
      if (s3Url) {
        experimentsService.deleteFileFromS3(s3Url);
        setS3Url(undefined);
      }
    }
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <button
          className={cn(
            "w-full relative px-[36px] py-[24px] rounded-[2px] border border-dashed border-foreground",
            inputHovered && "bg-[#FFFFEF]"
          )}
          type="button"
        >
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSelectedFile(file);
              }
            }}
            multiple={false}
            className="absolute top-0 left-0 w-full h-full opacity-0"
            accept={supportedExtensions.map((ext) => `.${ext}`).join(",")}
            onDragEnter={() => setInputHovered(true)}
            onDragOver={() => setInputHovered(true)}
            onDragLeave={() => setInputHovered(false)}
            onDrop={() => setInputHovered(false)}
          />

          <div className="flex justify-center flex-col items-center text-center">
            <div className="rounded-[8px] p-[6px] border border-foreground bg-white">
              <Export size={20} className="stroke-foreground" />
            </div>
            <div className="h-[12px]"></div>
            <p className="text-[14px] font-medium">
              {inputHovered
                ? "Drop Here to Upload"
                : "+ Upload an Image or a Document"}
            </p>
            <div className="h-[8px]"></div>
            <p className="text-[12px] text-[#030a2180]">
              Maximum {FileSizeLimitMB} MB
            </p>
          </div>
        </button>
      ) : isImage ? (
        <div>
          <div className="relative">
            <img
              src={objectUrl!}
              alt={selectedFile.name}
              className="w-full rounded-[12px] max-h-[200px] object-cover object-top"
            />
            {fileUploading && (
              <div className="absolute top-0 left-0 w-full h-full rounded-[8px] bg-black bg-opacity-10 flex justify-center items-center">
                <div>
                  <LoadingSpinner />
                </div>
              </div>
            )}
            {renderCloseButton()}
          </div>
          {error && (
            <span className="text-[#B30909] text-[12px] pt-[12px]">
              {error}
            </span>
          )}
        </div>
      ) : (
        <FilePreview fileName={selectedFile.name} loading={fileUploading}>
          {renderCloseButton()}
          <div>
            <ProgressBar progress={percentCompleted} />
          </div>
          <div className="h-[8px]"></div>
          <p className="text-[12px]">
            {fileUploading ? (
              <span className="text-gslearnlightmodeGrey1">Uploading...</span>
            ) : error ? (
              <span className="text-[#B30909]">{error}</span>
            ) : (
              <span className="text-[#026415]">Upload Completed</span>
            )}
          </p>
        </FilePreview>
      )}
    </div>
  );
};
export default FileUploadInput;

interface ProgressBarProps {
  progress: number; // The progress percentage (0 to 100)
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="h-[7px] rounded-[4px] bg-[#030A211A]">
      <div
        className="h-full rounded-[4px] bg-[#030A21]"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};
