self.onmessage = async (event) => {
  const { type, namespace, code } = event.data;

  if (type === "load" && namespace === "pyodideWorker") {
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js");
    self.pyodide = await loadPyodide();
    await self.pyodide.loadPackage([
      "numpy",
      "matplotlib",
      "scipy",
      "scikit-learn",
      "pandas",
    ]);
    self.postMessage({ type: "loaded", namespace: "pyodideWorker" });
  } else if (type === "run" && namespace === "pyodideWorker") {
    try {
      const result = self.pyodide.runPython(code);
      self.postMessage({ type: "result", namespace: "pyodideWorker", result });
    } catch (error) {
      self.postMessage({
        type: "error",
        namespace: "pyodideWorker",
        errorMessage: error.message,
      });
    }
  }
};
