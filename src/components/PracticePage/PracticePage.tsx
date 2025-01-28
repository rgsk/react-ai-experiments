import SampleRealtimeWebRTC from "../Sample/SampleRealtimeWebRTC";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div>
      <h1>Practice Page</h1>
      <SampleRealtimeWebRTC
        initialMessages={[
          {
            role: "user",
            content: "What is the meaning of life?",
          },
          {
            role: "assistant",
            content: "There is no meaning to life",
          },
          {
            role: "user",
            content: "Who is Steve Jobs?",
          },
          // {
          //   role: "assistant",
          //   content:
          //     "Steve Jobs was an American business magnate, industrial designer, and investor. He was the co-founder, chairman, and CEO of Apple Inc.",
          // },
        ]}
      />
    </div>
  );
};
export default PracticePage;
