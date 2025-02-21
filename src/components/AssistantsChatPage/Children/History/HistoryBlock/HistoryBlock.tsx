import { Conversation } from "~/lib/typesJsonData";
import HistoryDate from "../HistoryDate/HistoryDate";
import HistoryEntry from "../HistoryEntry/HistoryEntry";

interface HistoryBlockProps {
  date: string;
  conversations?: Conversation[];
}
const HistoryBlock: React.FC<HistoryBlockProps> = ({ date, conversations }) => {
  return (
    <div>
      <HistoryDate>{date}</HistoryDate>
      <div className="h-[12px]"></div>
      <div className="flex flex-col gap-[8px]">
        {conversations?.map((item, index) => (
          <HistoryEntry key={index} conversation={item} />
        ))}
      </div>
    </div>
  );
};
export default HistoryBlock;
