let worker: Worker | null = null;

export function loadPyodideWorker(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!worker) {
      worker = new Worker(new URL("./pyodideWorker.js", import.meta.url));

      worker.onmessage = (event) => {
        if (
          event.data.type === "loaded" &&
          event.data.namespace === "pyodideWorker"
        ) {
          resolve();
        }
      };

      worker.onerror = (error) => {
        reject(error);
      };

      worker.postMessage({ type: "load", namespace: "pyodideWorker" });
    } else {
      resolve();
    }
  });
}

export function runPython(code: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!worker) {
      reject("Pyodide is not loaded yet.");
      return;
    }

    worker.onmessage = (event) => {
      if (
        event.data.type === "result" &&
        event.data.namespace === "pyodideWorker"
      ) {
        resolve(event.data.result);
      } else if (
        event.data.type === "error" &&
        event.data.namespace === "pyodideWorker"
      ) {
        reject(event.data.errorMessage);
      }
    };

    worker.postMessage({ type: "run", namespace: "pyodideWorker", code });
  });
}
