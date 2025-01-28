import SampleWebTranscriptionWithHook from "../Sample/SampleWebTranscriptionWithHook";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div>
      <h1>Practice Page</h1>
      <SampleWebTranscriptionWithHook />
    </div>
  );
};
export default PracticePage;
