import { X as XIcon } from "lucide-react";
import { FileObject } from "openai/resources/files";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LoadingProgress from "~/components/Shared/LoadingProgress";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { fileIcons } from "~/lib/constants";
import assistantsService from "~/services/assistantsService";
import experimentsService from "~/services/experimentsService";
import { FileEntry } from "../MessageInput/MessageInput";

interface FileUploadedPreviewProps {
  fileEntry: FileEntry;
  onRemove: () => void;
  destination: "s3" | "assistants";
  onFileObjectUpload?: (fileObject: FileObject) => void;
  onS3Upload?: (s3Url: string) => void;
}

const FileUploadedPreview: React.FC<FileUploadedPreviewProps> = ({
  fileEntry: { file, fileObject, id, s3Url, fileMetadata },
  onRemove,
  onFileObjectUpload,
  destination,
  onS3Upload,
}) => {
  const [loading, setLoading] = useState(false);
  const onFileObjectUploadRef = useRef(onFileObjectUpload);
  onFileObjectUploadRef.current = onFileObjectUpload;
  const [uploadProgress, setUploadProgress] = useState(0);
  const onS3UploadRef = useRef(onS3Upload);
  onS3UploadRef.current = onS3Upload;
  const fileType = file ? file.type : fileMetadata?.type;
  const fileName = file ? file.name : fileMetadata?.name;
  const isImage = fileType?.startsWith("image/");
  const uploadCalledRef = useRef(false);
  const localHandleUpload = useCallback(async () => {
    if (!file) return;
    if (uploadCalledRef.current) return;
    uploadCalledRef.current = true;
    setLoading(true);
    if (destination === "s3") {
      const s3Url = await experimentsService.uploadFileToS3(
        file,
        (progress) => {
          setUploadProgress(progress * 100);
        }
      );
      onS3UploadRef.current?.(s3Url);
    } else {
      const newFileObject = await assistantsService.uploadFile(
        file,
        (progress) => {
          setUploadProgress(progress * 100);
        }
      );
      onFileObjectUploadRef.current?.(newFileObject);
    }
    setLoading(false);
  }, [destination, file]);
  useEffect(() => {
    if (destination === "assistants") {
      if (!fileObject) {
        localHandleUpload();
      }
    }
    if (destination === "s3") {
      if (!s3Url) {
        localHandleUpload();
      }
    }
  }, [destination, fileObject, localHandleUpload, s3Url]);
  const imageUrl = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    if (s3Url) {
      return s3Url;
    }
    return undefined;
  }, [file, s3Url]);
  const renderLoader = () => {
    return <LoadingProgress progress={uploadProgress} size={18} />;
  };
  const renderCloseButton = () => {
    return (
      <div className="absolute top-0 right-0 translate-x-[10px] -translate-y-1/2">
        <button
          onClick={onRemove}
          className="bg-foreground text-background rounded-full w-[18px] h-[18px] flex justify-center items-center"
        >
          <XIcon size={14} />
        </button>
      </div>
    );
  };
  if (isImage) {
    return (
      <div className="relative min-w-[64px] w-[64px] h-[64px]">
        <img
          src={imageUrl}
          alt={fileName}
          className="rounded-[8px] object-cover object-center w-full h-full"
        />
        {renderCloseButton()}
        {loading && (
          <div className="absolute top-0 left-0 w-full h-full rounded-[8px] bg-black bg-opacity-5 flex justify-center items-center">
            {renderLoader()}
          </div>
        )}
      </div>
    );
  }
  return (
    <FilePreview
      fileName={fileName ?? "Unknown file"}
      loading={loading}
      loader={renderLoader()}
    >
      {renderCloseButton()}
    </FilePreview>
  );
};

interface FilePreviewProps {
  loading: boolean;
  fileName: string;
  children?: any;
  loader?: any;
}
export const FilePreview: React.FC<FilePreviewProps> = ({
  loading,
  fileName,
  children,
  loader,
}) => {
  return (
    <div className="w-[295px] min-w-[295px] px-[12px] border border-input py-[16px] rounded-[8px] relative">
      <div className="flex gap-[8px] items-center">
        <div className="rounded-[8px] relative w-[30px] min-w-[30px] h-[30px] flex justify-center items-center bg-[#FF5588]">
          {loading ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {loader ?? <LoadingSpinner size={20} />}
            </div>
          ) : (
            <span className="text-white">{fileIcons.document}</span>
          )}
        </div>
        <p className="text-[14px] font-medium text-ellipsis overflow-hidden whitespace-nowrap">
          {fileName}
        </p>
        <div className="flex-1"></div>
        <div>{children}</div>
      </div>
    </div>
  );
};
export default FileUploadedPreview;
