import { Download } from "lucide-react";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface CsvRendererProps {
  file: File;
}
const CsvRenderer = ({ file }: CsvRendererProps) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    Papa.parse(file, {
      complete: (result) => setData(result.data),
      header: true,
    });
  }, [file]);

  const downloadCsv = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = file.name || "data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <p>{file.name}</p>
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            downloadCsv();
          }}
        >
          <Download size={30} />
        </Button>
      </div>
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
