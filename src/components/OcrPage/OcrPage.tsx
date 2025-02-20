import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
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
  const imageUrlValid = useMemo(
    () => z.string().url().safeParse(imageUrl).success,
    [imageUrl]
  );
  const ocrImageQueryResult = useQuery({
    queryKey: ocrImageQuery.key,
    queryFn: ocrImageQuery.fn,
    enabled: imageUrlValid,
  });
  useEffect(() => {
    if (imageUrlValid) {
      const imageFileInput = imageFileInputRef.current;
      if (imageFileInput) {
        imageFileInput.value = "";
      }
    }
  }, [imageUrlValid]);
  const ocrFileMutationResult = useMutation({
    mutationFn: (file: File) => {
      return experimentsService.ocrFile(file);
    },
    onMutate: () => {
      setImageUrl("");
    },
  });

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
    <div className="p-[32px]">
      <h1 className="text-3xl">OCR Image</h1>
      <div className="mt-3 space-y-2">
        <Label>Enter Image URL or Select Image File</Label>
        <Input
          placeholder="image url"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
          }}
        />
        {imageUrl && !imageUrlValid && (
          <p className="text-red-400">image url is invalid</p>
        )}
        <p>or</p>
        <Input
          ref={imageFileInputRef}
          type="file"
          accept="image/*"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (file) {
              ocrFileMutationResult.mutate(file);
            }
          }}
        />
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
