import { ArrowRight } from "lucide-react";
import { HandleSend } from "~/components/ChatPage/ChatPage";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { Separator } from "~/components/ui/separator";

interface RelatedQuestionsProps {
  questionSuggestions: string[];
  questionSuggestionsLoading: boolean;
  handleSend?: HandleSend;
}
const RelatedQuestions: React.FC<RelatedQuestionsProps> = ({
  questionSuggestions,
  questionSuggestionsLoading,
  handleSend,
}) => {
  return (
    <div>
      {questionSuggestionsLoading && <LoadingSpinner size={20} />}
      {questionSuggestions.length > 0 && (
        <>
          <div>
            <p>Related Questions:</p>
          </div>
          <div className="h-2"></div>
          <div className="flex flex-col">
            {questionSuggestions.map((qs, i) => (
              <button
                key={qs + i}
                onClick={() => {
                  handleSend?.({ text: qs });
                }}
              >
                {i === 0 && <Separator />}
                <div className="py-2 text-left flex gap-2 items-center justify-between hover:bg-muted/50 transition-colors">
                  <span>{qs}</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
                <Separator />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
export default RelatedQuestions;
