interface HistoryDateProps {
  children: string;
}
const HistoryDate: React.FC<HistoryDateProps> = ({ children }) => {
  return (
    <div className="px-[8px]">
      <span className="text-[14px] font-medium">{children}</span>
    </div>
  );
};
export default HistoryDate;
