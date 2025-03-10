import Editor from "@monaco-editor/react";
import { useMemo, useRef, useState } from "react";
import { Prism } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import useMeasure from "react-use-measure";
import { v4 } from "uuid";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { Button } from "~/components/ui/button";
import useCodeRunners, {
  CodeRunnerSupportedLanguages,
  codeRunnerSupportedLanguages,
} from "~/hooks/codeRunners/useCodeRunners";
import useBroadcastChannelState from "~/hooks/useBroadcastChannelState";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import useGlobalContext from "~/hooks/useGlobalContext";
import { useWindowSize } from "~/hooks/useWindowSize";
import { cn } from "~/lib/utils";
import IFramePreview from "./IFramePreview";
import JsxPreview from "./JsxPreview";
import SingleGrid from "./SingleGrid";
interface SyntaxHighlighterProps {
  language: string;
  code?: string;
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
  const { loading: codeRunnersLoading, runCode } = useCodeRunners();
  const [executeCodeDetails, setExecuteCodeDetails] = useState({
    loading: false,
    output: "",
    error: "",
  });

  const windowSize = useWindowSize();
  const [divRef, divBounds] = useMeasure();
  const id = useMemo(() => v4(), []);
  const [code, setCode] = useBroadcastChannelState(`code-${id}`, initialCode);
  useBroadcastChannelState(`language-${id}`, language);

  const [showPreview, setShowPreview] = useState(false);
  const [showIframe, setShowIframe] = useState(true);
  const codeRef = useRef(code);
  const previewRef = useRef<HTMLDivElement>(null);
  codeRef.current = code;
  const { copied, copy } = useCopyToClipboard();

  const { currentExecuteCodeRef } = useGlobalContext();
  const codeExecutionAllowed = useMemo(
    () => codeRunnerSupportedLanguages.includes(language as any),
    [language]
  );
  const executeCode = async () => {
    if (code) {
      if (codeExecutionAllowed) {
        setExecuteCodeDetails({ loading: true, output: "", error: "" });
        try {
          const output = await runCode({
            code,
            language: language as CodeRunnerSupportedLanguages,
          });
          setExecuteCodeDetails({ loading: false, output: output, error: "" });
        } catch (err: any) {
          setExecuteCodeDetails({
            loading: false,
            output: "",
            error: err.message,
          });
        }
      } else {
        alert(`${language} isn't supported for code execution`);
      }
    }
  };
  const executeCodeRef = useRef(executeCode);
  executeCodeRef.current = executeCode;
  const iframePreviewLink = `/preview-page?id=${id}`;
  const countOfLines = code?.split("\n").length ?? 0;
  const monacoFontSize = 14;
  const lineHeight = monacoFontSize * 1.5;
  const paddingTop = 20;
  const paddingBottom = 20;
  const previewLanguages = ["html", "jsx"];
  return (
    <div>
      <div className="rounded-[12px] overflow-hidden min-w-[608px]">
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
                if (code) {
                  copy(code);
                }
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            {isCodeOutput ? (
              <></>
            ) : (
              <>
                {previewLanguages.includes(language) ? (
                  <>
                    <button
                      className="text-white text-xs border border-w rounded-md px-2 pt-[3px] pb-[1px]"
                      onClick={() => {
                        if (showPreview) {
                          setShowPreview(false);
                        } else {
                          setShowPreview(true);
                          setTimeout(() => {
                            previewRef.current?.scrollIntoView();
                          });
                        }
                      }}
                    >
                      {showPreview ? "Hide" : "Show"} Inline Preview
                    </button>
                    <a href={iframePreviewLink} target="_blank">
                      <button className="text-white text-xs border border-w rounded-md px-2 pt-[3px] pb-[1px]">
                        Open Preview in New Tab
                      </button>
                    </a>
                  </>
                ) : (
                  <>
                    {codeExecutionAllowed && (
                      <button
                        className="text-white text-xs border border-w rounded-md px-2 pt-[3px] pb-[1px]"
                        onClick={executeCode}
                      >
                        Run Code
                      </button>
                    )}
                  </>
                )}

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
                defaultLanguage={language === "jsx" ? "javascript" : language}
                value={code}
                theme="vs-dark"
                height={countOfLines * lineHeight + paddingBottom}
                options={{
                  fontSize: monacoFontSize,
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
      <div ref={divRef} className="w-full"></div>
      {previewLanguages.includes(language) && !showPreview ? (
        <div className="pt-[20px]">
          <Button
            onClick={() => {
              setShowPreview(true);
            }}
          >
            Show Preview
          </Button>
        </div>
      ) : null}
      {showPreview && (
        <>
          <div className="pt-[20px]" ref={previewRef}>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowIframe(false);
                  setTimeout(() => {
                    setShowIframe(true);
                  });
                }}
              >
                Reset
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false);
                }}
              >
                Close Preview
              </Button>
              <a href={iframePreviewLink} target="_blank">
                <Button>Open in New Tab</Button>
              </a>
            </div>
            <div className="h-[20px]"></div>
            <SingleGrid
              gridWidth={divBounds.width}
              gridHeight={windowSize.height / 2}
            >
              {showIframe &&
                code &&
                (language === "html" ? (
                  <IFramePreview srcDoc={code} />
                ) : (
                  <JsxPreview code={code} />
                ))}
            </SingleGrid>
          </div>
        </>
      )}
      <div className="mt-[20px]">
        {executeCodeDetails.loading && (
          <div>
            <LoadingSpinner />
          </div>
        )}
        {executeCodeDetails.output && (
          <SyntaxHighlighter
            code={executeCodeDetails.output}
            language={language}
            codeProps={codeProps}
            isCodeOutput={true}
            loading={true} // temporarily so that we show prism for output
          />
        )}
        {executeCodeDetails.error && (
          <div>
            <p>Execute Code Error: </p>
            <p>{executeCodeDetails.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default SyntaxHighlighter;
