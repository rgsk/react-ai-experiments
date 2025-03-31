import { useParams } from "react-router-dom";
import useJsonData from "~/hooks/useJsonData";
import { SharedPreview } from "~/lib/typesJsonData";
import ShowPreview from "../PreviewPage/ShowPreview";
import CentralLoader from "../Shared/CentralLoader";

interface SharedPreviewPageProps {}
const SharedPreviewPage: React.FC<SharedPreviewPageProps> = ({}) => {
  const { id: sharedPreviewId } = useParams<{ id: string }>();
  const [sharedPreview] = useJsonData<SharedPreview>(
    `admin/public/sharedPreviews/${sharedPreviewId}`
  );
  if (!sharedPreview) {
    return <CentralLoader />;
  }
  const { code, language } = sharedPreview;
  return (
    <div>
      <ShowPreview language={language} code={code} />
    </div>
  );
};
export default SharedPreviewPage;
