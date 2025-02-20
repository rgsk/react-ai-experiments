interface MessageActionsProps {
  children: any;
}
const MessageActions: React.FC<MessageActionsProps> = ({ children }) => {
  return (
    <div className="flex">
      <div className="flex gap-[4px] border border-gslearnlightmodeGrey4 rounded-sm p-[6px] bg-white">
        {children}
      </div>
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
    <button
      onClick={onClick}
      className="hover:bg-[#F2F3F4] rounded-[4px] p-0.5"
    >
      {icon}
    </button>
  );
};
