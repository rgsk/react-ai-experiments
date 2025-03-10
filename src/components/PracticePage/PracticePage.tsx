import { Maximize, RefreshCw, X } from "lucide-react";
import OpenInNewTabIcon from "../Icons/OpenInNewTabIcon";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div>
      <OpenInNewTabIcon size={20} />
      <Maximize size={20} />
      <X size={20} />
      <RefreshCw size={20} />
    </div>
  );
};
export default PracticePage;
