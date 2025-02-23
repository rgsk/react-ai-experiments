import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { v4 } from "uuid";
import useJsonData from "~/hooks/useJsonData";
import aiService from "~/services/aiService";
import experimentsService from "~/services/experimentsService";
import { LoadingSpinner } from "../Shared/LoadingSpinner";
import { Label } from "../ui/label";

import { RotateCcw, Trash2 } from "lucide-react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useDropArea from "~/hooks/useDropArea";
import { Persona, PersonaKnowledgeItem } from "~/lib/typesJsonData";
import { supportedExtensions } from "~/services/assistantsService";
import { DraggingBackdrop } from "../AssistantsChatPage/AssistantsChatPage";
import FileUploadedPreview from "../AssistantsChatPage/Children/FileUploadedPreview/FileUploadedPreview";
import { FileEntry } from "../AssistantsChatPage/Children/MessageInput/MessageInput";
import CentralLoader from "../Shared/CentralLoader";
import IconButtonWithTooltip from "../Shared/IconButtonWithTooltip";
import TargetBlankLink from "../Shared/TargetBlankLink";
import { Textarea } from "../ui/textarea";

const getContent = async ({
  url,
  type,
}: {
  url: string;
  type: PersonaKnowledgeItem["type"];
}) => {
  if (type === "website") {
    const content = await experimentsService.getUrlContent({ url }).fn();
    return content;
  }
  return "";
};
interface EditPersonaPageProps {}
const EditPersonaPage: React.FC<EditPersonaPageProps> = ({}) => {
  const { personaId } = useParams<{ personaId: string }>();
  const [itemsDeletingIds, setItemsDeletingIds] = useState<string[]>([]);
  const [itemsEmbeddingIds, setItemsEmbeddingIds] = useState<string[]>([]);
  const [addWebsiteLoading, setAddWebsiteLoading] = useState(false);
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

  const [
    personaKnowledgeItems,
    setPersonaKnowledgeItems,
    { loading: personaKnowledgeItemsLoading },
  ] = useJsonData<PersonaKnowledgeItem[]>(
    `personas/${persona?.id}/personaKnowledgeItems`,
    [],
    {
      enabled: !!persona,
    }
  );
  const personaKnowledgeItemsRef = useRef(personaKnowledgeItems);
  personaKnowledgeItemsRef.current = personaKnowledgeItems;
  const [websiteInput, setWebsiteInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<FileEntry[]>([]);

  const handleFilesChange = async (files: File[]) => {
    if (files) {
      const supportedFiles: File[] = [];
      const unsupportedFiles: File[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext && supportedExtensions.includes(ext)) {
          supportedFiles.push(file);
        } else {
          unsupportedFiles.push(file);
        }
      }
      setAttachedFiles((prev) => [
        ...prev,
        ...supportedFiles.map((file) => ({ id: v4(), file })),
      ]);
      if (unsupportedFiles.length > 0) {
        setTimeout(() => {
          alert(
            `Some of the files you have added are not supported: ${unsupportedFiles
              .map((file) => file.name)
              .join(", ")}`
          );
        }, 500);
      }
    }
  };
  const { dropAreaProps, isDragging } = useDropArea({
    onFilesChange: handleFilesChange,
  });
  const onAddWebsite = async () => {
    if (!personaKnowledgeItems) return;
    if (z.string().url().safeParse(websiteInput).success) {
      const type: PersonaKnowledgeItem["type"] = "website";
      const url = websiteInput;
      if (personaKnowledgeItems.find((w) => w.type === type && w.url === url)) {
        return alert("this website is already added");
      }
      setAddWebsiteLoading(true);
      onAddPersonaKnowledgeItem({
        id: v4(),
        source: `website:${url}`,
        url: url,
        embedded: false,
        type: "website",
        metadata: {},
      });
      setWebsiteInput("");
      setAddWebsiteLoading(false);
    } else {
      return alert("website url is not valid");
    }
  };
  const onAddFile = async ({
    url,
    filename,
    filetype,
  }: {
    url: string;
    filename: string;
    filetype: string;
  }) => {
    onAddPersonaKnowledgeItem({
      id: v4(),
      source: `file:${url}`,
      url: url,
      embedded: false,
      type: "file",
      metadata: {
        filename,
        filetype,
      },
    });
  };
  const onAddPersonaKnowledgeItem = async (item: PersonaKnowledgeItem) => {
    if (!persona || !personaKnowledgeItems) return;

    setPersonaKnowledgeItems((prev) => [...(prev ?? []), item]);
    onItemEmbed(item);
  };
  const onItemEmbed = async (item: PersonaKnowledgeItem) => {
    if (!persona) return;
    try {
      setItemsEmbeddingIds((prev) => [...prev, item.id]);
      const content = await getContent({ url: item.url, type: item.type });
      const result = await aiService.saveText({
        collectionName: persona.collectionName,
        content: content,
        source: item.source,
      });
      console.log(result);
      setPersonaKnowledgeItems((prev) =>
        prev?.map((w) =>
          w.source === item.source ? { ...w, embedded: true } : w
        )
      );
    } catch (err) {
      console.error(err);
      return alert("error while generating embeddings, see console");
    } finally {
      setItemsEmbeddingIds((prev) => prev.filter((v) => v !== item.id));
    }
  };
  const onDeletePersonaKnowledgeItem = async (item: PersonaKnowledgeItem) => {
    if (!persona || !personaKnowledgeItems) return;
    setItemsDeletingIds((prev) => [...prev, item.id]);
    await aiService.deleteText({
      collectionName: persona.collectionName,
      source: item.source,
    });
    setItemsDeletingIds((prev) => prev.filter((v) => v !== item.id));
    setPersonaKnowledgeItems((prev) => prev?.filter((p) => p.id !== item.id));
  };
  if (!persona || !personaKnowledgeItems) {
    return <CentralLoader />;
  }
  return (
    <div className="py-[100px] max-w-[800px] m-auto" {...dropAreaProps}>
      {isDragging && <DraggingBackdrop />}
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
      <div>
        <div>
          <Label>Add Websites</Label>
          <Input
            value={websiteInput}
            onChange={(e) => {
              setWebsiteInput(e.target.value);
            }}
            placeholder="url"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onAddWebsite();
              }
            }}
          />
        </div>

        <Button onClick={onAddWebsite} disabled={addWebsiteLoading}>
          {addWebsiteLoading && <LoadingSpinner />}
          <span>Add</span>
        </Button>
      </div>
      {personaKnowledgeItems
        .filter((v) => v.type === "website")
        .map((w) => {
          const deleting = itemsDeletingIds.includes(w.id);
          const embedding = itemsEmbeddingIds.includes(w.id);
          return (
            <div key={w.id} className="flex justify-between items-center">
              <TargetBlankLink href={w.url}>{w.url}</TargetBlankLink>
              <span>
                {!w.embedded ? (
                  <IconButtonWithTooltip
                    disabled={embedding}
                    icon={
                      embedding ? (
                        <LoadingSpinner size={16} />
                      ) : (
                        <RotateCcw size={16} />
                      )
                    }
                    tooltip="Retry"
                    onClick={() => {
                      onItemEmbed(w);
                    }}
                  />
                ) : (
                  <IconButtonWithTooltip
                    disabled={deleting}
                    icon={
                      deleting ? (
                        <LoadingSpinner size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )
                    }
                    tooltip="Delete"
                    onClick={() => {
                      onDeletePersonaKnowledgeItem(w);
                    }}
                  />
                )}
              </span>
            </div>
          );
        })}
      <div>
        <div>
          <Label>Upload Files</Label>
        </div>

        {attachedFiles.length > 0 && (
          <div className="flex gap-[16px] pb-[24px] pt-[12px]">
            {attachedFiles.map((fileEntry) => (
              <FileUploadedPreview
                key={fileEntry.id}
                destination="s3"
                fileEntry={fileEntry}
                onRemove={() => {
                  if (fileEntry.s3Url) {
                    experimentsService.deleteFileFromS3(fileEntry.s3Url);
                  }
                  setAttachedFiles((prev) =>
                    prev.filter((entry) => entry.id !== fileEntry.id)
                  );
                }}
                onS3Upload={(s3Url) => {
                  setAttachedFiles((prev) =>
                    prev.map((entry) =>
                      entry.id === fileEntry.id ? { ...entry, s3Url } : entry
                    )
                  );
                  console.log({ s3Url });
                  // if (fileEntry.file) {
                  //   onAddFile({
                  //     url: s3Url,
                  //     filename: fileEntry.file.name,
                  //     filetype: fileEntry.file.type,
                  //   });
                  // }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPersonaPage;
