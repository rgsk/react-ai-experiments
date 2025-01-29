import Editor from "@monaco-editor/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";

import { cn } from "~/lib/utils";
import experimentsService from "~/services/experimentsService";
interface SyntaxHighlighterProps {
  language: string;
  code: string;
  isCodeOutput: boolean;
  codeProps: any;
}
const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  language,
  code: initialCode,
  isCodeOutput,
  codeProps,
}) => {
  const [code, setCode] = useState(initialCode);
  const { copied, copy } = useCopyToClipboard();
  const executeCodeMutationResult = useMutation({
    mutationFn: ({ code, language }: { code: string; language: string }) => {
      return experimentsService.executeCode({
        language,
        code: code,
      });
    },
  });
  const executeCode = () => {
    executeCodeMutationResult.mutate({
      code: code,
      language,
    });
  };

  const countOfLines = code.split("\n").length;
  const lineHeight = 18;
  const paddingTop = 20;
  const paddingBottom = 20;
  return (
    <div>
      <div className="rounded-[12px] overflow-hidden">
        <div
          className={cn(
            "bg-[#50505a] w-full",
            "flex justify-between items-center",
            "px-[16px] py-[8px]"
          )}
        >
          {language === "default" ? (
            <span></span>
          ) : (
            <span className="text-white text-xs">{language}</span>
          )}
          <div className="flex gap-3">
            <button
              className="text-white text-xs border border-w rounded-md px-2 pt-[3px] pb-[1px]"
              onClick={() => {
                copy(code);
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            {!isCodeOutput && (
              <>
                <button
                  className="text-white text-xs border border-w rounded-md px-2 pt-[3px] pb-[1px]"
                  onClick={executeCode}
                >
                  Run Code
                </button>
              </>
            )}
          </div>
        </div>

        <Editor
          defaultLanguage={language}
          defaultValue={code}
          theme="vs-dark"
          height={countOfLines * lineHeight + paddingBottom}
          options={{
            fontSize: 12,
            lineHeight: lineHeight,
            scrollBeyondLastLine: false,
            lineNumbers: "off",
            minimap: {
              enabled: false, // Disable the minimap
            },
            padding: {
              top: paddingTop,
            },
          }}
          onChange={(newValue) => setCode(newValue || "")}
        />
      </div>
      <div className="mt-[20px]">
        {executeCodeMutationResult.isPending && (
          <div>
            <LoadingSpinner />
          </div>
        )}
        {executeCodeMutationResult.data?.output && (
          <SyntaxHighlighter
            code={executeCodeMutationResult.data?.output}
            language={language}
            codeProps={codeProps}
            isCodeOutput={true}
          />
        )}
      </div>
    </div>
  );
};
export default SyntaxHighlighter;
