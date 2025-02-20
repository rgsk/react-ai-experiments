import { CloseCircle } from "iconsax-react";
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
        <button onClick={onRemove}>
          <CloseCircle
            size={20}
            color="#030a21"
            className="bg-white rounded-full"
          />
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
    <div className="bg-[#F7F7F8] min-w-[295px] px-[12px] border border-[#030A2133] py-[16px] rounded-[8px] relative">
      <div className="flex gap-[8px] items-center">
        <div className="rounded-[8px] relative w-[30px] h-[30px] flex justify-center items-center border border-foreground bg-white">
          {loading ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-75">
              <LoadingSpinner />
            </div>
          ) : (
            fileIcons.document
          )}
        </div>
        <p className="text-[14px] font-medium text-ellipsis overflow-hidden whitespace-nowrap">
          {file.name}
        </p>
        {renderCloseButton()}
      </div>
    </div>
  );
};
export default FileUploadedPreview;
