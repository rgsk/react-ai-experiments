import { useSearchParams } from "react-router-dom";
import useBroadcastChannelState from "~/hooks/useBroadcastChannelState";
import IFramePreview from "../ChatPage/Children/IFramePreview";

interface IFramePreviewPageProps {}
const IFramePreviewPage: React.FC<IFramePreviewPageProps> = ({}) => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [code] = useBroadcastChannelState<string>(`code-${id}`);

  if (!id || !code) {
    return null;
  }
  return (
    <div style={{ height: window.innerHeight, width: window.innerWidth }}>
      <IFramePreview srcDoc={code}></IFramePreview>
    </div>
  );
};
export default IFramePreviewPage;
