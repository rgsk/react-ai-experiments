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
    const result = await axiosInstance.post<string[]>("/save_text", {
      collection_name: collectionName,
      content: content,
      source: source,
    });
    return result.data;
  },
};
export default aiService;
