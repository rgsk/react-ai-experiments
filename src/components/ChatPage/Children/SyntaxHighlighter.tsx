import Editor from "@monaco-editor/react";
import { Copy } from "iconsax-react";
import { Check, Play, RefreshCw, RotateCcw, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Prism } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import useMeasure from "react-use-measure";
import { v4 } from "uuid";
import OpenInNewTabIcon from "~/components/Icons/OpenInNewTabIcon";
import PreviewIcon from "~/components/Icons/PreviewIcon";
import ActionButton from "~/components/Shared/ActionButton";
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
            <CodeButton
              onClick={() => {
                if (code) {
                  copy(code);
                }
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </CodeButton>
            {isCodeOutput ? (
              <></>
            ) : (
              <>
                {previewLanguages.includes(language) ? (
                  <>
                    {!showPreview && (
                      <CodeButton
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
                        <PreviewIcon size={12} />
                        <span>Preview</span>
                      </CodeButton>
                    )}
                    <a href={iframePreviewLink} target="_blank">
                      <CodeButton>
                        <OpenInNewTabIcon size={12} />
                        <span>Open in New Tab</span>
                      </CodeButton>
                    </a>
                  </>
                ) : (
                  <>
                    {codeExecutionAllowed && (
                      <CodeButton onClick={executeCode}>
                        <Play size={12} />
                        <span>Run</span>
                      </CodeButton>
                    )}
                  </>
                )}

                {code !== initialCode && (
                  <CodeButton
                    onClick={() => {
                      setCode(initialCode);
                    }}
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </CodeButton>
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
            variant="secondary"
            onClick={() => {
              setShowPreview(true);
            }}
          >
            <PreviewIcon />
            <span>Show Preview</span>
          </Button>
        </div>
      ) : null}
      {showPreview && (
        <>
          <div className="pt-[20px]" ref={previewRef}>
            <SingleGrid
              gridWidth={divBounds.width}
              gridHeight={windowSize.height / 1.5}
            >
              <div className="h-full flex flex-col">
                <div className="p-1 flex">
                  <ActionButton
                    tooltip="Refresh"
                    onClick={() => {
                      setShowIframe(false);
                      setTimeout(() => {
                        setShowIframe(true);
                      });
                    }}
                  >
                    <RefreshCw size={18} />
                  </ActionButton>
                  <div className="flex-1"></div>
                  <a href={iframePreviewLink} target="_blank">
                    <ActionButton tooltip="Open in New Tab">
                      <OpenInNewTabIcon size={18} />
                    </ActionButton>
                  </a>
                  <ActionButton
                    tooltip="Close"
                    onClick={() => {
                      setShowPreview(false);
                    }}
                  >
                    <X size={18} />
                  </ActionButton>
                </div>
                <div className="flex-1">
                  {showIframe &&
                    code &&
                    (language === "html" ? (
                      <IFramePreview srcDoc={code} />
                    ) : (
                      <JsxPreview code={code} />
                    ))}
                </div>
              </div>
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
            language={"output"}
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

interface CodeButtonProps {
  onClick?: () => void;
  children: any;
}
const CodeButton: React.FC<CodeButtonProps> = ({ onClick, children }) => {
  return (
    <button
      className="text-white text-xs border border-white rounded-md px-2 flex items-center gap-2 py-1"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
