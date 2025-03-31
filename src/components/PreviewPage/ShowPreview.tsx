import { useWindowSize } from "~/hooks/useWindowSize";
import IFramePreview from "../ChatPage/Children/IFramePreview";
import JsxPreview from "../ChatPage/Children/JsxPreview";

interface ShowPreviewProps {
  language: string;
  code: string;
}
const ShowPreview: React.FC<ShowPreviewProps> = ({ language, code }) => {
  const windowSize = useWindowSize();
  if (language === "html") {
    return (
      <div style={{ height: windowSize.height, width: windowSize.width }}>
        <IFramePreview srcDoc={code}></IFramePreview>
      </div>
    );
  } else if (language === "jsx") {
    return (
      <div className="messageContent">
        <JsxPreview code={code} />
      </div>
    );
  } else {
    return <p>preview for langauge - {language} is not supported</p>;
  }
};
export default ShowPreview;
