/* eslint-disable no-useless-catch */

const useJavascriptRunner = () => {
  // Run the TypeScript code: transpile it to JS, execute it, and capture stdout
  const runCode = async (code: string): Promise<string> => {
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
      const runFn = new Function(code);
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
    loading: false,
    runCode,
  };
};

export default useJavascriptRunner;
