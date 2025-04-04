import useLocalStorageState from "~/hooks/useLocalStorageState";
import { Button } from "../ui/button";

interface SampleCounterProps {}
const SampleCounter: React.FC<SampleCounterProps> = ({}) => {
  const [count, setCount] = useLocalStorageState("count", {
    value: 1,
  });
  return (
    <div>
      <Button
        onClick={() => {
          setCount((prev) => {
            return { value: (prev?.value ?? 0) + 1 };
          });
        }}
      >
        Count: {count?.value}
      </Button>
    </div>
  );
};
export default SampleCounter;
