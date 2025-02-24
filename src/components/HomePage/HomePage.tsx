import { Link } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
];
interface HomePageProps {}
const HomePage: React.FC<HomePageProps> = ({}) => {
  return (
    <div className="p-[32px]">
      <div className="flex gap-4 items-stretch">
        {items.map((item) => {
          return (
            <Link to={item.link} key={item.link}>
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
  );
};
export default HomePage;
