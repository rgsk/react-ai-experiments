import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

export function normalizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return `https://${parsedUrl.hostname}`.toLowerCase().replace(/\/$/, "");
  } catch (error) {
    throw new Error("Invalid URL");
  }
}
