export function arraysEqual(arr1: Uint8Array, arr2: Uint8Array): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}
export function stringToUint8Array(value: string) {
  return new TextEncoder().encode(value);
}
export const endOfStreamUint8Array = stringToUint8Array("endOfStream");
