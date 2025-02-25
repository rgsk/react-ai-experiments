// Function to determine if the URL is a PDF, ignoring query parameters and fragments
export const isPDFUrl = (url: string): boolean => {
  try {
    // Use the URL constructor to parse the URL and extract the pathname
    const parsedUrl = new URL(url);

    // Check if the pathname ends with ".pdf"
    return parsedUrl.pathname.endsWith(".pdf");
  } catch (error) {
    throw new Error(`nvalid URL provided: ${error}`);
  }
};

export const getFilenameFromUrl = (url: string) => {
  // Using string split and decodeURIComponent
  const parts = url.split("/");
  const filenameEncoded = parts.pop();
  if (!filenameEncoded) {
    throw new Error("no filename");
  }
  const filename = decodeURIComponent(filenameEncoded);
  return filename;
};
