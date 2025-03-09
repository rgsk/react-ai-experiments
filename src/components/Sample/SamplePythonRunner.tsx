import { useState } from "react";
import useCodeRunners from "~/hooks/codeRunners/useCodeRunners";
import { LoadingSpinner } from "../Shared/LoadingSpinner";
const code = `
name = 32312 * 312312
names
`;
interface SamplePythonRunnerProps {}
const SamplePythonRunner: React.FC<SamplePythonRunnerProps> = ({}) => {
  const { loading, runCode } = useCodeRunners();
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <div>
      <button
        onClick={async () => {
          try {
            const result = await runCode({ language: "python", code });
            setOutput(result);
          } catch (err: any) {
            setError(err.message);
          }
        }}
      >
        Click me
      </button>
      {output && (
        <div>
          <p>Output:</p>
          <pre>{output}</pre>
        </div>
      )}
      {error && (
        <div>
          <p>Error:</p> <p>{error}</p>
        </div>
      )}
    </div>
  );
};
export default SamplePythonRunner;
