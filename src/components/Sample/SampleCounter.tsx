import useBroadcastChannelState from "~/hooks/useBroadcastChannelState";
import { Button } from "../ui/button";

interface SampleCounterProps {}
const SampleCounter: React.FC<SampleCounterProps> = ({}) => {
  const [count, setCount] = useBroadcastChannelState("count", 1);
  return (
    <div>
      <Button
        onClick={() => {
          setCount((count ?? 0) + 1);
        }}
      >
        Count: {count}
      </Button>
    </div>
  );
};
export default SampleCounter;
