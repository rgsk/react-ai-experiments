import { useRef } from "react";

interface FileInputTriggerProps {
  component: (onClick: () => void) => any;
  handleFilesChange: (files: File[]) => void;
}
const FileInputTrigger: React.FC<FileInputTriggerProps> = ({
  component,
  handleFilesChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      {component(() => {
        const inputElement = inputRef.current;
        if (inputElement) {
          inputElement.click();
        }
      })}
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files) {
            handleFilesChange(files as any);
          }
        }}
      />
    </div>
  );
};
export default FileInputTrigger;
