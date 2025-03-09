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

// loadPyodideSingleton.ts
let pyodidePromise: Promise<any> | null = null;

function loadPyodideSingleton(): Promise<any> {
  if (pyodidePromise) {
    return pyodidePromise;
  }

  pyodidePromise = new Promise((resolve, reject) => {
    // Check if the script is already present in the DOM
    if (!(window as any).loadPyodide) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
      script.onload = async () => {
        try {
          const pyodideModule = await (window as any).loadPyodide();
          await pyodideModule.loadPackage(["numpy", "matplotlib"]);
          resolve(pyodideModule);
        } catch (e) {
          reject(e);
        }
      };
      script.onerror = (err) => {
        reject(err);
      };
      document.body.appendChild(script);
    }
  });

  return pyodidePromise;
}

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
  const runCode = async (code: string) => {
    if (!pyodide) {
      throw new Error("Pyodide is not loaded yet.");
    }
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
