import { Link } from "react-router-dom";
import SampleImageUpload from "../Sample/SampleImageUpload";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div className="p-[100px]">
      <Link to={`/personas/edit/ba4626c9-c385-48e9-b5f6-b80bcc8aefd9`}>
        edit persona
      </Link>
      <SampleImageUpload />
    </div>
  );
};
export default PracticePage;
// https://c08a1eeb-cb81-4c3c-9a11-f616ffd8e042.s3.us-east-1.amazonaws.com/d4cf21cf-f303-4aec-9a38-3fb472433122.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIATG6MGJ76MFBVY4PW%2F20250223%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250223T122838Z&X-Amz-Expires=86400&X-Amz-Signature=0ae99dde42e46ea85ac4e1ec8c04ebe28b2c8b29234811611d7c2e041464c01d&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject
