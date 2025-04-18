import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useWindowSize } from "~/hooks/useWindowSize";

interface SimpleModalProps {
  onClose: () => void;
  children: any;
  maxWidth?: number;
  hideCloseIcon?: boolean;
}
const SimpleModal: React.FC<SimpleModalProps> = ({
  onClose,
  children,
  maxWidth = 300,
  hideCloseIcon,
}) => {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  const windowSize = useWindowSize();
  return (
    <div>
      <div className="fixed inset-0 z-[100]">
        <div
          className="fixed h-full w-full bg-[#000] bg-opacity-80"
          onClick={onClose}
        >
          {!hideCloseIcon && (
            <div className="flex justify-end">
              <button className="p-[20px]">
                <X className="text-white" />
              </button>
            </div>
          )}
        </div>
        <div
          className="flex items-center justify-center"
          style={{ height: windowSize.height }}
        >
          <div
            className="w-[80%] z-[1000] relative"
            style={{ maxWidth: maxWidth }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SimpleModal;
