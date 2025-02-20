import { useMutation, useQuery } from "@tanstack/react-query";
import { Paperclip } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import useDropArea from "~/hooks/useDropArea";
import experimentsService from "~/services/experimentsService";
import { LoadingSpinner } from "../Shared/LoadingSpinner";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface OcrPageProps {}
const OcrPage: React.FC<OcrPageProps> = ({}) => {
  const [imageUrl, setImageUrl] = useState("");
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const ocrImageQuery = useMemo(() => {
    return experimentsService.ocrImage({ imageUrl });
  }, [imageUrl]);
  const [selectedFile, setSelectedFile] = useState<File>();
  const selectedFileUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : undefined),
    [selectedFile]
  );
  const { isDragging, dropAreaProps } = useDropArea({
    onFilesChange: (files) => {
      setSelectedFile(files[0]);
    },
  });
  const imageUrlValid = useMemo(
    () => z.string().url().safeParse(imageUrl).success,
    [imageUrl]
  );
  const ocrImageQueryResult = useQuery({
    queryKey: ocrImageQuery.key,
    queryFn: ocrImageQuery.fn,
    enabled: imageUrlValid,
  });

  const ocrFileMutationResult = useMutation({
    mutationFn: (file: File) => {
      return experimentsService.ocrFile(file);
    },
    onMutate: () => {
      setImageUrl("");
    },
  });

  const ocrFileMutationResultMutate = ocrFileMutationResult.mutate;

  useEffect(() => {
    if (selectedFile) {
      ocrFileMutationResultMutate(selectedFile);
    }
  }, [ocrFileMutationResultMutate, selectedFile]);

  useEffect(() => {
    if (ocrImageQueryResult.data?.text) {
      setText(ocrImageQueryResult.data.text);
    }
  }, [ocrImageQueryResult.data?.text]);
  useEffect(() => {
    if (ocrFileMutationResult.data?.text) {
      setText(ocrFileMutationResult.data.text);
    }
  }, [ocrFileMutationResult.data?.text]);
  return (
    <div
      className="p-[32px] relative h-screen overflow-auto"
      {...dropAreaProps}
    >
      {isDragging && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="text-gray-100 text-center">
            <p className="text-[18px] font-bold">Add anything</p>
            <p className="text-[14px]">
              Drop any file here to add it to the conversation
            </p>
          </div>
        </div>
      )}
      <h1 className="text-3xl">OCR Image</h1>
      <div className="mt-3 space-y-2">
        <Label>Enter Image URL or Paste Image or Add Attachment</Label>
        <Input
          placeholder="image url"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
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
              setSelectedFile(files[0]);
            }
          }}
        />
        {imageUrl && !imageUrlValid && (
          <p className="text-red-400">image url is invalid</p>
        )}
        <button
          onClick={() => {
            const imageFileInput = imageFileInputRef.current;
            if (imageFileInput) {
              imageFileInput.click();
            }
          }}
        >
          <Paperclip />
        </button>
        <input
          ref={imageFileInputRef}
          className="hidden"
          type="file"
          accept="image/*"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (file) {
              setSelectedFile(file);
            }
          }}
        />
      </div>
      <div>
        <img src={imageUrl || selectedFileUrl} alt="" className="w-[50vw]" />
      </div>
      <div className="h-[20px]"></div>
      {ocrImageQueryResult.isLoading || ocrFileMutationResult.isPending ? (
        <LoadingSpinner />
      ) : (
        <div>
          <p>Text: </p>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
};
export default OcrPage;
