import { FetchedWebPage } from "~/lib/typesJsonData";
import { cn, getDomain, getFavicon } from "~/lib/utils";

interface FetchedWebPageDisplayProps {
  url: string;
  fetchedWebPage: FetchedWebPage;
  type: "cited-source" | "tool-call";
}
const FetchedWebPageDisplay: React.FC<FetchedWebPageDisplayProps> = ({
  url,
  fetchedWebPage,
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
          <img src={getFavicon(getDomain(url))} className="w-[24px] h-[24px]" />
          <p>{getDomain(url)}</p>
        </div>
        <p className="font-bold group-hover:underline">
          {fetchedWebPage.title}
        </p>
        <p className="line-clamp-3">{fetchedWebPage.description}</p>
      </div>
      {fetchedWebPage.og?.image && (
        <>
          <div className="flex-1"></div>
          <div>
            <img
              src={fetchedWebPage.og.image}
              className="max-w-[100px] w-[100px] rounded-lg"
            />
          </div>
        </>
      )}
    </div>
  );
};
export default FetchedWebPageDisplay;
