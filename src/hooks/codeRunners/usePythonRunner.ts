import { useCallback, useEffect, useState } from "react";
import { loadPyodideSingleton } from "./singletons/loadPyodideSingleton";
function wrapLastLineInPrint(codeStr: string): string {
  const lines = codeStr.split("\n");
  if (lines.length === 0) return codeStr;

  // Find the last non-empty line
  let lastNonEmptyIndex = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() !== "") {
      lastNonEmptyIndex = i;
      break;
    }
  }

  if (lastNonEmptyIndex === -1) return codeStr; // All lines are empty

  const lastLine = lines[lastNonEmptyIndex];
  const strippedLine = lastLine.trim();

  // Skip if already a print statement or empty/comment
  if (
    strippedLine.startsWith("print(") ||
    strippedLine === "" ||
    strippedLine.startsWith("#")
  ) {
    return codeStr;
  }

  // Capture leading whitespace (preserve indentation)
  const leadingWhitespace = lastLine.match(/^\s*/)?.[0] || "";

  // Wrap in print() while preserving whitespace
  lines[lastNonEmptyIndex] = `${leadingWhitespace}print(${strippedLine})`;

  return lines.join("\n");
}

const codeWrapper = (code: string) => {
  return `
import sys
from io import StringIO

output = StringIO()
sys.stdout = output

${code}

# Reset stdout so further prints go to the console.
sys.stdout = sys.__stdout__
output.getvalue()
`;
};

const usePythonRunner = () => {
  const [pyodide, setPyodide] = useState<any>(null);

  useEffect(() => {
    // Only call the singleton function
    loadPyodideSingleton()
      .then((pyodideModule) => {
        setPyodide(pyodideModule);
      })
      .catch((error) => {
        console.error("Failed to load Pyodide:", error);
      });
  }, []);

  // Run the Python code
  const runCode = useCallback(
    async (code: string) => {
      if (!pyodide) {
        throw new Error("Pyodide is not loaded yet.");
      }
      const result = await pyodide.runPythonAsync(
        codeWrapper(wrapLastLineInPrint(code))
      );
      return result;
    },
    [pyodide]
  );
  return {
    loading: !pyodide,
    runCode,
  };
};
export default usePythonRunner;
