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

const sampleGraphCode = `
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.plot(x, y)
plt.xlabel("X Axis")
plt.ylabel("Y Axis")
plt.title("Sine Wave")

import io, base64
buf = io.BytesIO()
plt.savefig(buf, format="png")
buf.seek(0)
"data:image/png;base64," + base64.b64encode(buf.read()).decode()
`;
import { useEffect, useState } from "react";

const SamplePyodideRunner = () => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [code, setCode] = useState("print('Hello from Pyodide!')");
  const [output, setOutput] = useState("");

  // Load Pyodide on component mount
  useEffect(() => {
    const loadPyodide = async () => {
      const pyodideModule = await (window as any).loadPyodide();
      await pyodideModule.loadPackage(["numpy", "matplotlib"]);
      setPyodide(pyodideModule);
    };

    if (!(window as any).loadPyodide) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
      script.onload = loadPyodide;
      document.body.appendChild(script);
    } else {
      loadPyodide();
    }
  }, []);

  // Run the Python code
  const runPython = async () => {
    if (!pyodide) {
      setOutput("Pyodide is still loading...");
      return;
    }

    try {
      const result = await pyodide.runPythonAsync(
        codeWrapper(wrapLastLineInPrint(code))
      );
      console.log({ result });
      setOutput(result);
    } catch (error: any) {
      setOutput(error.toString());
    }
  };

  return (
    <div
      style={{ maxWidth: "600px", margin: "20px auto", textAlign: "center" }}
    >
      <h2>Python Runner (Pyodide)</h2>
      <textarea
        rows={5}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Write Python code here..."
      />
      <br />
      <button
        onClick={runPython}
        style={{ marginTop: "10px", padding: "5px 10px" }}
      >
        Run Python
      </button>
      <h3>Output:</h3>
      <pre style={{ background: "#f4f4f4", padding: "10px" }}>{output}</pre>
      {output.startsWith("data:image/png;base64,") && (
        <img src={output} alt="Generated Plot" style={{ maxWidth: "100%" }} />
      )}
    </div>
  );
};
export default SamplePyodideRunner;
