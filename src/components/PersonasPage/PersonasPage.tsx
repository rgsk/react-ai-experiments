import { Edit, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
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
import jsonDataService from "~/services/jsonDataService";
import ragService from "~/services/ragService";
import NewChatIcon from "../Icons/NewChatIcon";
import CentralLoader from "../Shared/CentralLoader";
import { LoadingSpinner } from "../Shared/LoadingSpinner";
import { Button } from "../ui/button";

interface PersonasPageProps {}
const PersonasPage: React.FC<PersonasPageProps> = ({}) => {
  const { data: personas, refetch: refetchPersonas } =
    useJsonDataKeysLike<Persona>({ key: `personas/${uuidPlaceholder}` });
  const navigate = useNavigate();
  const [personasDeleteInProgressIds, setPersonasDeleteInProgressIds] =
    useState<string[]>([]);
  const newChatId = useMemo(() => v4(), []);
  const handlePersonaDelete = async (persona: Persona) => {
    setPersonasDeleteInProgressIds((prev) => [...prev, persona.id]);
    await ragService.deleteCollection({
      collectionName: persona.collectionName,
    });
    await jsonDataService.deleteKeysLike({
      key: `personas/${persona.id}%`,
    });
    setPersonasDeleteInProgressIds((prev) =>
      prev.filter((v) => v !== persona.id)
    );
    refetchPersonas();
  };
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
      <div className="flex flex-wrap gap-4 items-stretch">
        {personas.data.map(({ value: persona }) => (
          <Card className="w-[350px] flex flex-col" key={persona.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <p>{persona.name}</p>
                <Link to={`/chat/${newChatId}?personaId=${persona.id}`}>
                  <Button variant="outline">
                    <NewChatIcon />
                    <span>Chat</span>
                  </Button>
                </Link>
              </CardTitle>
              <div className="h-[8px]"></div>
              <CardDescription className={cn("line-clamp-2")}>
                {persona.description}
              </CardDescription>
            </CardHeader>
            <div className="flex-1"></div>
            <CardFooter className="flex justify-between">
              <Link to={`/personas/edit/${persona.id}`}>
                <Button variant={"outline"} className="flex gap-2 items-center">
                  <Edit /> <span>Edit</span>
                </Button>
              </Link>
              <Button
                variant={"outline"}
                className="flex gap-2 items-center"
                onClick={() => {
                  handlePersonaDelete(persona);
                }}
              >
                {personasDeleteInProgressIds.includes(persona.id) ? (
                  <LoadingSpinner />
                ) : (
                  <Trash2 />
                )}{" "}
                <span>Delete</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default PersonasPage;
