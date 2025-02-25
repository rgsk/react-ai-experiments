import { useSearchParams } from "react-router-dom";
import environmentVars from "~/lib/environmentVars";
import { getFilenameFromUrl } from "~/lib/pageUtils";
import { encodeQueryParams } from "~/lib/utils";
import PDFReader from "../Shared/PDFReader/PDFReader";
import { Button } from "../ui/button";

interface PDFPageProps {}
const PDFPage: React.FC<PDFPageProps> = ({}) => {
  const [searchParams] = useSearchParams();
  const pdfUrl = searchParams?.get("url");

  if (!pdfUrl) {
    return <p>No PDF URL found</p>;
  }
  return (
    <div>
      <a
        href={`${
          environmentVars.NODE_EXPERIMENTS_SERVER_URL
        }/experiments/file-download-url?${encodeQueryParams({
          url: pdfUrl,
          filename: getFilenameFromUrl(pdfUrl),
        })}`}
        download={true}
      >
        <Button>Download</Button>
      </a>
      <div className="max-w-[800px] mx-auto">
        <PDFReader pdfUrl={pdfUrl} />
      </div>
    </div>
  );
};
export default PDFPage;
