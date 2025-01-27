// Add this to your component or a utility file
const originalError = console.error;
console.error = (...args) => {
  if (/Warning: A component is `contentEditable`/.test(args[0])) {
    return;
  }
  originalError.apply(console, args);
};
const originalWarn = console.warn;
console.warn = (...args) => {
  if (/React Router Future Flag Warning:/.test(args[0])) {
    return; // Suppress this specific warning
  }
  originalWarn.apply(console, args); // Keep other warnings intact
};
