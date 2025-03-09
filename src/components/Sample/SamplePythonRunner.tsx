import { useState } from "react";
import useTypeScriptRunner from "~/hooks/codeRunners/useTypescriptRunner";
import { LoadingSpinner } from "../Shared/LoadingSpinner";
const code = `
const name: string = 32312 * 312312
console.log(name)
`;
interface SamplePythonRunnerProps {}
const SamplePythonRunner: React.FC<SamplePythonRunnerProps> = ({}) => {
  const { loading, runCode } = useTypeScriptRunner();
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
            const result = await runCode(code);
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
