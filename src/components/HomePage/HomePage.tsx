import { useMemo } from "react";
import { Link } from "react-router-dom";
import { v4 } from "uuid";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Container from "../Shared/Container";
const items = [
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
    <Container>
      <div>
        <h1 className="text-3xl">Explore</h1>
        <div className="h-[20px]"></div>
        <div className="flex gap-4 items-stretch flex-wrap md:flex-row flex-col">
          {items.map((item) => {
            const link =
              item.link === "/chat" ? `/chat/${newChatId}` : item.link;
            return (
              <Link to={link} key={item.link}>
                <Card className="md:w-[350px] h-full">
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
    </Container>
  );
};
export default HomePage;
