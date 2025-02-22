import { useState } from "react";
import { useParams } from "react-router-dom";
import { v4 } from "uuid";
import { z } from "zod";
import useJsonData from "~/hooks/useJsonData";
import aiService from "~/services/aiService";
import experimentsService from "~/services/experimentsService";
import { LoadingSpinner } from "../Shared/LoadingSpinner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
type Persona = {
  id: string;
  name: string;
  collectionName: string;
  description: string;
  instructions: string;
};
type Website = {
  source: string;
  url: string;
  embedded: boolean;
};
interface EditPersonaPageProps {}
const EditPersonaPage: React.FC<EditPersonaPageProps> = ({}) => {
  const { personaId } = useParams<{ personaId: string }>();
  const [persona, setPersona] = useJsonData<Persona>(
    `personas/${personaId}`,
    () => {
      return {
        id: personaId!,
        collectionName: v4(),
        name: "",
        description: "",
        instructions: "",
      };
    }
  );

  const [websites, setWebsites] = useJsonData<Website[]>(
    `personas/${persona?.id}/websites`,
    [],
    { enabled: !!persona }
  );
  const [websiteInput, setWebsiteInput] = useState("");
  const onAddWebsite = async () => {
    if (!persona || !websites) return;
    if (z.string().url().safeParse(websiteInput).success) {
      const url = websiteInput;
      if (websites.find((w) => w.url === url)) return;
      const source = `website:${url}`;
      setWebsites((prev) => [
        ...(prev ?? []),
        { source: source, url: url, embedded: false },
      ]);
      const collectionName = persona.id;
      const websiteMeta = await experimentsService.getWebsiteMeta({ url }).fn();
      const content = websiteMeta.bodyTextContent;
      const result = await aiService.saveText({
        collectionName,
        content,
        source,
      });
      console.log(result);
      setWebsites((prev) =>
        prev?.map((w) => (w.source === source ? { ...w, embedded: true } : w))
      );
    }
  };
  return (
    <div className="p-[20px]">
      <Label>Knowledge</Label>
      <Label>Add Websites</Label>
      <Input
        value={websiteInput}
        onChange={(e) => {
          setWebsiteInput(e.target.value);
        }}
        placeholder="url"
      />
      <Button onClick={onAddWebsite}>Add</Button>
      {websites?.map((w) => (
        <div key={w.source}>
          <p>{w.url}</p>
          <span>{!w.embedded ? <LoadingSpinner /> : null}</span>
        </div>
      ))}
    </div>
  );
};
export default EditPersonaPage;
