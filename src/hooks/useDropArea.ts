import { useCallback, useRef, useState } from "react";

interface DropAreaOptions {
  onFilesChange: (files: File[]) => void;
  enabled?: boolean;
}

const useDropArea = ({ onFilesChange, enabled = true }: DropAreaOptions) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback(() => {
    if (!enabled) return;
    setIsDragging(true);
  }, [enabled]);

  const handleDragLeave = useCallback(() => {
    if (!enabled) return;
    setIsDragging(false);
  }, [enabled]);

  const handleDragOver = useCallback(
    (ev: React.DragEvent) => {
      if (!enabled) return;
      ev.preventDefault(); // Prevent default behavior (file being opened)
      setIsDragging(true);
    },
    [enabled]
  );
  const onFilesChangeRef = useRef(onFilesChange);
  onFilesChangeRef.current = onFilesChange;
  const handleDrop = useCallback(
    (ev: React.DragEvent) => {
      if (!enabled) return;
      ev.preventDefault();
      setIsDragging(false);
      if (ev.dataTransfer) {
        const { items, files: dataTransferFiles } = ev.dataTransfer;
        const files: File[] = [];

        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].kind === "file") {
              const file = items[i].getAsFile();
              if (file) {
                files.push(file);
              }
            }
          }
        } else {
          // Fallback for older browsers
          Array.from(dataTransferFiles).forEach((file) => {
            files.push(file);
          });
        }

        onFilesChangeRef.current(files);
      }
    },
    [enabled]
  );

  return {
    isDragging,
    dropAreaProps: {
      onDrop: handleDrop,
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
    },
  };
};

export default useDropArea;
