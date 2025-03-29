import { useCallback, useEffect, useState } from "react";
import { fetchCSV } from "~/lib/utils";
import {
  loadPyodideWorker,
  runPython,
} from "./singletons/loadPyodideSingleton";
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
      // Matches either a literal string or a variable as the file name argument,
      // and captures any additional arguments until the closing parenthesis.
      /(\w+)\.to_csv\(\s*(?:(['"])([^'"]+)\2|(\w+))\s*(?:,([^)]*))?\)/g,
      (match, dataVar, quote, fileNameLiteral, fileNameVar, args) => {
        let fileName;
        let fileNameQuoted; // flag whether to quote the file name in output
        if (fileNameLiteral) {
          fileName = fileNameLiteral;
          fileNameQuoted = true;
        } else if (fileNameVar) {
          // Try to find an assignment for the variable in the code.
          const assignRegex = new RegExp(
            `${fileNameVar}\\s*=\\s*(['"])([^'"]+)\\1`
          );
          const assignMatch = codeStr.match(assignRegex);
          if (assignMatch) {
            fileName = assignMatch[2];
            fileNameQuoted = true;
          } else {
            // If no assignment is found, pass the undefined variable as-is.
            fileName = fileNameVar;
            fileNameQuoted = false;
          }
        } else {
          fileName = "output.csv";
          fileNameQuoted = true;
        }
        const cleanedArgs = args ? args.trim().replace(/^,/, "") : "";
        return `
file_name = ${fileNameQuoted ? `'${fileName}'` : fileName}
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

const replaceUrlWithCsvString = async (codeStr: string) => {
  const regex = /(\w+)\s*=\s*pd\.read_csv\(\s*(\w+|['"]([^'"]+)['"])\s*\)/g;

  let modifiedCode = codeStr;

  // Process matches synchronously to extract URLs
  const matches = [...codeStr.matchAll(regex)];
  for (const match of matches) {
    const [fullMatch, leftSide, variable, directUrl] = match;
    let url;

    if (directUrl) {
      url = directUrl;
    } else {
      // Extract the value of the variable from the codeStr
      const urlRegex = new RegExp(`\\b${variable}\\s*=\\s*['"]([^'"]+)['"]`);
      const urlMatch = codeStr.match(urlRegex);
      if (urlMatch) {
        url = urlMatch[1];
      } else {
        continue; // Skip if URL variable is not found
      }
    }

    const csvContent = await fetchCSV(url);
    const replacement = `
from io import StringIO
csv_content = """${csvContent}"""
csv_data = StringIO(csv_content)
${leftSide} = pd.read_csv(csv_data)`.trim();

    modifiedCode = modifiedCode.replace(fullMatch, replacement);
  }

  return modifiedCode;
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

  // Remove trailing empty lines
  while (lines.length && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
  if (lines.length === 0) return codeStr;

  // Check for a multi-line print block by counting parentheses
  let inPrintCall = false;
  let parenBalance = 0;
  for (const line of lines) {
    // Check if this line starts a print statement
    if (line.includes("print(")) {
      inPrintCall = true;
    }
    for (const char of line) {
      if (char === "(") parenBalance++;
      if (char === ")") parenBalance--;
    }
  }
  // If we detected a print and the parentheses are balanced, assume the print is complete
  if (inPrintCall && parenBalance === 0) {
    return codeStr;
  }

  // Otherwise, wrap the last line
  const lastIndex = lines.length - 1;
  const lastLine = lines[lastIndex];
  const strippedLine = lastLine.trim();

  // Skip if the last line is empty or a comment
  if (strippedLine === "" || strippedLine.startsWith("#")) {
    return codeStr;
  }

  const leadingWhitespace = lastLine.match(/^\s*/)?.[0] || "";
  lines[lastIndex] = `${leadingWhitespace}print(${strippedLine})`;

  return lines.join("\n");
}

const codeWrapper = (code: string) => {
  return `
import matplotlib
matplotlib.use("Agg")  # Set backend to avoid GUI-related errors

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await loadPyodideWorker();
      setLoading(false);
    })();
  }, []);

  // Run the Python code
  const runCode = useCallback(
    async (code: string) => {
      if (loading) {
        throw new Error("Pyodide is not loaded yet.");
      }
      try {
        const result = await runPython(
          codeWrapper(
            wrapLastLineInPrint(
              replaceToCsvWithEncodedString(
                await replaceUrlWithCsvString(
                  replacePltShowWithRenderImageCode(code)
                )
              )
            )
          )
        );
        return result;
      } catch (errorMessage: any) {
        throw new Error(errorMessage);
      }
    },
    [loading]
  );
  return {
    loading: loading,
    runCode,
  };
};
export default usePythonRunner;
