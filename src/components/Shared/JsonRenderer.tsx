import SyntaxHighlighter from "../ChatPage/Children/SyntaxHighlighter";

interface JsonRendererProps {
  object: any;
  heading?: string;
  disableHeader?: boolean;
  wordWrap?: boolean;
}
const JsonRenderer: React.FC<JsonRendererProps> = ({
  object,
  heading,
  disableHeader,
  wordWrap,
}) => {
  return (
    <div>
      <SyntaxHighlighter
        heading={heading}
        loading={false}
        code={JSON.stringify(object, null, 2)}
        language={"json"}
        codeProps={{}}
        isCodeOutput={true}
        disableHeader={disableHeader}
        wordWrap={wordWrap}
      />
    </div>
  );
};
export default JsonRenderer;
