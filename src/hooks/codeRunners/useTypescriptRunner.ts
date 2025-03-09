/* eslint-disable no-useless-catch */
import { useCallback, useEffect, useState } from "react";
import { loadTsCompilerSingleton } from "./singletons/loadTsCompilerSingleton";

const useTypeScriptRunner = () => {
  const [tsCompiler, setTsCompiler] = useState<any>(null);

  // Load the TypeScript compiler using the singleton loader
  useEffect(() => {
    loadTsCompilerSingleton()
      .then((ts) => {
        setTsCompiler(ts);
      })
      .catch((error) => {
        console.error("Failed to load TypeScript compiler:", error);
      });
  }, []);

  // Run the TypeScript code: transpile it to JS, execute it, and capture stdout
  const runCode = useCallback(
    async (code: string): Promise<string> => {
      if (!tsCompiler) {
        throw new Error("TypeScript compiler is not loaded yet.");
      }
      // Transpile TypeScript code to JavaScript
      const jsCode = tsCompiler.transpile(code);

      let capturedLogs: string[] = [];
      const originalConsoleLog = console.log;

      // Override console.log to capture output
      console.log = (...args: any[]) => {
        capturedLogs.push(
          args
            .map((arg) =>
              typeof arg === "object" ? JSON.stringify(arg) : String(arg)
            )
            .join("\n")
        );
        originalConsoleLog.apply(console, args);
      };

      let returnVal: any;
      try {
        const wrappedCode = wrapLastLineInConsoleLog(jsCode);
        const runFn = new Function(wrappedCode);
        returnVal = runFn();
      } catch (error) {
        throw error;
      } finally {
        // Always restore the original console.log even if an error occurs
        console.log = originalConsoleLog;
      }

      // Optionally capture the returned value if defined
      if (returnVal !== undefined) {
        capturedLogs.push(String(returnVal));
      }
      return capturedLogs.join("\n");
    },
    [tsCompiler]
  );

  return {
    loading: !tsCompiler,
    runCode,
  };
};

export default useTypeScriptRunner;

function wrapLastLineInConsoleLog(codeStr: string): string {
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
  let strippedLine = lastLine.trim();

  // Skip if already a console.log statement or if it's an empty/comment line.
  if (
    strippedLine.startsWith("console.log(") ||
    strippedLine === "" ||
    strippedLine.startsWith("//") ||
    strippedLine.startsWith("/*")
  ) {
    return codeStr;
  }

  // Remove trailing semicolon if present
  if (strippedLine.endsWith(";")) {
    strippedLine = strippedLine.slice(0, -1);
  }

  // Capture leading whitespace to preserve indentation.
  const leadingWhitespace = lastLine.match(/^\s*/)?.[0] || "";

  // Wrap the line in console.log() while preserving the original indentation.
  lines[lastNonEmptyIndex] = `${leadingWhitespace}console.log(${strippedLine})`;

  return lines.join("\n");
}
