import { CheckCheck, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "~/components/ui/button";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import { CreditDetails } from "~/lib/typesJsonData";
import { getToken } from "~/providers/context/useGlobalContext";

interface AdminHomePageProps {}
const AdminHomePage: React.FC<AdminHomePageProps> = ({}) => {
  const { data: creditDetailsEntries } = useJsonDataKeysLike<CreditDetails>({
    key: "admin/public/creditDetails/%",
  });

  return (
    <div className="p-[32px]">
      <CopyTokenButton />
      <div className="h-[30px]"></div>
      <div className="space-y-2">
        {creditDetailsEntries?.data?.map(({ value: creditDetails }) => {
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

interface CopyTokenButtonProps {}
const CopyTokenButton: React.FC<CopyTokenButtonProps> = ({}) => {
  const { copy, copied } = useCopyToClipboard();

  return (
    <Button
      variant="outline"
      onClick={async () => {
        const token = await getToken();
        if (token) {
          copy(token);
        }
      }}
    >
      <span>
        {copied ? (
          <CheckCheck className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </span>
      Copy Token
    </Button>
  );
};
