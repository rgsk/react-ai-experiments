import { clsx, type ClassValue } from "clsx";
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
export function extractTagContent(inputString: string, tagName: string) {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`);
  const match = inputString.match(regex);
  if (match && match[1]) {
    return match[1];
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
      const parsed = JSON.parse(data);
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
