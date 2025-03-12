import SampleCsvRenderer from "../Sample/SampleCsvRenderer";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div className="messageContent">
      <SampleCsvRenderer />
    </div>
  );
};
export default PracticePage;
