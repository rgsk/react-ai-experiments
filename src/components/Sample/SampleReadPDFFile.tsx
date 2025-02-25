import { useState } from "react";
import readPdfFile from "~/lib/readPdfFile";
import { Label } from "../ui/label";

interface SampleReadPDFFileProps {}
const SampleReadPDFFile: React.FC<SampleReadPDFFileProps> = ({}) => {
  const [pdfText, setPdfText] = useState("");
  return (
    <div className="p-[100px]">
      <input
        type="file"
        accept="application/pdf"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            try {
              const text = await readPdfFile(file);
              setPdfText(text);
            } catch (err: any) {
              alert(err.message);
            }
          }
        }}
      />
      <div>
        <div className="my-[20px]">
          <Label>Extracted Text: </Label>
        </div>
        <pre className="whitespace-pre-wrap">{pdfText}</pre>
      </div>
    </div>
  );
};
export default SampleReadPDFFile;
