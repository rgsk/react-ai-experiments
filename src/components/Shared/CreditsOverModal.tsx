import { CircleAlert, X } from "lucide-react";
import SimpleModal from "~/components/Shared/SimpleModal";
import { Button } from "../ui/button";

interface CreditsOverModalProps {
  onClose: () => void;
  message: string;
}
const CreditsOverModal: React.FC<CreditsOverModalProps> = ({
  onClose,
  message,
}) => {
  return (
    <SimpleModal maxWidth={400} onClose={onClose}>
      <div className="bg-background rounded-[16px] p-[16px]">
        <div className="flex items-start justify-end">
          <Button size="icon" variant="outline" onClick={onClose}>
            <X />
          </Button>
        </div>
        <div className="flex justify-center">
          <CircleAlert className="text-destructive" />
        </div>
        <div className="h-[12px]"></div>
        <p className="text-[14px] font-medium text-center">{message}</p>
        <div className="h-[16px]"></div>
        {/* <LearnersButton
          className="w-full"
          onClick={() => {
            const url = `${environmentVars.EMILY_APP_URL}/ai-credits`;
            window.open(url, "_blank");
          }}
        >
          See Credit Details
        </LearnersButton> */}
        <div className="h-[4px]"></div>
      </div>
    </SimpleModal>
  );
};

export default CreditsOverModal;
