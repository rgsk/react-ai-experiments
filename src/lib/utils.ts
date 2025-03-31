import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import JSON5 from "json5";
import { twMerge } from "tailwind-merge";
import environmentVars from "./environmentVars";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const encodeQueryParams = (
  params: Record<
    string,
    string | number | boolean | undefined | (string | number | boolean)[]
  >
): string => {
  return Object.entries(params)
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(
          (val) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(val.toString())}`
        );
      }
      if (value === undefined) return;
      return `${encodeURIComponent(key)}=${encodeURIComponent(
        value.toString()
      )}`;
    })
    .filter(Boolean)
    .join("&");
};

export function html(strings: any, ...values: any) {
  let result = "";
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  return result;
}
export function extractTagContent(
  inputString: string,
  tagName: string,
  allowContentAfterOnlyFirstTag?: boolean
) {
  const openTag = `<${tagName}>`;
  const closeTag = `</${tagName}>`;
  const openIndex = inputString.indexOf(openTag);
  if (openIndex !== -1) {
    const start = openIndex + openTag.length;
    const closeIndex = inputString.indexOf(closeTag, start);
    // If the closing tag is found, return content between open and close.
    // Otherwise, return everything after the opening tag.
    if (closeIndex !== -1) {
      return inputString.substring(start, closeIndex);
    } else {
      if (allowContentAfterOnlyFirstTag) {
        return inputString.substring(start);
      } else {
        return null;
      }
    }
  }
  return null;
}

export const handleInputOnPaste = (
  event: React.ClipboardEvent<HTMLElement>,
  onFilesChange: (files: File[]) => void
) => {
  const items = event.clipboardData.items;
  const files: File[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item.kind === "file") {
      const file = item.getAsFile();

      if (file) {
        files.push(file);
      }
    }
  }
  if (files.length > 0) {
    // Prevent default paste behavior (which pastes the file name)
    event.preventDefault();
    onFilesChange(files);
  }
};
export function uint8ArrayToString(uint8Array: Uint8Array) {
  return new TextDecoder().decode(uint8Array);
}

export function dataURLtoFile(dataUrl: string, filename: string) {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
/**
 * Recursively attempts to parse JSON strings.
 * @param data - The input data to process.
 * @returns The recursively parsed JSON object or original data if not parseable.
 */
export function recursiveParseJson(data: any): any {
  if (typeof data === "string") {
    try {
      // Attempt to parse the string.
      const parsed = JSON5.parse(data);
      // If parsed, recursively process the parsed result.
      return recursiveParseJson(parsed);
    } catch (err) {
      // If parsing fails, return the original string.
      return data;
    }
  } else if (Array.isArray(data)) {
    // Recursively process each element in the array.
    return data.map((item) => recursiveParseJson(item));
  } else if (data !== null && typeof data === "object") {
    // Recursively process each key in the object.
    const result: Record<string, any> = {};
    for (const key in data) {
      result[key] = recursiveParseJson(data[key]);
    }
    return result;
  }
  // Return non-string primitives (number, boolean, etc.) as-is.
  return data;
}

export const safeSleep = (ms: number, allowInNonDevelopment = false) => {
  if (environmentVars.APP_ENV !== "development" && !allowInNonDevelopment) {
    alert(
      "this sleep call is left for environment other than development, if this is deliberate please mark it as allowed for non-development environments"
    );
    return;
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export function getCsvFile({
  csvContent,
  filename,
}: {
  csvContent: string;
  filename: string;
}) {
  // Convert CSV string to a Blob
  const blob = new Blob([csvContent], { type: "text/csv" });

  // Convert Blob to File (File API is available in the browser)
  const file = new File([blob], filename, { type: "text/csv" });
  return file;
}

// New function to fetch CSV content
export const fetchCSV = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(url, { responseType: "text" });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch CSV content: ${error}`);
  }
};

// Function to trigger a download of a file created from a string
export function downloadContentFile({
  content,
  filename,
}: {
  content: string;
  filename: string;
}) {
  // Create a new Blob with the markdown content
  const blob = new Blob([content]);
  // Create a URL for the Blob
  const url = window.URL.createObjectURL(blob);
  // Create an anchor element and trigger a click to download the file
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  // Clean up the DOM and release the object URL
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

export function memoizeFn<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, Promise<ReturnType<T>> | ReturnType<T>>();

  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key) as Promise<ReturnType<T>> | ReturnType<T>;
    }
    const result = fn(...args);
    if (result instanceof Promise) {
      cache.set(key, result);
      return await result;
    }
    cache.set(key, result);
    return result;
  }) as T;
}

export function getDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname;
  } catch (e) {
    console.error("Invalid URL:", e);
    return "";
  }
}

export const getFavicon = (domain: string) => {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
};
