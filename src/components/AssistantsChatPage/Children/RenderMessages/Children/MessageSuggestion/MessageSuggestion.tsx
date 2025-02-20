interface MessageSuggestionProps {
  text: string;
  onClick: () => void;
}
const MessageSuggestion: React.FC<MessageSuggestionProps> = ({
  text,
  onClick,
}) => {
  return (
    <button
      className="border border-[#030a211a] rounded-[8px] bg-white py-[8px] px-[10px]"
      onClick={onClick}
    >
      <span className="text-[14px]">{text}</span>
    </button>
  );
};
export default MessageSuggestion;
