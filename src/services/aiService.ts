import axios from "axios";
import environmentVars from "~/lib/environmentVars";

const axiosInstance = axios.create({
  baseURL: environmentVars.PYTHON_EXPERIMENTS_SERVER_URL,
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
    // throw new Error("what are you doing");
    const result = await axiosInstance.post<string[]>("/save_text", {
      collection_name: collectionName,
      content: content,
      source: source,
    });
    return result.data;
  },
  deleteText: async ({
    collectionName,
    source,
  }: {
    collectionName: string;
    source: string;
  }) => {
    const result = await axiosInstance.post("/delete_text", {
      collection_name: collectionName,
      source: source,
    });
    return result.data;
  },
  deleteCollection: async ({ collectionName }: { collectionName: string }) => {
    const result = await axiosInstance.post("/delete_collection", {
      collection_name: collectionName,
    });
    return result.data;
  },
};
export default aiService;
