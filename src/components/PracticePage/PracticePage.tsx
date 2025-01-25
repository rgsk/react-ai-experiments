import SampleJsonData from "../Sample/SampleJsonData";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div>
      <h1>Practice Page</h1>
      <SampleJsonData />
    </div>
  );
};
export default PracticePage;
