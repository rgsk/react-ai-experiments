interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div>
      <p>hii</p>
      <App />
    </div>
  );
};
export default PracticePage;

import React, { useState } from "react";
import { addStyles, EditableMathField, StaticMathField } from "react-mathquill";
import { Button } from "../ui/button";

// inserts the required css to the <head> block.
// you can skip this, if you want to do that by yourself.
addStyles();

const EditableMathExample = () => {
  const [latex, setLatex] = useState("\\frac{1}{\\sqrt{2}}\\cdot 2");

  return (
    <div>
      <EditableMathField
        latex={latex}
        onChange={(mathField) => {
          setLatex(mathField.latex());
        }}
      />
      <p>{latex}</p>
      <StaticMathField>{latex}</StaticMathField>
      <Button>Execute</Button>
    </div>
  );
};

const StaticMathExample = () => {
  return <StaticMathField>{"\\frac{1}{\\sqrt{2}}\\cdot 2"}</StaticMathField>;
};

const App = () => (
  <div>
    <h2>Editable Math Field</h2>
    <EditableMathExample />
    <br />
    <h2>Static Math Field</h2>
    <StaticMathExample />
  </div>
);
