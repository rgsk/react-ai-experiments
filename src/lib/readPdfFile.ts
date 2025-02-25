import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const readPdfFile = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    // Ensure it's a PDF
    if (file.type !== "application/pdf") {
      return reject(new Error("Please select a valid PDF file."));
    }

    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedArray = new Uint8Array(this.result as any);
      const pdf = await pdfjs.getDocument(typedArray).promise;
      let text = "";

      // Loop through all pages
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const strings = content.items.map((item) => (item as any).str);
        text += strings.join(" ") + "\n\n";
      }
      return resolve(text);
    };

    fileReader.readAsArrayBuffer(file);
  });
};

export default readPdfFile;
