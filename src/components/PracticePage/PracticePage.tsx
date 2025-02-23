import { Link } from "react-router-dom";
import SampleForm from "../Sample/SampleForm";
import SampleImageUpload from "../Sample/SampleImageUpload";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div className="p-[100px]">
      <SampleImageUpload />
      <Link to={`/personas/edit/ba4626c9-c385-48e9-b5f6-b80bcc8aefd9`}>
        edit persona
      </Link>
      <SampleForm />
    </div>
  );
};
export default PracticePage;
