import SimpleModal from "./SimpleModal";

interface ImagePreviewProps {
  url: string;
  onClose: () => void;
}
const ImagePreview: React.FC<ImagePreviewProps> = ({ url, onClose }) => {
  return (
    <div>
      <SimpleModal onClose={onClose} maxWidth={562}>
        <img
          src={url}
          alt={url}
          className="w-full max-h-[85vh] object-contain"
        />
      </SimpleModal>
    </div>
  );
};
export default ImagePreview;
