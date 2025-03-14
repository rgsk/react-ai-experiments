import { useState } from "react";

function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopiedText(null);
      return false;
    }
  };

  return { copiedText, copy, copied };
}

export default useCopyToClipboard;
