import { useEffect, useState } from "react";
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

  // Load Pyodide on component mount
  useEffect(() => {
    const initiate = async () => {
      const pyodideModule = await (window as any).loadPyodide();
      await pyodideModule.loadPackage(["numpy", "matplotlib"]);
      setPyodide(pyodideModule);
    };

    if (!(window as any).loadPyodide) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
      script.onload = initiate;
      document.body.appendChild(script);
    } else {
      initiate();
    }
  }, []);

  // Run the Python code
  const runCode = async (code: string) => {
    const result = await pyodide.runPythonAsync(
      codeWrapper(wrapLastLineInPrint(code))
    );
    return result;
  };
  return {
    loading: !pyodide,
    runCode,
  };
};
export default usePythonRunner;
