import { memo } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { cn } from "~/lib/utils";
import SyntaxHighlighter from "./SyntaxHighlighter";

type MarkdownRendererProps = {
  children: string;
  loading: boolean;
};

export function MarkdownRenderer({
  children: markdown,
  loading,
}: MarkdownRendererProps) {
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
            <SyntaxHighlighter
              loading={loading}
              code={children}
              language={language}
              codeProps={props}
              isCodeOutput={false}
            />
          );
        },
      }}
    >
      {markdown}
    </Markdown>
  );
}

// IMPORTANT: using MemoizedMarkdownRenderer is essential, to prevent rerenders of code block
export const MemoizedMarkdownRenderer = memo(MarkdownRenderer);
