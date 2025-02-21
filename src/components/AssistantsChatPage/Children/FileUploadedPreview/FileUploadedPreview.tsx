import { X as XIcon } from "lucide-react";
import { FileObject } from "openai/resources/files";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { fileIcons } from "~/lib/constants";
import assistantsService from "~/services/assistantsService";
import { FileEntry } from "../MessageInput/MessageInput";
interface FileUploadedPreviewProps {
  fileEntry: FileEntry;
  onRemove: () => void;
  onFileObjectUpload: (fileObject: FileObject) => void;
}
const FileUploadedPreview: React.FC<FileUploadedPreviewProps> = ({
  fileEntry: { file, fileObject },
  onRemove,
  onFileObjectUpload,
}) => {
  const [loading, setLoading] = useState(false);
  const onFileObjectUploadRef = useRef(onFileObjectUpload);
  onFileObjectUploadRef.current = onFileObjectUpload;
  const isImage = file.type.startsWith("image/");
  const localHandleUpload = useCallback(async () => {
    setLoading(true);
    const newFileObject = await assistantsService.uploadFile(file);
    onFileObjectUploadRef.current(newFileObject);
    setLoading(false);
  }, [file]);
  useEffect(() => {
    if (!fileObject) {
      localHandleUpload();
    }
  }, [fileObject, localHandleUpload]);
  const imageUrl = useMemo(() => URL.createObjectURL(file), [file]);
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
          alt={file.name}
          className="rounded-[8px] object-cover object-center w-full h-full"
        />
        {renderCloseButton()}
        {loading && (
          <div className="absolute top-0 left-0 w-full h-full rounded-[8px] bg-black bg-opacity-5 flex justify-center items-center">
            <div className="scale-75">
              <LoadingSpinner />
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <FilePreview fileName={file.name} loading={loading}>
      {renderCloseButton()}
    </FilePreview>
  );
};

interface FilePreviewProps {
  loading: boolean;
  fileName: string;
  children?: any;
}
export const FilePreview: React.FC<FilePreviewProps> = ({
  loading,
  fileName,
  children,
}) => {
  return (
    <div className="w-[295px] min-w-[295px] px-[12px] border border-input py-[16px] rounded-[8px] relative">
      <div className="flex gap-[8px] items-center">
        <div className="rounded-[8px] relative w-[30px] h-[30px] flex justify-center items-center bg-[#FF5588]">
          {loading ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-75">
              <LoadingSpinner />
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
