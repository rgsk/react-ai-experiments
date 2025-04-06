import { WebsiteMeta } from "~/lib/typesJsonData";
import { cn, getDomain } from "~/lib/utils";

interface FetchedWebPageDisplayProps {
  websiteMeta: WebsiteMeta;
  type: "cited-source" | "tool-call";
}
const FetchedWebPageDisplay: React.FC<FetchedWebPageDisplayProps> = ({
  websiteMeta,
  type,
}) => {
  return (
    <div
      className={cn(
        "flex gap-[20px] group hover:bg-muted rounded-lg p-3 min-w-[400px]",
        type === "cited-source" && "bg-muted"
      )}
    >
      <div>
        <div className="flex gap-3">
          <img src={websiteMeta.favicon} className="w-[24px] h-[24px]" />
          <p>{getDomain(websiteMeta.url)}</p>
        </div>
        <p className="font-bold group-hover:underline">{websiteMeta.title}</p>
        <p className="line-clamp-3">{websiteMeta.description}</p>
      </div>
      {websiteMeta.image && (
        <>
          <div className="flex-1"></div>
          <div>
            <img
              src={websiteMeta.image}
              className="max-w-[100px] w-[100px] rounded-lg"
            />
          </div>
        </>
      )}
    </div>
  );
};
export default FetchedWebPageDisplay;
