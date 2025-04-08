import JsonRenderer from "~/components/Shared/JsonRenderer";
import { recursiveParseJson } from "~/lib/utils";
import { JsonData } from "~/services/jsonDataService";

interface JsonEntryProps {
  entry: JsonData<unknown>;
}
const JsonEntry: React.FC<JsonEntryProps> = ({ entry }) => {
  return (
    <div className="space-y-2">
      <div className="sticky top-[-32px] bg-background py-2 text-sm z-50">
        {entry.key}
      </div>
      <JsonRenderer
        object={recursiveParseJson(entry.value)}
        disableHeader
        wordWrap={true}
      />
    </div>
  );
};
export default JsonEntry;
