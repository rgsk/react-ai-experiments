import { useCallback } from "react";
import usePythonRunner from "./usePythonRunner";
import useTypeScriptRunner from "./useTypescriptRunner";
export const codeRunnerSupportedLanguages = [
  "node",
  "javascript",
  "python",
  "typescript",
] as const;
export type CodeRunnerSupportedLanguages =
  (typeof codeRunnerSupportedLanguages)[number];
const useCodeRunners = () => {
  const { loading: pythonRunnerLoading, runCode: runPythonCode } =
    usePythonRunner();
  const { loading: typeScriptRunnerLoading, runCode: runTypescriptCode } =
    useTypeScriptRunner();
  const loading = pythonRunnerLoading || typeScriptRunnerLoading;
  const runCode = useCallback(
    async ({
      code,
      language,
    }: {
      code: string;
      language: CodeRunnerSupportedLanguages;
    }) => {
      console.log({ code, language });
      if (loading) {
        throw new Error("code runners are loading");
      }
      if (language === "python") {
        return runPythonCode(code);
      } else if (
        language === "node" ||
        language === "javascript" ||
        language === "typescript"
      ) {
        return runTypescriptCode(code);
      }
    },
    [loading, runPythonCode, runTypescriptCode]
  );
  return {
    loading: loading,
    runCode,
  };
};
export default useCodeRunners;
