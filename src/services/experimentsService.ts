import axios from "axios";
import { TranscriptResponse } from "youtube-transcript";
import { getToken } from "~/hooks/auth/useToken";
import environmentVars from "~/lib/environmentVars";
import { encodeQueryParams } from "~/lib/utils";
import experimentsServiceSampleResponses from "./experimentsServiceSampleResponses";
export const axiosExperimentsInstance = axios.create({
  baseURL: environmentVars.EXPERIMENTS_SERVER_URL,
});
axiosExperimentsInstance.interceptors.request.use((config) => {
  const token = getToken();
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

  getTextStreamReader: async ({
    messages,
  }: {
    messages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[];
  }) => {
    const url = `${environmentVars.EXPERIMENTS_SERVER_URL}/text`;
    const payload = {
      messages: messages,
    };
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
  }: {
    messages: CompletionMessage[];
  }) => {
    const result = await axiosExperimentsInstance.post<T>("/json-completion", {
      messages,
    });
    return result.data;
  },
  getCompletion: async ({ messages }: { messages: CompletionMessage[] }) => {
    const result = await axiosExperimentsInstance.post<{ content: string }>(
      "/completion",
      {
        messages,
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
  getAWSUploadUrl: ({ key }: { key: string }) => {
    const query = encodeQueryParams({ key });
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
};

export default experimentsService;
