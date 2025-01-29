import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Prism as ReactSyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import TextareaAutosize from "react-textarea-autosize";
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
  const [editModeActive, setEditModeActive] = useState(false);
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
            <>
              <button
                className="text-white text-xs border border-w rounded-md px-2 pt-[3px] pb-[1px]"
                onClick={executeCode}
              >
                Run Code
              </button>
              {editModeActive ? (
                <>
                  <button
                    className="text-white text-xs border border-w rounded-md px-2 pt-[3px] pb-[1px]"
                    onClick={() => {
                      setEditModeActive(false);
                    }}
                  >
                    Exit Edit
                  </button>
                </>
              ) : (
                <button
                  className="text-white text-xs border border-w rounded-md px-2 pt-[3px] pb-[1px]"
                  onClick={() => {
                    setEditModeActive(true);
                  }}
                >
                  Edit
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {editModeActive ? (
        <TextareaAutosize
          className="w-full"
          style={{
            borderRadius: "16px",
            padding: "16px",
            paddingTop: "50px",
            outline: "1px solid black",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (e.shiftKey) {
                e.preventDefault();
                executeCode();
              }
            } else if (e.key === "Tab") {
              e.preventDefault();

              const start = e.currentTarget.selectionStart;
              const end = e.currentTarget.selectionEnd;

              // Insert 2 spaces or a tab character ("\t")
              const newCode =
                code.substring(0, start) + "\t" + code.substring(end);

              setCode(newCode);

              // Move cursor after inserted spaces
              setTimeout(() => {
                e.currentTarget.selectionStart = e.currentTarget.selectionEnd =
                  start + 1;
              }, 0);
            }
          }}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
          }}
        ></TextareaAutosize>
      ) : (
        <>
          {/* @ts-ignore */}
          <ReactSyntaxHighlighter
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
          </ReactSyntaxHighlighter>
        </>
      )}
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
