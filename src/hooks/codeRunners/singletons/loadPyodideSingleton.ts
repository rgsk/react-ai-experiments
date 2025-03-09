// loadPyodideSingleton.ts
let pyodidePromise: Promise<any> | null = null;

export function loadPyodideSingleton(): Promise<any> {
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
    } else {
      // If the script is already loaded, use it directly.
      (window as any)
        .loadPyodide()
        .then(async (pyodideModule: any) => {
          await pyodideModule.loadPackage(["numpy", "matplotlib"]);
          resolve(pyodideModule);
        })
        .catch(reject);
    }
  });

  return pyodidePromise;
}
