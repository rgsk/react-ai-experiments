import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { v4 } from "uuid";
import useJsonData from "~/hooks/useJsonData";
import aiService from "~/services/aiService";
import experimentsService from "~/services/experimentsService";
import { LoadingSpinner } from "../Shared/LoadingSpinner";
import { Label } from "../ui/label";

import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Persona, Website } from "~/lib/typesJsonData";
import CentralLoader from "../Shared/CentralLoader";
import { Textarea } from "../ui/textarea";

interface EditPersonaPageProps {}
const EditPersonaPage: React.FC<EditPersonaPageProps> = ({}) => {
  const { personaId } = useParams<{ personaId: string }>();
  const [persona, setPersona, { loading: personaLoading }] =
    useJsonData<Persona>(`personas/${personaId}`, () => {
      return {
        id: personaId!,
        collectionName: v4(),
        name: "",
        description: "",
        instructions: "",
      };
    });

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
      const websiteMeta = await experimentsService.getWebsiteMeta({ url }).fn();
      const content = websiteMeta.bodyTextContent;
      const result = await aiService.saveText({
        collectionName: persona.collectionName,
        content,
        source,
      });
      console.log(result);
      setWebsites((prev) =>
        prev?.map((w) => (w.source === source ? { ...w, embedded: true } : w))
      );
    }
  };
  if (!persona) {
    return <CentralLoader />;
  }
  return (
    <div className="p-[20px]">
      <div>
        <Link to={`/assistants/chat?personaId=${personaId}`}>
          <Button>Chat with me</Button>
        </Link>
      </div>
      <div>
        <Label>Name</Label>
        <Input
          placeholder="Name your GPT"
          value={persona.name}
          onChange={(e) => {
            setPersona({ ...persona, name: e.target.value });
          }}
        />
        <Label>Description</Label>
        <Input
          placeholder="Add a short description about what this GPT does"
          value={persona.description}
          onChange={(e) => {
            setPersona({ ...persona, description: e.target.value });
          }}
        />
        <Label>Instructions</Label>
        <Textarea
          rows={5}
          placeholder="What does this GPT do? How does it behave? What should it avoid doing?"
          value={persona.instructions}
          onChange={(e) => {
            setPersona({ ...persona, instructions: e.target.value });
          }}
        />
      </div>
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
