import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const encodeQueryParams = (
  params: Record<string, string | number | boolean>
): string => {
  return Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`
    )
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
