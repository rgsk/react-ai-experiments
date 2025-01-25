import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import { cn } from "~/lib/utils";

type MarkdownRendererProps = {
  children: string;
};

export function MarkdownRenderer({
  children: markdown,
}: MarkdownRendererProps) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      className="messageContent"
      components={{
        code({ node, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match?.[1] ?? "default";
          const inline = node.position.start.line === node.position.end.line;
          if (inline) {
            return (
              <code
                className={cn(
                  "bg-gray-200 px-[5px] py-[2px] text-red-500 rounded-sm text-sm",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          }
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
                <button
                  className="text-white text-xs"
                  onClick={() => {
                    copy(children);
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              {/* @ts-ignore */}
              <SyntaxHighlighter
                style={vscDarkPlus}
                PreTag="div"
                language={language}
                {...props}
                customStyle={{
                  borderRadius: "16px",
                  padding: "16px",
                  paddingTop: "50px",
                }}
              >
                {children}
              </SyntaxHighlighter>
            </div>
          );
        },
      }}
    >
      {markdown}
    </Markdown>
  );
}
