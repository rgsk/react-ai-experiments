interface HistoryDateProps {
  children: string;
}
const HistoryDate: React.FC<HistoryDateProps> = ({ children }) => {
  return (
    <div>
      <span className="text-[14px] text-gslearnlightmodeGrey1">{children}</span>
    </div>
  );
};
export default HistoryDate;
