import { useSearchParams } from "react-router-dom";
import useBroadcastChannelState from "~/hooks/useBroadcastChannelState";
import { useWindowSize } from "~/hooks/useWindowSize";
import ShowPreview from "./ShowPreview";

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
  return <ShowPreview language={language} code={code} />;
};
export default PreviewPage;
