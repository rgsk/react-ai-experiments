// loadTsCompilerSingleton.ts
let tsPromise: Promise<any> | null = null;

export function loadTsCompilerSingleton(): Promise<any> {
  if (tsPromise) {
    return tsPromise;
  }

  tsPromise = new Promise((resolve, reject) => {
    if (!(window as any).ts) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/typescript/4.9.5/typescript.min.js";
      script.onload = () => {
        if ((window as any).ts) {
          resolve((window as any).ts);
        } else {
          reject(new Error("TypeScript compiler did not load properly."));
        }
      };
      script.onerror = (err) => {
        reject(err);
      };
      document.body.appendChild(script);
    } else {
      resolve((window as any).ts);
    }
  });

  return tsPromise;
}
