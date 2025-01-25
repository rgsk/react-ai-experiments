import axios from "axios";
import { useState } from "react";
import { v4 } from "uuid";
import experimentsService from "~/services/experimentsService";
interface SampleImageUploadProps {}
const SampleImageUpload: React.FC<SampleImageUploadProps> = ({}) => {
  const [imageUrl, setImageUrl] = useState<string>();
  const uploadFile = async (file: File) => {
    // Extract file extension
    const fileExtension = file.name.split(".").pop();
    const key = `${v4()}.${fileExtension}`;

    const { url: uploadUrl } = await experimentsService
      .getAWSUploadUrl({
        key: key,
      })
      .fn();
    await axios.put(uploadUrl, file);
    const { url: downloadUrl } = await experimentsService
      .getAWSDownloadUrl({ url: uploadUrl.split("?")[0] })
      .fn();
    setImageUrl(downloadUrl);
  };
  return (
    <div>
      <input
        type="file"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (file) {
            uploadFile(file);
          }
        }}
      />
      {imageUrl && <img src={imageUrl} alt="image url" width={400} />}
    </div>
  );
};
export default SampleImageUpload;
