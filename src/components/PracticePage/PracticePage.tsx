import { Skeleton } from "../ui/skeleton";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div className="p-[100px]">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="rounded-full h-[20px] w-1/2" />
        <Skeleton className="rounded-full h-[20px]" />
        <Skeleton className="rounded-full h-[20px]" />
      </div>
    </div>
  );
};
export default PracticePage;
