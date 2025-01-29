import Editor from "@monaco-editor/react";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Prism } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import useGlobalContext from "~/hooks/useGlobalContext";

import { cn } from "~/lib/utils";
import experimentsService from "~/services/experimentsService";
interface SyntaxHighlighterProps {
  language: string;
  code: string;
  isCodeOutput: boolean;
  codeProps: any;
  loading: boolean;
}
const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  language,
  code: initialCode,
  isCodeOutput,
  codeProps,
  loading,
}) => {
  const [code, setCode] = useState(initialCode);
  const codeRef = useRef(code);
  codeRef.current = code;
  const { copied, copy } = useCopyToClipboard();
  const executeCodeMutationResult = useMutation({
    mutationFn: ({ code, language }: { code: string; language: string }) => {
      return experimentsService.executeCode({
        language,
        code: code,
      });
    },
  });
  const { currentExecuteCodeRef } = useGlobalContext();

  const executeCode = () => {
    executeCodeMutationResult.mutate({
      code: code,
      language,
    });
  };
  const executeCodeRef = useRef(executeCode);
  executeCodeRef.current = executeCode;

  const countOfLines = code?.split("\n").length;
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
            {isCodeOutput ? (
              <></>
            ) : (
              <>
                <button
                  className="text-white text-xs border border-w rounded-md px-2 pt-[3px] pb-[1px]"
                  onClick={executeCode}
                >
                  Run Code
                </button>
                {code !== initialCode && (
                  <button
                    className="text-white text-xs border border-w rounded-md px-2 pt-[3px] pb-[1px]"
                    onClick={() => {
                      setCode(initialCode);
                    }}
                  >
                    Reset Code
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {loading ? (
          <>
            {/* @ts-ignore */}
            <Prism
              style={vscDarkPlus}
              PreTag="div"
              language={language}
              {...codeProps}
              customStyle={{
                padding: 26,
                marginTop: 0,
                marginBottom: 0,
                paddingTop: paddingTop,
              }}
            >
              {code}
            </Prism>
          </>
        ) : (
          <>
            <div
              onWheelCapture={(e) => {
                e.stopPropagation();
              }}
            >
              <Editor
                defaultLanguage={language}
                value={code}
                theme="vs-dark"
                height={countOfLines * lineHeight + paddingBottom}
                options={{
                  fontSize: 12,
                  lineHeight: lineHeight,
                  scrollBeyondLastLine: false,
                  lineNumbers: "off",
                  minimap: {
                    enabled: false,
                  },
                  padding: {
                    top: paddingTop,
                  },
                  readOnly: isCodeOutput, // Ensure output is read-only
                }}
                onChange={(newValue) => setCode(newValue || "")}
                onMount={(editor, monaco) => {
                  if (!isCodeOutput) {
                    editor.onDidFocusEditorWidget(() => {
                      currentExecuteCodeRef.current = executeCodeRef;
                    });
                    editor.addCommand(
                      monaco.KeyMod.Shift | monaco.KeyCode.Enter,
                      () => {
                        currentExecuteCodeRef.current?.current();
                      }
                    );
                  }
                }}
              />
            </div>
          </>
        )}
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
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};
export default SyntaxHighlighter;
