interface ActionButtonProps {
  onClick?: () => void;
  children: any;
}
export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  children,
}) => {
  return (
    <button onClick={onClick} className="hover:bg-accent rounded-[4px] p-1.5">
      {children}
    </button>
  );
};

export default ActionButton;
