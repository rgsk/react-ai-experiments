import { LiveError, LivePreview, LiveProvider } from "react-live";

interface JsxPreviewProps {
  code: string;
}
const JsxPreview: React.FC<JsxPreviewProps> = ({ code }) => {
  return (
    <LiveProvider code={code}>
      <LiveError />
      <LivePreview style={{ height: "100%", overflow: "auto" }} />
    </LiveProvider>
  );
};
export default JsxPreview;
