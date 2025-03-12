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
      <img src={`https://www.google.com/s2/favicons?domain=www.facebook.com`} />
      <img
        src={`https://www.google.com/s2/favicons?domain=www.instagram.com`}
      />
      <img
        src={`https://www.google.com/s2/favicons?domain=www.hindustantimes.com`}
      />
    </div>
  );
};
export default PracticePage;
