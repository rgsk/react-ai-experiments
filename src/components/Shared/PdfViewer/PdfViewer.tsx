/**
 * guide used for setting up
 * https://codesandbox.io/s/react-pdf-next-js-y4ev2
 */

import { useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Document, Page, pdfjs } from "react-pdf";

import { useWindowSize } from "~/hooks/useWindowSize";
import { LoadingSpinner } from "../LoadingSpinner";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface IPdfViewerProps {
  pdfUrl: string;
}
const PdfViewer: React.FC<IPdfViewerProps> = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState<number>();
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const windowSize = useWindowSize();

  const [pagesRendered, setPagesRendered] = useState(1);
  const [pdfProgressLoaded, setProgressPdfLoaded] = useState(0);
  const [pdfProgressTotal, setProgressTotal] = useState(0);

  useEffect(() => {
    // windowSize.width is used as dependency to ensure we change the scale on
    // orientation change
    const _ = [numPages, windowSize.width];
    setTimeout(() => {
      const container = containerRef.current;
      if (container) {
        // set scale so that pdf fits device width
        // landscape need not be handled separately
        // because in case of landscape container.clientWidth == container.scrollWidth
        // and scale will be set as 1
        setScale(container.clientWidth / container.scrollWidth);
      }
    }, 500); // timeout ensures that page is loaded before we set the scale
  }, [numPages, windowSize.width]);

  useEffect(() => {
    console.log({ scale });
  }, [scale]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {/* these classes are set to center the pdf */}
      {/* using flex justify-center was not working */}
      <div className="m-auto w-min">
        <Document
          file={pdfUrl}
          loading={
            <div className="pt-[10vh]">
              {!!pdfProgressTotal && (
                <CustomCircularProgressBar
                  percentage={(pdfProgressLoaded / pdfProgressTotal) * 100}
                />
              )}
            </div>
          }
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
          }}
          onLoadProgress={({ loaded, total }) => {
            setProgressPdfLoaded(loaded);
            setProgressTotal(total);
          }}
          // renderMode "svg" doesn't works on some pdfs
          // that's why setting below as "canvas" is important
          renderMode={"canvas"}
        >
          {Array.from({ length: pagesRendered }, (_, index) => {
            const page = index + 1;
            return (
              <Page
                key={page}
                pageNumber={page}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                scale={scale}
                onLoadSuccess={() => {
                  // we don't render all the pages at the start
                  // we load next page only after current page is loaded
                  setPagesRendered(Math.min(page + 1, numPages!));
                }}
                loading={
                  <div className="flex justify-center items-center h-[50vh]">
                    <LoadingSpinner color={"rgb(79 70 229)"} scale={3} />
                  </div>
                }
              />
            );
          })}
        </Document>
      </div>
    </div>
  );
};
export default PdfViewer;
const CustomCircularProgressBar = ({ percentage }: any) => {
  return (
    <div style={{ width: "50px" }}>
      <CircularProgressbar
        value={percentage}
        strokeWidth={10}
        styles={buildStyles({
          pathColor: `rgba(79, 70, 229)`,
          // textColor: '#f88',
          trailColor: "#d6d6d6",
        })}
      />
    </div>
  );
};
