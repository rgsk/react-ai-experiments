import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Link } from "react-router-dom";
import SampleImageUpload from "../Sample/SampleImageUpload";
import { LoadingSpinner } from "../Shared/LoadingSpinner";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div className="p-[100px]">
      <SampleImageUpload />
      <Link to={`/personas/edit/ba4626c9-c385-48e9-b5f6-b80bcc8aefd9`}>
        edit persona
      </Link>
      <div className="w-[20px]">
        <CircularProgressbar
          value={70}
          counterClockwise
          strokeWidth={10}
          styles={buildStyles({
            pathColor: "#fff",
            trailColor: "#808080",
          })}
        />
      </div>
      <div>
        <LoadingSpinner />
      </div>
    </div>
  );
};
export default PracticePage;
