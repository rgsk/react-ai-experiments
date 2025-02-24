import { Edit, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import { uuidPlaceholder } from "~/lib/constants";
import { Persona } from "~/lib/typesJsonData";
import { cn } from "~/lib/utils";
import CentralLoader from "../Shared/CentralLoader";
import { Button } from "../ui/button";

interface PersonasPageProps {}
const PersonasPage: React.FC<PersonasPageProps> = ({}) => {
  const { data: personas } = useJsonDataKeysLike<Persona>(
    `personas/${uuidPlaceholder}`
  );
  const navigate = useNavigate();
  if (!personas) {
    return <CentralLoader />;
  }
  return (
    <div className="p-[32px]">
      <h1 className="text-3xl">Your AI Personas</h1>
      <div className="h-[30px]"></div>
      <div className="">
        <Button
          onClick={() => {
            navigate(`/personas/edit/${v4()}`);
          }}
        >
          <Plus />
          <span>Create Persona</span>
        </Button>
      </div>{" "}
      <div className="h-[30px]"></div>
      <div className="flex flex-wrap gap-4">
        {personas.map((persona) => (
          <Link
            to={`/assistants/chat?personaId=${persona.id}`}
            key={persona.id}
          >
            <Card className="w-[350px]">
              <CardHeader>
                <CardTitle>{persona.name}</CardTitle>
                <CardDescription
                  className={cn(
                    "line-clamp-1",
                    !persona.description && "opacity-0"
                  )}
                >
                  {persona.description || "empty"}
                </CardDescription>
              </CardHeader>
              {/* <CardContent></CardContent> */}
              <CardFooter className="flex justify-between">
                <Link to={`/personas/edit/${persona.id}`}>
                  <Button
                    variant={"outline"}
                    className="flex gap-2 items-center"
                  >
                    <Edit className="h-4 w-4" /> <span>Edit</span>
                  </Button>
                </Link>
                <Button variant={"outline"} className="flex gap-2 items-center">
                  <Trash2 className="h-4 w-4" /> <span>Delete</span>
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default PersonasPage;
