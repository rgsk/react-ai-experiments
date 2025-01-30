import SampleCounter from "../Sample/SampleCounter";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div>
      <SampleCounter />
      <SampleCounter />
    </div>
  );
};
export default PracticePage;
