/* eslint-disable no-useless-catch */
import { useEffect, useState } from "react";

const useTypeScriptRunner = () => {
  const [tsCompiler, setTsCompiler] = useState<any>(null);

  // Load the TypeScript compiler on component mount
  useEffect(() => {
    const initiate = async () => {
      if (!(window as any).ts) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/typescript/4.9.5/typescript.min.js";
        script.onload = () => {
          setTsCompiler((window as any).ts);
        };
        document.body.appendChild(script);
      } else {
        setTsCompiler((window as any).ts);
      }
    };

    initiate();
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
