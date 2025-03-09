import { useState } from "react";
import SamplePythonRunner from "../Sample/SamplePythonRunner";
import { Button } from "../ui/button";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <SamplePythonRunner />
      <Button onClick={() => setShow(true)}>Show</Button>
      {show && <SamplePythonRunner />}
    </div>
  );
};
export default PracticePage;
