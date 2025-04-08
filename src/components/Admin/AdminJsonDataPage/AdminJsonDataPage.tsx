import { RotateCwIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Container from "~/components/Shared/Container";
import CustomPagination from "~/components/Shared/CustomPagination";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import useDebounce from "~/hooks/useDebounce";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import JsonEntry from "./Children/JsonEntry";
const perPage = 10;
interface AdminJsonDataPageProps {}
const AdminJsonDataPage: React.FC<AdminJsonDataPageProps> = ({}) => {
  const [jsonDataKey, setJsonDataKey] = useState("");
  const debouncedJsonDataKey = useDebounce(jsonDataKey);
  const [currentPage, setCurrentPage] = useState(1);
  const queryResult = useJsonDataKeysLike(
    {
      key: "raw/" + debouncedJsonDataKey,
      page: currentPage,
      perPage: perPage,
    },
    { enabled: !!debouncedJsonDataKey }
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedJsonDataKey]);
  return (
    <Container>
      <div className="space-y-2">
        <Label>Key:</Label>
        <Input
          value={jsonDataKey}
          onChange={(e) => {
            setJsonDataKey(e.target.value);
          }}
        />
      </div>
      <div className="min-h-[30px]"></div>
      <div className="flex">
        <Button
          onClick={() => {
            queryResult.refetch();
          }}
          variant="outline"
        >
          {queryResult.isRefetching ? <LoadingSpinner /> : <RotateCwIcon />}
          <span>Reload</span>
        </Button>
      </div>
      <div className="min-h-[30px]"></div>
      <div className="flex-1 overflow-auto border border-gray-400 p-4 rounded-lg">
        {queryResult.data ? (
          <>
            {queryResult.data.data.map((entry, i) => {
              // key={JSON.stringify(entry)} is important to correctly update
              return <JsonEntry key={JSON.stringify(entry)} entry={entry} />;
            })}
          </>
        ) : (
          <>{queryResult.isLoading ? <LoadingSpinner /> : <></>}</>
        )}
      </div>
      <div className="min-h-[30px]"></div>
      <div>
        <CustomPagination
          total={queryResult.data?.count ?? 0}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          perPage={perPage}
        />
      </div>
    </Container>
  );
};
export default AdminJsonDataPage;
