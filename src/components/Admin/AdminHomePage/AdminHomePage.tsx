import { CheckCheck, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "~/components/ui/button";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import useGlobalContext from "~/hooks/useGlobalContext";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import { CreditDetails } from "~/lib/typesJsonData";

interface AdminHomePageProps {}
const AdminHomePage: React.FC<AdminHomePageProps> = ({}) => {
  const { copy, copied, copiedText } = useCopyToClipboard();
  const { token } = useGlobalContext();
  const { data: creditDetailsEntries } = useJsonDataKeysLike<CreditDetails>(
    "admin/public/creditDetails/%"
  );

  return (
    <div className="p-[32px]">
      <Button
        variant="outline"
        onClick={() => {
          if (token) {
            copy(token);
          }
        }}
      >
        <span>
          {copied && copiedText === token ? (
            <CheckCheck className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </span>
        Copy Token
      </Button>
      <div className="h-[30px]"></div>
      <div className="space-y-2">
        {creditDetailsEntries?.map((creditDetails) => {
          return (
            <div key={creditDetails.id} className="flex justify-between">
              {creditDetails.userEmail}: {creditDetails.balance}
              <Link to={`/admin/users/${creditDetails.userEmail}`}>
                <Button>View</Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default AdminHomePage;
