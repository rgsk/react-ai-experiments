import axios from "axios";
import { encodeQueryParams } from "~/lib/utils";
import experimentsServiceSampleResponses from "./experimentsServiceSampleResponses";
const baseUrl = "http://localhost:4004";
const axiosInstance = axios.create({
  baseURL: baseUrl,
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

  getSession: async () => {
    const result = await axiosInstance.get<SampleResponseType["getSession"]>(
      "/session"
    );
    return result.data;
  },
  getAWSUploadUrl: ({ key }: { key: string }) => {
    const query = encodeQueryParams({ key });
    return {
      key: ["aws", "upload-url", query],
      fn: async () => {
        const response = await axiosInstance.get<
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
        const response = await axiosInstance.get<
          SampleResponseType["getAWSDownloadUrl"][number]["response"]
        >(`/aws/download-url?${query}`);
        return response.data;
      },
    };
  },
};
export default experimentsService;
