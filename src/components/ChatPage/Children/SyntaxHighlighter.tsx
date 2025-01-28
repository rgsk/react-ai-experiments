import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { Prism } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
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
  code,
  isCodeOutput,
  codeProps,
}) => {
  const editableContentRef = useRef<HTMLDivElement>(null);
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
    const editedCode = editableContentRef.current?.textContent;
    if (editedCode) {
      executeCodeMutationResult.mutate({
        code: editedCode,
        language,
      });
    }
  };
  return (
    <div className="relative">
      <div
        className={cn(
          "absolute top-0 right-0 bg-[#50505a] w-full",
          "flex justify-between items-center",
          "rounded-tl-[16px] rounded-tr-[16px]",
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
            <button
              className="text-white text-xs border border-w rounded-md px-2 pt-[3px] pb-[1px]"
              onClick={executeCode}
            >
              Run Code
            </button>
          )}
        </div>
      </div>
      <div
        contentEditable
        ref={editableContentRef}
        className="rounded-[16px] outline-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            executeCode();
          }
        }}
      >
        {/* @ts-ignore */}
        <Prism
          style={vscDarkPlus}
          PreTag="div"
          language={language}
          {...codeProps}
          customStyle={{
            borderRadius: "16px",
            padding: "16px",
            paddingTop: "50px",
          }}
        >
          {code}
        </Prism>
      </div>
      {executeCodeMutationResult.isPending && (
        <div>
          <LoadingSpinner />
        </div>
      )}
      {executeCodeMutationResult.data?.output && (
        <div>
          <SyntaxHighlighter
            code={executeCodeMutationResult.data?.output}
            language={language}
            codeProps={codeProps}
            isCodeOutput={true}
          />
        </div>
      )}
    </div>
  );
};
export default SyntaxHighlighter;
