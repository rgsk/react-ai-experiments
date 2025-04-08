import { useState } from "react";
import Container from "~/components/Shared/Container";
import JsonRenderer from "~/components/Shared/JsonRenderer";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import useDebounce from "~/hooks/useDebounce";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";

interface AdminJsonDataPageProps {}
const AdminJsonDataPage: React.FC<AdminJsonDataPageProps> = ({}) => {
  const [jsonDataKey, setJsonDataKey] = useState("");
  const debouncedJsonDataKey = useDebounce(jsonDataKey);
  const queryResult = useJsonDataKeysLike({
    key: "raw/" + debouncedJsonDataKey,
    page: 1,
    perPage: 10,
  });
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
      <div className="flex-1 overflow-auto">
        {queryResult.data?.data.map((entry) => {
          return (
            <div key={entry.id} className="space-y-2">
              <p>{entry.key}</p>
              <JsonRenderer object={entry.value} />
            </div>
          );
        })}
      </div>
    </Container>
  );
};
export default AdminJsonDataPage;
