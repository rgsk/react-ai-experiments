import Editor from "@monaco-editor/react";
import { Copy } from "iconsax-react";
import { Check, Play, RefreshCw, RotateCcw, X } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
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
import useBroadcastChannelState from "~/hooks/useBroadcastChannelState";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import useGlobalContext from "~/hooks/useGlobalContext";
import { useWindowSize } from "~/hooks/useWindowSize";
import { cn, getCsvFile } from "~/lib/utils";
import experimentsService from "~/services/experimentsService";
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
    () => [...codeRunnerSupportedLanguages, "latex"].includes(language as any),
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
      } else {
        alert(`${language} isn't supported for code execution`);
      }
    }
  };
  const executeCodeRef = useRef(executeCode);
  executeCodeRef.current = executeCode;
  const iframePreviewLink = `/preview-page?id=${id}`;
  const lines = code?.split("\n") ?? [];
  const countOfLines = lines[lines.length - 1]
    ? lines.length
    : lines.length - 1;
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
                      <CodeButton
                        disabled={codeRunnersLoading}
                        onClick={executeCode}
                      >
                        {codeRunnersLoading ? (
                          <LoadingSpinner size={12} />
                        ) : (
                          <Play size={12} />
                        )}
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
                height={paddingTop + countOfLines * lineHeight + paddingBottom}
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
          <>
            {language === "latex" ? (
              <>
                <PDFReader pdfUrl={executeCodeDetails.output} />
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
}
const CodeButton: React.FC<CodeButtonProps> = ({
  onClick,
  children,
  disabled,
}) => {
  return (
    <button
      disabled={disabled}
      className="text-white text-xs border border-white rounded-md px-2 flex items-center gap-2 py-1"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
