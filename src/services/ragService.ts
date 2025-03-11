import { axiosExperimentsInstance } from "./experimentsService";

const ragService = {
  createEmbeddings: async (
    data: {
      content: string;
      metadata?: any;
      collectionName: string;
      source: string;
    }[]
  ) => {
    const result = await axiosExperimentsInstance.post<{ count: number }>(
      "/rag/embeddings",
      {
        data,
      }
    );
    return result.data;
  },
  embedContent: async ({
    data,
    config,
  }: {
    data: {
      content: string;
      metadata?: any;
      collectionName: string;
      source: string;
    };
    config: {
      chunkLength: number;
      overlapLength: number;
    };
  }) => {
    const result = await axiosExperimentsInstance.post<{ count: number }>(
      "/rag/embed-content",
      {
        data,
        config,
      }
    );
    return result.data;
  },
  deleteSource: async ({
    collectionName,
    source,
  }: {
    collectionName: string;
    source: string;
  }) => {
    const result = await axiosExperimentsInstance.delete<{ count: number }>(
      "/rag/source",
      {
        data: {
          collectionName,
          source,
        },
      }
    );
    return result.data;
  },
  deleteCollection: async ({ collectionName }: { collectionName: string }) => {
    const result = await axiosExperimentsInstance.delete<{ count: number }>(
      "/rag/collection",
      {
        data: {
          collectionName,
        },
      }
    );
    return result.data;
  },
};
export default ragService;
