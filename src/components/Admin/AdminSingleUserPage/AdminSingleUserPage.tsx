import { useParams } from "react-router-dom";
import UserCreditDetails from "./children/UserCreditDetails";
interface AdminSingleUserPageProps {}
const AdminSingleUserPage: React.FC<AdminSingleUserPageProps> = ({}) => {
  const { userEmail } = useParams<{ userEmail: string }>();
  if (!userEmail) {
    return null;
  }
  return (
    <div className="p-[32px]">
      <p>{userEmail}</p>
      <div className="w-[300px]">
        <UserCreditDetails userEmail={userEmail} />
      </div>
    </div>
  );
};
export default AdminSingleUserPage;
