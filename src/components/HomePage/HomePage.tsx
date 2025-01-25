import { useState } from "react";
import { Link } from "react-router-dom";
import { v4 } from "uuid";
import { Button } from "~/components/ui/button";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import { Chat } from "~/lib/typesJsonData";
import { ModeToggle } from "../Shared/ModeToggle";

interface HomePageProps {}
const HomePage: React.FC<HomePageProps> = ({}) => {
  const [count, setCount] = useState(1);
  const { data: chats } = useJsonDataKeysLike<Chat>("chat.%");
  return (
    <div>
      <div>
        <p className="text-red-500 text-lg">Home Page</p>
        <Link to="/practice">Go To Practice Page</Link>
        <p>
          <Link to={`/chat/${v4()}`}>Chat</Link>
        </p>
        {chats?.map((chat) => {
          return <div key={chat.id}>{chat.title}</div>;
        })}
      </div>
      <Button
        onClick={() => {
          setCount((prev) => prev + 1);
        }}
      >
        Count: {count}
      </Button>
      <ModeToggle />
    </div>
  );
};
export default HomePage;
