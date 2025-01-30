import { useSearchParams } from "react-router-dom";
import useBroadcastChannelState from "~/hooks/useBroadcastChannelState";
import { useWindowSize } from "~/hooks/useWindowSize";
import IFramePreview from "../ChatPage/Children/IFramePreview";
import JsxPreview from "../ChatPage/Children/JsxPreview";

interface PreviewPageProps {}
const PreviewPage: React.FC<PreviewPageProps> = ({}) => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [code] = useBroadcastChannelState<string>(`code-${id}`);
  const [language] = useBroadcastChannelState<string>(`language-${id}`);
  const windowSize = useWindowSize();
  if (!id || !code || !language) {
    return null;
  }
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
export default PreviewPage;
