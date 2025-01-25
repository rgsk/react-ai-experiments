import axios from "axios";
import { encodeQueryParams } from "~/lib/utils";
import experimentsServiceSampleResponses from "./experimentsServiceSampleResponses";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4004",
});
type SampleResponseType = typeof experimentsServiceSampleResponses;
const experimentsService = {
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
