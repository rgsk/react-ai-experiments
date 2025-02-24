import { CheckCheck, Copy } from "lucide-react";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import useGlobalContext from "~/hooks/useGlobalContext";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import { CreditDetails } from "~/lib/typesJsonData";
import { Button } from "../ui/button";

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
      {creditDetailsEntries?.map((creditDetails) => {
        return (
          <div key={creditDetails.id}>
            {creditDetails.userEmail}: {creditDetails.balance}
          </div>
        );
      })}
    </div>
  );
};
export default AdminHomePage;
