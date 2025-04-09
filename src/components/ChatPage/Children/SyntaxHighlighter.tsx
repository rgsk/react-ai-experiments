import Editor from "@monaco-editor/react";
import { Copy } from "iconsax-react";
import {
  Check,
  Play,
  RefreshCw,
  RotateCcw,
  Share,
  WrapText,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { Prism } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import useMeasure from "react-use-measure";
import { v4 } from "uuid";
import OpenInNewTabIcon from "~/components/Icons/OpenInNewTabIcon";
import PreviewIcon from "~/components/Icons/PreviewIcon";
import ActionButton from "~/components/Shared/ActionButton";
import CsvRenderer from "~/components/Shared/CsvRenderer";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import PDFReader from "~/components/Shared/PDFReader/PDFReader";
import { Button } from "~/components/ui/button";
import useCodeRunners, {
  CodeRunnerSupportedLanguages,
  codeRunnerSupportedLanguages,
} from "~/hooks/codeRunners/useCodeRunners";
import {
  getCSVContents,
  pythonCSVPrefix,
  pythonImagePrefix,
} from "~/hooks/codeRunners/usePythonRunner";
import useBreakpoints from "~/hooks/useBreakpoints";
import useBroadcastChannelState from "~/hooks/useBroadcastChannelState";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import useEventListener from "~/hooks/useEventListener";
import useGlobalContext from "~/hooks/useGlobalContext";
import { useWindowSize } from "~/hooks/useWindowSize";
import { getSharedPreviewLink } from "~/lib/chatUtils";
import { cn, getCsvFile } from "~/lib/utils";
import experimentsService from "~/services/experimentsService";
import IFramePreview from "./IFramePreview";
import JsxPreview from "./JsxPreview";
import MermaidChart from "./MermaidChart";
import SingleGrid from "./SingleGrid";
interface SyntaxHighlighterProps {
  language: string;
  code?: string;
  isCodeOutput: boolean;
  codeProps: any;
  loading: boolean;
  heading?: string;
  disableHeader?: boolean;
  wordWrap?: boolean;
}
const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  language,
  code: initialCode,
  isCodeOutput,
  codeProps,
  loading,
  heading,
  disableHeader,
  wordWrap: parentWordWrap,
}) => {
  const { loading: codeRunnersLoading, runCode } = useCodeRunners();
  const [sharePreviewLoading, setSharePreviewLoading] = useState(false);
  const [executeCodeDetails, setExecuteCodeDetails] = useState({
    loading: false,
    output: "",
    error: "",
  });
  const { md } = useBreakpoints();
  const windowSize = useWindowSize();
  const [divRef, divBounds] = useMeasure();
  const id = useMemo(() => v4(), []);
  const [code, setCode] = useBroadcastChannelState(`code-${id}`, initialCode);
  useBroadcastChannelState(`language-${id}`, language);
  const [disabledPointerEvents, setDisabledPointerEvents] = useState(true);

  const [showPreview, setShowPreview] = useState(false);
  const [showIframe, setShowIframe] = useState(true);
  const codeRef = useRef(code);
  const previewRef = useRef<HTMLDivElement>(null);
  codeRef.current = code;
  const { copied, copiedText, copy } = useCopyToClipboard();
  const [wordWrap, setWordWrap] = useState(parentWordWrap);
  useEffect(() => {
    setWordWrap(parentWordWrap);
  }, [parentWordWrap]);
  const [editorContentHeight, setEditorContentHeight] = useState(0);

  const { currentExecuteCodeRef } = useGlobalContext();
  const codeExecutionAllowed = useMemo(
    () =>
      [...codeRunnerSupportedLanguages, "latex", "mermaid"].includes(
        language as any
      ),
    [language]
  );
  const executeCode = async () => {
    if (code) {
      if (codeRunnerSupportedLanguages.includes(language as any)) {
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
      } else if (language === "latex") {
        setExecuteCodeDetails({ loading: true, output: "", error: "" });

        const { pdfUrl } = await experimentsService.executeLatex({
          code: code,
        });
        setExecuteCodeDetails({ loading: false, output: pdfUrl, error: "" });
      } else if (language === "mermaid") {
        setExecuteCodeDetails({ loading: true, output: "", error: "" });
        setTimeout(() => {
          setExecuteCodeDetails({ loading: false, output: code, error: "" });
        });
      } else {
        alert(`${language} isn't supported for code execution`);
      }
    }
  };
  const executeCodeRef = useRef(executeCode);
  executeCodeRef.current = executeCode;
  const iframePreviewLink = `/preview-page?id=${id}`;
  const monacoFontSize = 14;
  const lineHeight = monacoFontSize * 1.5;
  const paddingTop = 20;
  const previewLanguages = ["html", "jsx"];
  const getFencedCode = () => {
    return `
\`\`\`${language}
${code}
\`\`\`
`;
  };
  useEventListener("click", () => {
    if (isMobile) {
      setDisabledPointerEvents(true);
    }
  });

  return (
    <div>
      <div>
        {disableHeader ? (
          <></>
        ) : (
          <div
            className={cn(
              "bg-[#50505a] w-full",
              "flex justify-between items-center",
              "px-[16px] py-[8px]",
              "sticky top-[-16px] z-50"
            )}
          >
            <span className={cn("text-white", heading ? "text-sm" : "text-xs")}>
              {heading ? heading : language === "default" ? "" : language}
            </span>
            <div className="flex gap-3">
              <CodeButton
                onClick={() => {
                  if (code) {
                    copy(code);
                  }
                }}
              >
                {copied && copiedText === code ? (
                  <Check size={12} />
                ) : (
                  <Copy size={12} />
                )}
                {md && (
                  <span>
                    {copied && copiedText === code ? "Copied!" : "Copy"}
                  </span>
                )}
              </CodeButton>
              {md && (
                <CodeButton
                  onClick={() => {
                    if (code) {
                      copy(getFencedCode());
                    }
                  }}
                >
                  {copied && copiedText === getFencedCode() ? (
                    <Check size={12} />
                  ) : (
                    <Copy size={12} />
                  )}
                  {md && (
                    <span>
                      {copied && copiedText === getFencedCode()
                        ? "Copied!"
                        : "Copy Fenced"}
                    </span>
                  )}
                </CodeButton>
              )}
              <CodeButton
                onClick={() => {
                  setWordWrap((prev) => !prev);
                }}
                active={wordWrap}
              >
                <WrapText size={12} />
                {md && <span>Word Wrap</span>}
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
                          {md && <span>Preview</span>}
                        </CodeButton>
                      )}
                      <a href={iframePreviewLink} target="_blank">
                        <CodeButton>
                          <OpenInNewTabIcon size={12} />
                          {md && <span>Open in New Tab</span>}
                        </CodeButton>
                      </a>
                    </>
                  ) : (
                    <>
                      {codeExecutionAllowed && (
                        <CodeButton
                          disabled={codeRunnersLoading}
                          onClick={executeCode}
                        >
                          {codeRunnersLoading ? (
                            <LoadingSpinner size={12} />
                          ) : (
                            <Play size={12} />
                          )}
                          {md && <span>Run</span>}
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
                      {md && <span>Reset</span>}
                    </CodeButton>
                  )}
                </>
              )}
            </div>
          </div>
        )}

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
                paddingTop: 26,
              }}
            >
              {code}
            </Prism>
          </>
        ) : (
          <>
            <div
              onClick={(e) => {
                if (isMobile) {
                  e.stopPropagation();
                  setDisabledPointerEvents(false);
                }
              }}
            >
              <div
                className={cn(
                  isMobile && disabledPointerEvents && "pointer-events-none"
                )}
                onWheelCapture={(e) => {
                  // Check if vertical scrolling is dominant
                  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                    // stopPropagation only for vertical scroll (allow horizontal scroll)
                    e.stopPropagation();
                  }
                }}
              >
                <Editor
                  defaultLanguage={language === "jsx" ? "javascript" : language}
                  value={code}
                  theme="vs-dark"
                  height={editorContentHeight}
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
                      bottom: paddingTop,
                    },
                    wordWrap: wordWrap,
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
                    const updateEditorHeight = () => {
                      const contentHeight = editor.getContentHeight();
                      setEditorContentHeight(contentHeight);
                    };
                    // Initial update of the container's height
                    updateEditorHeight();

                    // Listen for changes in content size and update the height accordingly
                    editor.onDidContentSizeChange(() => {
                      updateEditorHeight();
                    });
                  }}
                />
              </div>
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
                  <ActionButton
                    tooltip="Share"
                    onClick={async () => {
                      if (!code) return;
                      setSharePreviewLoading(true);
                      const sharedChatLink = await getSharedPreviewLink({
                        code,
                        language,
                      });
                      if (sharedChatLink) {
                        copy(sharedChatLink);
                      }
                      setSharePreviewLoading(false);
                    }}
                  >
                    {sharePreviewLoading ? (
                      <LoadingSpinner size={18} />
                    ) : copied ? (
                      <Check size={18} />
                    ) : (
                      <Share size={18} />
                    )}
                  </ActionButton>
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
          <>
            {language === "latex" ? (
              <>
                <PDFReader pdfUrl={executeCodeDetails.output} />
              </>
            ) : language === "mermaid" ? (
              <>
                <MermaidChart chart={executeCodeDetails.output} />
              </>
            ) : (
              <>
                {(() => {
                  const outputLines = executeCodeDetails.output.split("\n");
                  let normalTextBuffer: string[] = [];

                  return outputLines
                    .map((line, index) => {
                      if (!line) return null;

                      if (line.startsWith(pythonImagePrefix)) {
                        const syntaxHighlighter =
                          normalTextBuffer.length > 0 ? (
                            <RenderOutput
                              key={`code-${index}`}
                              code={normalTextBuffer.join("\n")}
                            />
                          ) : null;
                        normalTextBuffer = [];

                        return (
                          <React.Fragment key={`fragment-${index}`}>
                            {syntaxHighlighter}
                            <img key={`img-${index}`} src={line} />
                          </React.Fragment>
                        );
                      } else if (line.startsWith(pythonCSVPrefix)) {
                        const syntaxHighlighter =
                          normalTextBuffer.length > 0 ? (
                            <RenderOutput
                              key={`code-${index}`}
                              code={normalTextBuffer.join("\n")}
                            />
                          ) : null;
                        normalTextBuffer = [];

                        const { fileName, csvContent } = getCSVContents(line);
                        const file = getCsvFile({
                          filename: fileName,
                          csvContent,
                        });
                        return (
                          <React.Fragment key={`fragment-${index}`}>
                            {syntaxHighlighter}
                            <CsvRenderer key={`csv-${index}`} file={file} />
                          </React.Fragment>
                        );
                      } else {
                        normalTextBuffer.push(line);
                        return null;
                      }
                    })
                    .concat(
                      normalTextBuffer.length > 0 ? (
                        <RenderOutput
                          key="final-code"
                          code={normalTextBuffer.join("\n")}
                        />
                      ) : null
                    );
                })()}
              </>
            )}
          </>
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

interface RenderOutputProps {
  code: string;
}
const RenderOutput: React.FC<RenderOutputProps> = ({ code }) => {
  return (
    <SyntaxHighlighter
      key="final-code"
      code={code}
      language={"output"}
      codeProps={{}}
      isCodeOutput={true}
      loading={true}
    />
  );
};

interface CodeButtonProps {
  onClick?: () => void;
  children: any;
  disabled?: boolean;
  active?: boolean;
}
const CodeButton: React.FC<CodeButtonProps> = ({
  onClick,
  children,
  disabled,
  active,
}) => {
  return (
    <button
      disabled={disabled}
      className={cn(
        "text-white text-xs border border-white rounded-md px-2 flex items-center gap-2 py-1",
        active && "bg-white text-black"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
