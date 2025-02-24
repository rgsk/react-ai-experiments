import { ISODateString } from "~/lib/typesJsonData";
import { encodeQueryParams } from "~/lib/utils";
import { axiosExperimentsInstance } from "./experimentsService";

export type JsonData<T> = {
  id: string;
  key: string;
  value: T;
  version: string;
  expireAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

const addPrefixToKey = (key: string) => {
  if (key.includes("admin")) {
    return `reactAIExperiments/${key}`;
  }
  return `reactAIExperiments/users/$userEmail/${key}`;
};

const jsonDataService = {
  getKey: async <T>({ key }: { key: string }) => {
    const result = await axiosExperimentsInstance.get<JsonData<T> | null>(
      `/json-data?${encodeQueryParams({ key: addPrefixToKey(key) })}`
    );
    return result.data;
  },
  getKeysLike: <T>({ key }: { key: string }) => {
    const path = `/json-data/key-like?${encodeQueryParams({
      key: addPrefixToKey(key),
    })}`;
    return {
      queryKey: [path],
      queryFn: async () => {
        const result = await axiosExperimentsInstance.get<JsonData<T>[]>(path);
        return result.data;
      },
    };
  },

  deleteKeysLike: async ({ key }: { key: string }) => {
    const result = await axiosExperimentsInstance.delete(
      `/json-data/key-like?${encodeQueryParams({
        key: addPrefixToKey(key),
      })}`
    );
    return result.data;
  },
  deleteKey: async ({ key }: { key: string }) => {
    const result = await axiosExperimentsInstance.delete(
      `/json-data?${encodeQueryParams({ key: addPrefixToKey(key) })}`
    );
    return result.data;
  },
  setKey: async <T>({ key, value }: { key: string; value?: T }) => {
    const result = await axiosExperimentsInstance.post(`/json-data`, {
      key: addPrefixToKey(key),
      value,
    });
    return result.data as JsonData<T> | null;
  },
  createMany: async <T>(data: { key: string; value?: T }[]) => {
    const result = await axiosExperimentsInstance.post(`/json-data/bulk`, {
      data: data.map((d) => ({ key: addPrefixToKey(d.key), value: d.value })),
    });
    return result.data;
  },
};
export default jsonDataService;
