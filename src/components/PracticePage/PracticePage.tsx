import SampleImageUpload from "../Sample/SampleImageUpload";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div className="p-[100px]">
      <SampleImageUpload />
    </div>
  );
};
export default PracticePage;
