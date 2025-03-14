import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import experimentsService from "~/services/experimentsService";
import { Input } from "../ui/input";

interface PracticePageProps {}

const PracticePage: React.FC<PracticePageProps> = ({}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const searchMessagesQuery = useMemo(
    () => experimentsService.searchMessages({ q: searchTerm }),
    [searchTerm]
  );

  const searchMessagesQueryResult = useQuery({
    queryKey: searchMessagesQuery.key,
    queryFn: searchMessagesQuery.fn,
    enabled: !!searchTerm,
  });

  return (
    <div>
      <Input
        placeholder="Search chats..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
      />
      {searchMessagesQueryResult.data?.map((d) => {
        const messages = d.value;
        const matchingMessage = messages.find(
          (m) =>
            ["user", "assistant"].includes(m.role) &&
            typeof m.content === "string" &&
            m.content.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (!matchingMessage) return null;

        const content = matchingMessage.content as string;
        const index = content.toLowerCase().indexOf(searchTerm.toLowerCase());
        const snippetLength = 100; // Adjust this to control snippet size

        let snippet = content;
        if (index !== -1) {
          const start = Math.max(0, index - snippetLength / 2);
          const end = Math.min(
            content.length,
            index + searchTerm.length + snippetLength / 2
          );
          snippet =
            (start > 0 ? "..." : "") +
            content.slice(start, end) +
            (end < content.length ? "..." : "");
        }

        return (
          <div key={d.id}>
            <p className="line-clamp-1">{snippet}</p>
          </div>
        );
      })}
    </div>
  );
};

export default PracticePage;
