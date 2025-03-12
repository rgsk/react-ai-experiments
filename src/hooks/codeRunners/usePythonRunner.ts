import { useCallback, useEffect, useState } from "react";
import { loadPyodideSingleton } from "./singletons/loadPyodideSingleton";
export const pythonImagePrefix = "data:image/png;base64,";
export const pythonCSVPrefix = "data:text/csv;";
const renderImageCode = `
import io
import base64
# Save the plot to a BytesIO buffer as a PNG image
buffer = io.BytesIO()
plt.savefig(buffer, format='png')
plt.close()  # Close the figure to free memory
buffer.seek(0)

# Encode the image in base64
img_base64 = base64.b64encode(buffer.read()).decode('utf-8')
img_src = f"${pythonImagePrefix}{img_base64}"
print(img_src)
`;

function replacePltShowWithRenderImageCode(codeStr: string): string {
  const lines = codeStr.split("\n");
  // Replace any line containing "plt.show()" with renderImageCode (trimmed to remove leading/trailing empty lines)
  const replacedLines = lines.map((line) => {
    if (line.includes("plt.show()")) {
      return renderImageCode.trim();
    }
    return line;
  });
  return replacedLines.join("\n");
}

const nameDelimiter = "<name>";
const lineDelimiter = "<line>";

const replaceToCsvWithEncodedString = (codeStr: string) => {
  return codeStr
    .replace(
      // Matches either a literal string or a variable as the file name argument:
      /(\w+)\.to_csv\(\s*(?:(['"])([^'"]+)\2|(\w+))\s*,?(.*?)\)/g,
      (match, dataVar, quote, fileNameLiteral, fileNameVar, args) => {
        let fileName;
        if (fileNameLiteral) {
          fileName = fileNameLiteral;
        } else if (fileNameVar) {
          // Try to find an assignment for the variable in the code
          const assignRegex = new RegExp(
            `${fileNameVar}\\s*=\\s*(['"])([^'"]+)\\1`
          );
          const assignMatch = codeStr.match(assignRegex);
          fileName = assignMatch ? assignMatch[2] : fileNameVar;
        } else {
          fileName = "output.csv";
        }
        const cleanedArgs = args.trim().replace(/^,/, "");
        return `
file_name = '${fileName}'
csv_data = ${dataVar}.to_csv(${cleanedArgs}).replace('\\n', '${lineDelimiter}')
single_line = f'${pythonCSVPrefix}{file_name}${nameDelimiter}{csv_data}'
print(single_line)
        `.trim();
      }
    )
    .replace(/(\w+)\.head\(\s*\d*\s*\)/g, (match, dataVar) =>
      `
file_name = 'head.csv'
csv_data = ${dataVar}.head().to_csv(index=False).replace('\\n', '${lineDelimiter}')
single_line = f'${pythonCSVPrefix}{file_name}${nameDelimiter}{csv_data}'
print(single_line)
      `.trim()
    );
};

export function getCSVContents(line: string) {
  if (!line.startsWith(pythonCSVPrefix)) {
    throw new Error(`doesn't starts with ${pythonCSVPrefix}`);
  }
  const content = line.slice(pythonCSVPrefix.length);
  const [fileName, rest] = content.split(nameDelimiter);
  const csvContent = rest.split(lineDelimiter).slice(0, -1).join("\n");
  return {
    fileName,
    csvContent,
  };
}

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

const usePythonRunner = () => {
  const [pyodide, setPyodide] = useState<any>(null);

  useEffect(() => {
    // Only call the singleton function
    loadPyodideSingleton()
      .then((pyodideModule) => {
        setPyodide(pyodideModule);
      })
      .catch((error) => {
        console.error("Failed to load Pyodide:", error);
      });
  }, []);

  // Run the Python code
  const runCode = useCallback(
    async (code: string) => {
      if (!pyodide) {
        throw new Error("Pyodide is not loaded yet.");
      }
      const result = await pyodide.runPythonAsync(
        codeWrapper(
          wrapLastLineInPrint(
            replaceToCsvWithEncodedString(
              replacePltShowWithRenderImageCode(code)
            )
          )
        )
      );
      return result;
    },
    [pyodide]
  );
  return {
    loading: !pyodide,
    runCode,
  };
};
export default usePythonRunner;
