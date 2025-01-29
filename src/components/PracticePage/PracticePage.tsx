import useBroadcastChannelState from "~/hooks/useBroadcastChannelState";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  const [count, setCount] = useBroadcastChannelState("count", 1);
  return (
    <div>
      <p>Count: {count}</p>
      <button
        onClick={() => {
          if (count) {
            setCount(count + 1);
          }
        }}
      >
        increment
      </button>
    </div>
  );
};
export default PracticePage;
