import SampleTextStream from "../Sample/SampleTextStream";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div>
      <h1>Practice Page</h1>
      <SampleTextStream />
    </div>
  );
};
export default PracticePage;
