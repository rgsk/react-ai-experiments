let worker: Worker | null = null;
let workerLoadedPromise: Promise<void> | null = null;

export function loadPyodideWorker(): Promise<void> {
  if (workerLoadedPromise) {
    return workerLoadedPromise;
  }

  workerLoadedPromise = new Promise((resolve, reject) => {
    worker = new Worker(new URL("./pyodideWorker.js", import.meta.url));

    worker.addEventListener(
      "message",
      (event) => {
        if (
          event.data.type === "loaded" &&
          event.data.namespace === "pyodideWorker"
        ) {
          resolve();
        }
      },
      { once: true }
    );

    worker.addEventListener(
      "error",
      (error) => {
        reject(error);
      },
      { once: true }
    );

    worker.postMessage({ type: "load", namespace: "pyodideWorker" });
  });

  return workerLoadedPromise;
}

export function runPython(code: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!worker) {
      reject("Pyodide is not loaded yet.");
      return;
    }

    worker.addEventListener(
      "message",
      (event) => {
        if (event.data.namespace !== "pyodideWorker") return;

        if (event.data.type === "result") {
          resolve(event.data.result);
        } else if (event.data.type === "error") {
          reject(event.data.errorMessage);
        }
      },
      { once: true }
    );

    worker.postMessage({ type: "run", namespace: "pyodideWorker", code });
  });
}
