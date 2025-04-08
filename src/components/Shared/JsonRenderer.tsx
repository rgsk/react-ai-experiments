import SyntaxHighlighter from "../ChatPage/Children/SyntaxHighlighter";

interface JsonRendererProps {
  object: any;
  heading?: string;
}
const JsonRenderer: React.FC<JsonRendererProps> = ({ object, heading }) => {
  return (
    <div>
      <SyntaxHighlighter
        heading={heading}
        loading={false}
        code={JSON.stringify(object, null, 2)}
        language={"json"}
        codeProps={{}}
        isCodeOutput={true}
      />
    </div>
  );
};
export default JsonRenderer;
