interface MessageActionsProps {
  children: any;
}
const MessageActions: React.FC<MessageActionsProps> = ({ children }) => {
  return (
    <div className="flex">
      <div className="flex gap-[4px] rounded-sm p-[6px]">{children}</div>
    </div>
  );
};
export default MessageActions;

interface ActionButtonProps {
  onClick?: () => void;
  icon: any;
}
export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
}) => {
  return (
    <button onClick={onClick} className="hover:bg-accent rounded-[4px] p-1">
      {icon}
    </button>
  );
};
