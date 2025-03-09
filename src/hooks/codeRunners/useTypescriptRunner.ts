/* eslint-disable no-useless-catch */
import { useEffect, useState } from "react";
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
  const runCode = async (code: string): Promise<string> => {
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
      const runFn = new Function(jsCode);
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
  };

  return {
    loading: !tsCompiler,
    runCode,
  };
};

export default useTypeScriptRunner;
