import { Download, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import useMeasure from "react-use-measure";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import LoadingProgress from "../LoadingProgress";
import { LoadingSpinner } from "../LoadingSpinner";
const sampleS3Link =
  "https://c08a1eeb-cb81-4c3c-9a11-f616ffd8e042.s3.us-east-1.amazonaws.com/ddd9207b-333c-44c1-8393-b3cc5536f1c9.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIATG6MGJ76MFBVY4PW%2F20250225%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250225T155354Z&X-Amz-Expires=86400&X-Amz-Signature=16c32fc64549278b015309ade4230d185842c8e400139d07bd6670c9d1a78ccb&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject";
const sampleLink2 =
  "https://d2bps9p1kiy4ka.cloudfront.net/5eb393ee95fab7468a79d189/3f3577e6-d8ef-4d91-86b6-f6a6da63fbc9.pdf";
const sampleLink3 =
  "https://c08a1eeb-cb81-4c3c-9a11-f616ffd8e042.s3.us-east-1.amazonaws.com/9936232d-abbb-4745-9fd8-fb4291a27392.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIATG6MGJ76MFBVY4PW%2F20250225%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250225T162703Z&X-Amz-Expires=86400&X-Amz-Signature=826477ca6f453111d89896084c23c4cd117f77c9ebda43fceeee6e13090bb0b1&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject";
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
interface PDFReaderProps {
  pdfUrl: string;
  fileName?: string;
}
const PDFReader: React.FC<PDFReaderProps> = ({ pdfUrl, fileName }) => {
  const [numPages, setNumPages] = useState<number>();
  const loadingElement = () => (
    <div className="h-[50vh] flex justify-center items-center">
      <LoadingSpinner />
    </div>
  );
  const [scale, setScale] = useState(1);
  const [divRef, divBounds] = useMeasure();
  const [pdfProgressLoaded, setProgressPdfLoaded] = useState(0);
  const [pdfProgressTotal, setProgressTotal] = useState(0);
  if (!fileName) {
    fileName = pdfUrl?.split("/").pop();
    if (!fileName?.endsWith(".pdf")) {
      fileName = fileName + ".pdf";
    }
  }

  return (
    <div className="border border-muted-foreground rounded-lg overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-500">
        <p className="!text-white">{fileName}</p>
        <div className="flex gap-2 items-center">
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setScale((prev) => prev - 0.1);
            }}
          >
            <ZoomOut size={30} />
          </Button>
          <p className="!text-white">{(scale * 100).toFixed(0)}%</p>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setScale((prev) => prev + 0.1);
            }}
          >
            <ZoomIn size={30} />
          </Button>
          <a href={pdfUrl} download={fileName}>
            <Button size="icon" variant="outline">
              <Download size={30} />
            </Button>
          </a>
        </div>
      </div>
      <div ref={divRef}>
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
          }}
          loading={
            <div className="h-[50vh] flex justify-center items-center">
              {!!pdfProgressTotal && (
                <LoadingProgress
                  percentage={(pdfProgressLoaded / pdfProgressTotal) * 100}
                />
              )}
            </div>
          }
          onLoadProgress={({ loaded, total }) => {
            setProgressPdfLoaded(loaded);
            setProgressTotal(total);
          }}
        >
          {Array.from({ length: numPages ?? 0 }, (_, index) => {
            const page = index + 1;
            return (
              <div key={page}>
                <div className="flex justify-center">
                  <Page
                    width={divBounds.width}
                    pageNumber={page}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    loading={loadingElement}
                    scale={scale}
                  />
                </div>
                {page !== numPages && (
                  <Separator className="h-[1px] bg-black" />
                )}
              </div>
            );
          })}
        </Document>
      </div>
    </div>
  );
};
export default PDFReader;
