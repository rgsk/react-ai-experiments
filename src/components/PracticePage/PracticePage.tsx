import PDFReader from "../Shared/PDFReader/PDFReader";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div className="p-[100px]">
      <div className="w-[50%] border border-red-400">
        <PDFReader
          pdfUrl={
            "https://c08a1eeb-cb81-4c3c-9a11-f616ffd8e042.s3.us-east-1.amazonaws.com/9936232d-abbb-4745-9fd8-fb4291a27392.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIATG6MGJ76MFBVY4PW%2F20250225%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250225T162703Z&X-Amz-Expires=86400&X-Amz-Signature=826477ca6f453111d89896084c23c4cd117f77c9ebda43fceeee6e13090bb0b1&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
          }
        />
      </div>
    </div>
  );
};
export default PracticePage;
