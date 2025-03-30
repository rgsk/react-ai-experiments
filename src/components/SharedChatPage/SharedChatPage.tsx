import { useParams } from "react-router-dom";
import useJsonData from "~/hooks/useJsonData";
import { SharedChat } from "~/lib/typesJsonData";
import RenderMessages from "../ChatPage/Children/RenderMessages/RenderMessages";
import CentralLoader from "../Shared/CentralLoader";
import Container from "../Shared/Container";

interface SharedChatPageProps {}
const SharedChatPage: React.FC<SharedChatPageProps> = ({}) => {
  const { id: sharedChatId } = useParams<{ id: string }>();
  const [sharedChat] = useJsonData<SharedChat>(
    `admin/public/sharedChats/${sharedChatId}`
  );
  if (!sharedChat) {
    return <CentralLoader />;
  }
  return (
    <div>
      <Container>
        <RenderMessages messages={sharedChat.messages} type="shared-chat" />
      </Container>
    </div>
  );
};
export default SharedChatPage;
