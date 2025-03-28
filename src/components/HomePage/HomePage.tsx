import { useMemo } from "react";
import { Link } from "react-router-dom";
import { v4 } from "uuid";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import authService from "~/lib/authService";
import ProfileInfo from "../ProfileInfo/ProfileInfo";
import { ModeToggle } from "../Shared/ModeToggle";
import { Button } from "../ui/button";
const items = [
  {
    link: `/assistants/chat`,
    title: "Assistants Chat",
    description: "Chat with General Assistant",
  },
  {
    link: `/personas`,
    title: "Personas",
    description: "Create AI Personas with Knowledge base and Chat with them",
  },
  {
    link: `/chat`,
    title: "Chat",
    description:
      "Chat with AI having multitude of features like file search, code interpreter, artifacts",
  },
];
interface HomePageProps {}
const HomePage: React.FC<HomePageProps> = ({}) => {
  const newChatId = useMemo(() => v4(), []);
  return (
    <div className="p-[32px]">
      <div className="flex gap-4 items-center">
        <p> Toggle Theme:</p> <ModeToggle />
      </div>
      <div className="h-[20px]"></div>
      <div className="max-w-[300px]">
        <p className="text-lg">Logged in as: </p>
        <div className="h-[10px]"></div>
        <ProfileInfo />
        <div className="h-[10px]"></div>
        <Button variant="outline" onClick={authService.logout}>
          Logout
        </Button>
      </div>
      <div className="h-[30px]"></div>
      <div>
        <h1 className="text-3xl">Explore</h1>
        <div className="h-[20px]"></div>
        <div className="flex gap-4 items-stretch">
          {items.map((item) => {
            const link =
              item.link === "/chat" ? `/chat/${newChatId}` : item.link;
            return (
              <Link to={link} key={item.link}>
                <Card className="w-[350px] h-full">
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default HomePage;
