import axios from "axios";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { v4 } from "uuid";
import { TranscriptResponse } from "youtube-transcript";
import { getToken } from "~/hooks/useGlobalContext";
import { Model } from "~/lib/constants";
import environmentVars from "~/lib/environmentVars";
import {
  Chat,
  CreditDetails,
  Message,
  Tool,
  ToolCall,
  UrlContentType,
  WebsiteMeta,
} from "~/lib/typesJsonData";
import { encodeQueryParams } from "~/lib/utils";
import experimentsServiceSampleResponses from "./experimentsServiceSampleResponses";
import { JsonData } from "./jsonDataService";
export const axiosExperimentsInstance = axios.create({
  baseURL: environmentVars.NODE_EXPERIMENTS_SERVER_URL,
});

axiosExperimentsInstance.interceptors.request.use(async (config) => {
  const token = await getToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
type SampleResponseType = typeof experimentsServiceSampleResponses;

export type CompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
const experimentsService = {
  ocrFile: async (
    file: File,
    onUploadProgress?: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    const result = await axiosExperimentsInstance.post<{ text: string }>(
      "/experiments/ocr/file",
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress) {
            if (progressEvent.progress) {
              onUploadProgress(progressEvent.progress);
            }
          }
        },
      }
    );
    return result.data;
  },
  ocrImage: ({ imageUrl }: { imageUrl: string }) => {
    const query = encodeQueryParams({ imageUrl });
    return {
      key: ["experiments", "ocr", query],
      fn: async () => {
        const response = await axiosExperimentsInstance.get<{ text: string }>(
          `/experiments/ocr?${query}`
        );
        return response.data;
      },
    };
  },
  getText: async (payload: {
    messages: Message[];
    socketId?: string;
    tools?: Tool[];
    model: Model;
    streamAudio?: boolean;
  }) => {
    const result = await axiosExperimentsInstance.post<{
      toolCalls: ToolCall[];
    }>("/text", payload);
    return result.data;
  },
  getTools: async () => {
    type ToolWithoutSourceAndVariant = Omit<Tool, "source" | "variant">;
    const result = await axiosExperimentsInstance.get<{
      composioTools: ToolWithoutSourceAndVariant[];
      mcpOpenAITools: ToolWithoutSourceAndVariant[];
    }>("/tools");
    return result.data;
  },
  getTextStreamReader: async (payload: {
    messages: Message[];
    socketId?: string;
  }) => {
    const url = `${environmentVars.NODE_EXPERIMENTS_SERVER_URL}/text`;

    const token = getToken();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    if (response.body) {
      return response.body.getReader();
    }
  },
  getJsonCompletion: async <T>({
    messages,
    model,
  }: {
    messages: CompletionMessage[];
    model: Model;
  }) => {
    const result = await axiosExperimentsInstance.post<T>("/json-completion", {
      messages,
      model,
    });
    return result.data;
  },
  getCompletion: async ({
    messages,
    model,
  }: {
    messages: ChatCompletionMessageParam[];
    model: Model;
  }) => {
    const result = await axiosExperimentsInstance.post<{ content: string }>(
      "/completion",
      {
        messages,
        model,
      }
    );
    return result.data;
  },
  getSession: async () => {
    const result = await axiosExperimentsInstance.get<
      SampleResponseType["getSession"]
    >("/session");
    return result.data;
  },
  getAWSUploadUrl: ({
    key,
    access,
  }: {
    key: string;
    access: "public" | "private";
  }) => {
    const query = encodeQueryParams({ key, access });
    return {
      key: ["aws", "upload-url", query],
      fn: async () => {
        const response = await axiosExperimentsInstance.get<
          SampleResponseType["getAWSUploadUrl"][number]["response"]
        >(`/aws/upload-url?${query}`);
        return response.data;
      },
    };
  },
  getAWSDownloadUrl: ({ url }: { url: string }) => {
    const query = encodeQueryParams({ url });
    return {
      key: ["aws", "download-url", query],
      fn: async () => {
        const response = await axiosExperimentsInstance.get<
          SampleResponseType["getAWSDownloadUrl"][number]["response"]
        >(`/aws/download-url?${query}`);
        return response.data;
      },
    };
  },

  executeCode: async ({
    code,
    language,
  }: {
    code: string;
    language: string;
  }) => {
    const result = await axiosExperimentsInstance.post<{ output: string }>(
      "/experiments/execute-code",
      {
        code,
        language,
      }
    );
    return result.data;
  },
  executeTool: async (toolCall: ToolCall) => {
    const result = await axiosExperimentsInstance.post<{ output: string }>(
      `/execute-tool`,
      {
        toolCall,
      }
    );
    return result.data;
  },
  getYoutubeVideoTranscripts: ({ videoUrlOrId }: { videoUrlOrId: string }) => {
    const query = encodeQueryParams({ s: videoUrlOrId });
    return {
      key: ["youtube-transcript", query],
      fn: async () => {
        const response = await axiosExperimentsInstance.get<
          TranscriptResponse[]
        >(`/youtube/transcript?${query}`);
        return response.data;
      },
    };
  },
  getWebsiteMeta: ({ url }: { url: string }) => {
    const query = encodeQueryParams({ url });
    return {
      key: ["meta", query],
      fn: async () => {
        const response = await axiosExperimentsInstance.get<WebsiteMeta>(
          `/experiments/meta?${query}`
        );
        return response.data;
      },
    };
  },
  getUrlContent: ({ url, type }: { url: string; type?: UrlContentType }) => {
    const query = encodeQueryParams({ url, type });

    return {
      key: ["url-content", query],
      fn: async () => {
        const response = await axiosExperimentsInstance.get<string>(
          `/experiments/url-content?${query}`
        );
        return response.data;
      },
    };
  },
  executeLatex: async ({ code }: { code: string }) => {
    const result = await axiosExperimentsInstance.post(
      `/experiments/execute-latex`,
      { code },
      { responseType: "blob" }
    );
    const blobUrl = URL.createObjectURL(result.data);
    return { pdfUrl: blobUrl };
  },
  uploadFileToS3: async (
    file: File,
    onUploadProgress?: (progress: number) => void
  ) => {
    // Extract file extension
    const key = `${v4()}/${file.name}`;

    const { url: uploadUrl } = await experimentsService
      .getAWSUploadUrl({
        key: key,
        access: "public",
      })
      .fn();
    await axios.put(uploadUrl, file, {
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          if (progressEvent.progress) {
            onUploadProgress(progressEvent.progress);
          }
        }
      },
    });
    const url = uploadUrl.split("?")[0];
    return url;
  },
  deleteFileFromS3: async (url: string) => {
    const result = await axiosExperimentsInstance.delete(
      `/aws/s3-url?${encodeQueryParams({
        url,
      })}`
    );
    return result.data;
  },
  initializeCredits: async () => {
    const result = await axiosExperimentsInstance.post<JsonData<CreditDetails>>(
      `/initialize-credits`
    );
    return result.data;
  },
  deductCredits: async () => {
    const result = await axiosExperimentsInstance.post<{
      isAllowed: boolean;
      creditsBalance: number;
    }>(`/deduct-credits`);
    return result.data;
  },
  searchMessages: ({ q, personaId }: { q: string; personaId?: string }) => {
    const query = encodeQueryParams({ q, personaId });
    return {
      key: ["search-messages", query],
      fn: async () => {
        const response = await axiosExperimentsInstance.get<{
          messagesJsonDataEntries: JsonData<Message[]>[];
          chatJsonDataEntries: JsonData<Chat>[];
        }>(`/search-messages?${query}`);
        return response.data;
      },
    };
  },
  processFileMessage: async ({
    url,
    collectionName,
  }: {
    url: string;
    collectionName: string;
  }) => {
    const response = await axiosExperimentsInstance.post<
      | {
          summary: string;
          embeddingCount: number;
          type: "rag";
          instruction: string;
        }
      | { content: string; type: "full"; instruction: string }
    >(`/process-file-message`, {
      url,
      collectionName,
    });
    return response.data;
  },
  getPlayAudioStreamReader: async ({ text }: { text: string }) => {
    const url = `${environmentVars.NODE_EXPERIMENTS_SERVER_URL}/play-audio`;
    const token = await getToken();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.body!.getReader();
  },
  getAudioAIResponseStreamReader: async ({
    messages,
  }: {
    messages: Message[];
  }) => {
    const url = `${environmentVars.NODE_EXPERIMENTS_SERVER_URL}/audio`;
    const token = await getToken();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.body!.getReader();
  },
};
export default experimentsService;
