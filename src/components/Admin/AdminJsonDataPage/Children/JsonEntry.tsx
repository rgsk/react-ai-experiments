import JsonRenderer from "~/components/Shared/JsonRenderer";
import { recursiveParseJson } from "~/lib/utils";
import { JsonData } from "~/services/jsonDataService";

interface JsonEntryProps {
  entry: JsonData<unknown>;
}
const JsonEntry: React.FC<JsonEntryProps> = ({ entry }) => {
  return (
    <div>
      <JsonRenderer
        object={recursiveParseJson(entry.value)}
        heading={entry.key}
        wordWrap={true}
      />
    </div>
  );
};
export default JsonEntry;
