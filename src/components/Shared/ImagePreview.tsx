import { useWindowSize } from "~/hooks/useWindowSize";
import SimpleModal from "./SimpleModal";

interface ImagePreviewProps {
  url: string;
  onClose: () => void;
}
const ImagePreview: React.FC<ImagePreviewProps> = ({ url, onClose }) => {
  const windowSize = useWindowSize();
  return (
    <div>
      <SimpleModal onClose={onClose} maxWidth={562}>
        <img
          src={url}
          alt={url}
          className="w-full object-contain object-top"
          style={{ maxHeight: windowSize.height * 0.85 }}
        />
      </SimpleModal>
    </div>
  );
};
export default ImagePreview;
