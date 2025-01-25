import useJsonData from "~/hooks/useJsonData";
import { Button } from "../ui/button";

interface SampleJsonDataProps {}
const SampleJsonData: React.FC<SampleJsonDataProps> = ({}) => {
  const [count, setCount] = useJsonData("count", 1);
  return (
    <div>
      <p>Count: {count}</p>
      <Button
        onClick={() => {
          setCount((prev) => (prev ?? 0) + 1);
        }}
      >
        Increment
      </Button>
    </div>
  );
};
export default SampleJsonData;
