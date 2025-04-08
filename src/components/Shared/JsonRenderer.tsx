import SyntaxHighlighter from "../ChatPage/Children/SyntaxHighlighter";

interface JsonRendererProps {
  object: any;
}
const JsonRenderer: React.FC<JsonRendererProps> = ({ object }) => {
  return (
    <div>
      <SyntaxHighlighter
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
