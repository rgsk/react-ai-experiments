import { Chat } from "~/lib/typesJsonData";
import HistoryDate from "../HistoryDate/HistoryDate";
import HistoryEntry from "../HistoryEntry/HistoryEntry";

interface HistoryBlockProps {
  date: string;
  chats?: Chat[];
}
const HistoryBlock: React.FC<HistoryBlockProps> = ({ date, chats }) => {
  return (
    <div>
      <HistoryDate>{date}</HistoryDate>
      <div className="h-[12px]"></div>
      <div className="flex flex-col gap-[8px]">
        {chats?.map((item, index) => (
          <HistoryEntry key={index} chat={item} />
        ))}
      </div>
    </div>
  );
};
export default HistoryBlock;
