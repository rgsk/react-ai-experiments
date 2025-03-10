import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface ActionButtonProps {
  onClick?: () => void;
  children: any;
  tooltip?: string;
}
export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  children,
  tooltip,
}) => {
  const renderButton = () => {
    return (
      <button onClick={onClick} className="hover:bg-accent rounded-[4px] p-1.5">
        {children}
      </button>
    );
  };
  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{renderButton()}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <>{renderButton()}</>;
};

export default ActionButton;
