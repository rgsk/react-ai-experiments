import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
});

const aiService = {
  saveText: async ({
    collectionName,
    content,
    source,
  }: {
    collectionName: string;
    content: string;
    source: string;
  }) => {
    const result = await axiosInstance.post<string[]>("/save_text", {
      collection_name: collectionName,
      content: content,
      source: source,
    });
    return result.data;
  },
};
export default aiService;
