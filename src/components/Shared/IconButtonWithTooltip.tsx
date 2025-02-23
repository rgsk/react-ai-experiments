import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Button } from "../ui/button";

interface IconButtonWithTooltipProps {
  onClick?: () => void;
  icon: React.ReactNode;
  tooltip: string;
  disabled?: boolean;
}
const IconButtonWithTooltip: React.FC<IconButtonWithTooltipProps> = ({
  onClick,
  icon,
  tooltip,
  disabled,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            disabled={disabled}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
export default IconButtonWithTooltip;
