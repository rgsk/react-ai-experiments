import { Download } from "lucide-react";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { LoadingSpinner } from "./LoadingSpinner";

interface CsvRendererProps {
  file?: File;
  url?: string;
  fileName?: string;
}

const CsvRenderer = ({ file, url, fileName }: CsvRendererProps) => {
  const [data, setData] = useState<any[]>([]);
  if (!fileName) {
    fileName = file?.name || url?.split("/").pop() || "data.csv";
  }
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (file) {
      setLoading(false);
      // Handle File Input
      Papa.parse(file, {
        complete: (result) => setData(result.data),
        header: true,
      });
    } else if (url) {
      // Handle URL Input
      fetch(url)
        .then((response) => response.text())
        .then((csvText) => {
          setLoading(false);
          Papa.parse(csvText, {
            complete: (result) => setData(result.data),
            header: true,
          });
        })
        .catch((error) => console.error("Error fetching CSV:", error));
    }
  }, [file, url]);

  const downloadCsv = () => {
    let downloadUrl;
    if (url) {
      downloadUrl = url;
    } else {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: "text/csv" });
      downloadUrl = URL.createObjectURL(blob);
    }

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <p>{fileName}</p>
        <Button size="icon" variant="outline" onClick={downloadCsv}>
          <Download size={30} />
        </Button>
      </div>
      {loading && <LoadingSpinner size={20} />}
      <div className="messageContent">
        {data.length > 0 && (
          <table>
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value: any, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CsvRenderer;
