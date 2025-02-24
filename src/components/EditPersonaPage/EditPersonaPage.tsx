import { useEffect, useRef, useState } from "react";
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
import { handleInputOnPaste } from "~/lib/utils";
import { supportedExtensions } from "~/services/assistantsService";
import { DraggingBackdrop } from "../AssistantsChatPage/AssistantsChatPage";
import FileUploadedPreview from "../AssistantsChatPage/Children/FileUploadedPreview/FileUploadedPreview";
import { FileEntry } from "../AssistantsChatPage/Children/MessageInput/MessageInput";
import NewChatIcon from "../Icons/NewChatIcon";
import CentralLoader from "../Shared/CentralLoader";
import FileInputTrigger from "../Shared/FileInputTrigger";
import IconButtonWithTooltip from "../Shared/IconButtonWithTooltip";
import TargetBlankLink from "../Shared/TargetBlankLink";
import { Textarea } from "../ui/textarea";

const getContent = async (item: PersonaKnowledgeItem) => {
  if (item.type === "website") {
    const content = await experimentsService
      .getUrlContent({ url: item.url })
      .fn();
    return content;
  } else if (item.type === "file") {
    const { url: signedUrl } = await experimentsService
      .getAWSDownloadUrl({ url: item.url })
      .fn();
    const isImage = item.metadata.filetype.startsWith("image/");
    if (isImage) {
      const result = await experimentsService
        .getUrlContent({ url: signedUrl, type: "image" })
        .fn();
      return result;
    } else {
      const result = await experimentsService
        .getUrlContent({ url: signedUrl })
        .fn();
      return result;
    }
  }
  return "empty content";
};
interface EditPersonaPageProps {}
const EditPersonaPage: React.FC<EditPersonaPageProps> = ({}) => {
  const { personaId } = useParams<{ personaId: string }>();
  const [itemsDeleteInProgressIds, setItemsDeleteInProgressIds] = useState<
    string[]
  >([]);
  const [itemsEmbeddingInProgressIds, setItemsEmbeddingInProgressIds] =
    useState<string[]>([]);
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

  useEffect(() => {
    if (!personaKnowledgeItemsLoading && personaKnowledgeItemsRef.current) {
      const fileItems = personaKnowledgeItemsRef.current.filter(
        (v) => v.type === "file"
      );
      (async () => {
        const attachmentEntries = await Promise.all(
          fileItems.map(async (f) => {
            const signedS3Url = (
              await experimentsService.getAWSDownloadUrl({ url: f.url }).fn()
            ).url;
            return {
              id: f.id,
              fileMetadata: {
                name: f.metadata.filename,
                type: f.metadata.filetype,
              },
              s3Url: signedS3Url,
            };
          })
        );
        setAttachedFiles(attachmentEntries);
      })();
    }
  }, [personaKnowledgeItemsLoading]);

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
      setItemsEmbeddingInProgressIds((prev) => [...prev, item.id]);
      const content = await getContent(item);
      console.log({ content });
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
      setItemsEmbeddingInProgressIds((prev) =>
        prev.filter((v) => v !== item.id)
      );
    }
  };
  const onDeletePersonaKnowledgeItem = async (item: PersonaKnowledgeItem) => {
    if (!persona || !personaKnowledgeItems) return;
    setItemsDeleteInProgressIds((prev) => [...prev, item.id]);
    await aiService.deleteText({
      collectionName: persona.collectionName,
      source: item.source,
    });
    setItemsDeleteInProgressIds((prev) => prev.filter((v) => v !== item.id));
    setPersonaKnowledgeItems((prev) => prev?.filter((p) => p.id !== item.id));
  };
  if (!persona || !personaKnowledgeItems) {
    return <CentralLoader />;
  }
  return (
    <div className="p-[32px] relative" {...dropAreaProps}>
      {isDragging && <DraggingBackdrop />}
      <div className="max-w-[800px] m-auto">
        <h1 className="text-3xl">Persona: {persona.name}</h1>
        <div className="h-[30px]"></div>
        <div>
          <Link to={`/assistants/chat?personaId=${personaId}`}>
            <Button>
              <NewChatIcon />
              <span>Chat with me</span>
            </Button>
          </Link>
        </div>
        <div className="h-[30px]"></div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              placeholder="Name your GPT"
              value={persona.name}
              onChange={(e) => {
                setPersona({ ...persona, name: e.target.value });
              }}
            />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input
              placeholder="Add a short description about what this GPT does"
              value={persona.description}
              onChange={(e) => {
                setPersona({ ...persona, description: e.target.value });
              }}
            />
          </div>
          <div className="space-y-1">
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
        </div>
        <div className="h-[30px]"></div>
        <div>
          <div>
            <div className="space-y-2">
              <Label>Knowledge</Label>
              <p className="text-sm">
                Add websites or drag/paste images/files here
              </p>
              <Input
                value={websiteInput}
                onChange={(e) => {
                  setWebsiteInput(e.target.value);
                }}
                placeholder="url of website/youtube video/image/pdf/public google doc/sheet"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onAddWebsite();
                  }
                }}
                onPaste={(event) => {
                  handleInputOnPaste(event, handleFilesChange);
                }}
              />
            </div>
            <div className="h-[8px]"></div>
            <Button
              variant="outline"
              onClick={onAddWebsite}
              disabled={addWebsiteLoading}
            >
              {addWebsiteLoading && <LoadingSpinner />}
              <span>Add</span>
            </Button>
          </div>
          <div className="h-[20px]"></div>
          <div>
            <Label>Added Links</Label>
            <div>
              {personaKnowledgeItems
                .filter((v) => v.type === "website")
                .map((w) => {
                  const deleteInProgress = itemsDeleteInProgressIds.includes(
                    w.id
                  );
                  const embeddingInProgress =
                    itemsEmbeddingInProgressIds.includes(w.id);
                  return (
                    <div
                      key={w.id}
                      className="flex justify-between items-center"
                    >
                      <TargetBlankLink href={w.url}>
                        <span className="text-sm">{w.url}</span>
                      </TargetBlankLink>
                      <span>
                        {!w.embedded ? (
                          <IconButtonWithTooltip
                            disabled={embeddingInProgress}
                            icon={
                              embeddingInProgress ? (
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
                            disabled={deleteInProgress}
                            icon={
                              deleteInProgress ? (
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
            </div>
          </div>
        </div>

        <div className="h-[30px]"></div>
        <div>
          <div className="space-y-2">
            <Label>Uploaded Files</Label>
            <p className="text-sm">Upload image/text/csv/pdf file</p>
          </div>

          <div>
            {attachedFiles.length > 0 ? (
              <div className="flex gap-[16px] pb-[24px] pt-[12px] flex-wrap">
                {attachedFiles.map((fileEntry) => {
                  const personaKnowledgeItem = personaKnowledgeItems.find(
                    (v) => v.url === fileEntry.s3Url?.split("?")[0]
                  );
                  const embeddingInProgress = personaKnowledgeItem
                    ? itemsEmbeddingInProgressIds.includes(
                        personaKnowledgeItem.id
                      )
                    : false;
                  return (
                    <div key={fileEntry.id}>
                      <FileUploadedPreview
                        key={fileEntry.id}
                        destination="s3"
                        fileEntry={fileEntry}
                        onRemove={() => {
                          if (fileEntry.s3Url) {
                            experimentsService.deleteFileFromS3(
                              fileEntry.s3Url
                            );
                          }
                          setAttachedFiles((prev) =>
                            prev.filter((entry) => entry.id !== fileEntry.id)
                          );
                          if (personaKnowledgeItem) {
                            onDeletePersonaKnowledgeItem(personaKnowledgeItem);
                          }
                        }}
                        onS3Upload={(s3Url) => {
                          setAttachedFiles((prev) =>
                            prev.map((entry) =>
                              entry.id === fileEntry.id
                                ? { ...entry, s3Url }
                                : entry
                            )
                          );
                          console.log({ s3Url });
                          if (fileEntry.file) {
                            onAddFile({
                              url: s3Url,
                              filename: fileEntry.file.name,
                              filetype: fileEntry.file.type,
                            });
                          }
                        }}
                      />
                      {!personaKnowledgeItem ? null : (
                        <div>
                          {!personaKnowledgeItem.embedded ? (
                            <div>
                              <IconButtonWithTooltip
                                disabled={embeddingInProgress}
                                icon={
                                  embeddingInProgress ? (
                                    <LoadingSpinner size={16} />
                                  ) : (
                                    <RotateCcw size={16} />
                                  )
                                }
                                tooltip="Retry"
                                onClick={() => {
                                  onItemEmbed(personaKnowledgeItem);
                                }}
                              />
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm my-2">
                No Uploaded Files, click the button below to add files
              </p>
            )}
          </div>
          <FileInputTrigger
            handleFilesChange={handleFilesChange}
            component={(onClick) => {
              return (
                <Button variant="outline" onClick={onClick}>
                  Upload Files
                </Button>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditPersonaPage;
