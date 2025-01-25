import axios from "axios";
import { localStorageWithExpiry } from "~/hooks/useLocalStorageState";
import { encodeQueryParams } from "~/lib/utils";
import experimentsServiceSampleResponses from "./experimentsServiceSampleResponses";
const baseUrl = "http://localhost:4004";
export const axiosExperimentsInstance = axios.create({
  baseURL: baseUrl,
});
axiosExperimentsInstance.interceptors.request.use((config) => {
  const token = localStorageWithExpiry.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    window.location.href = "/login";
    throw new Error("Please login to continue");
  }
  return config;
});
type SampleResponseType = typeof experimentsServiceSampleResponses;

export type CompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
const experimentsService = {
  getTextStreamReader: async ({
    messages,
  }: {
    messages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[];
  }) => {
    const url = `${baseUrl}/text`;
    const payload = {
      messages: messages,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
};
export default experimentsService;
