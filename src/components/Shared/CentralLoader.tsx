import { LoadingSpinner } from "./LoadingSpinner";

interface CentralLoaderProps {}
const CentralLoader: React.FC<CentralLoaderProps> = ({}) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
};
export default CentralLoader;
