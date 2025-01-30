import { useSearchParams } from "react-router-dom";
import useBroadcastChannelState from "~/hooks/useBroadcastChannelState";
import { useWindowSize } from "~/hooks/useWindowSize";
import IFramePreview from "../ChatPage/Children/IFramePreview";

interface IFramePreviewPageProps {}
const IFramePreviewPage: React.FC<IFramePreviewPageProps> = ({}) => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [code] = useBroadcastChannelState<string>(`code-${id}`);
  const windowSize = useWindowSize();
  if (!id || !code) {
    return null;
  }
  return (
    <div style={{ height: windowSize.height, width: windowSize.width }}>
      <IFramePreview srcDoc={code}></IFramePreview>
    </div>
  );
};
export default IFramePreviewPage;
