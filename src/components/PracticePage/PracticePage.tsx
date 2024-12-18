import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "~/components/ui/button";
import { ModeToggle } from "../Shared/ModeToggle";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  const [count, setCount] = useState(1);
  return (
    <div>
      <div>
        <p>Practice Page</p>
        <Link to="/">Go To Home Page</Link>
      </div>
      <Button
        onClick={() => {
          setCount((prev) => prev + 1);
        }}
      >
        Count: {count}
      </Button>
      <ModeToggle />
    </div>
  );
};
export default PracticePage;
