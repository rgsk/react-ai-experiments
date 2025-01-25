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
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");

          return !inline && match ? (
            <div className="relative">
              <div
                className={cn(
                  "absolute top-0 right-0 bg-[#50505a] h-[36px] w-full",
                  "flex justify-between items-center",
                  "rounded-tl-[16px] rounded-tr-[16px]",
                  "px-[16px]"
                )}
              >
                <span className="text-white text-xs">{match[1]}</span>
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
                language={match[1]}
                {...props}
                customStyle={{
                  borderRadius: "16px",
                  paddingTop: "50px",
                }}
              >
                {children}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {markdown}
    </Markdown>
  );
}
