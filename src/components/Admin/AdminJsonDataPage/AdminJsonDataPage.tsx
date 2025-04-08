import { useEffect, useState } from "react";
import Container from "~/components/Shared/Container";
import CustomPagination from "~/components/Shared/CustomPagination";
import JsonRenderer from "~/components/Shared/JsonRenderer";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import useDebounce from "~/hooks/useDebounce";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import { recursiveParseJson } from "~/lib/utils";
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
      <div className="flex-1 overflow-auto border border-gray-400 p-8 rounded-lg">
        {queryResult.data ? (
          <>
            {queryResult.data.data.map((entry) => {
              return (
                <div key={entry.id} className="space-y-2">
                  <p>{entry.key}</p>
                  <JsonRenderer object={recursiveParseJson(entry.value)} />
                </div>
              );
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
