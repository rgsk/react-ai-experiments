import axios from "axios";
import { encodeQueryParams } from "~/lib/utils";
const axiosInstance = axios.create({
  baseURL: "http://localhost:4004",
});
export type ISODateString = string;
export type JsonData = {
  id: string;
  key: string;
  value: any;
  version: string;
  expireAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
const keyPrefix = "reactAIExperiments.";

const jsonDataService = {
  getKey: async ({ key }: { key: string }) => {
    const result = await axiosInstance.get(
      `/json-data?${encodeQueryParams({ key: keyPrefix + key })}`
    );
    return result.data;
  },
  getKeysLike: async ({ key }: { key: string }) => {
    const result = await axiosInstance.get(
      `/json-data/key-like?${encodeQueryParams({ key: keyPrefix + key })}`
    );
    return result.data;
  },

  deleteKeysLike: async ({ key }: { key: string }) => {
    const result = await axiosInstance.delete(
      `/json-data/key-like?${encodeQueryParams({
        key: keyPrefix + key,
      })}`
    );
    return result.data;
  },
  deleteKey: async ({ key }: { key: string }) => {
    const result = await axiosInstance.delete(
      `/json-data?${encodeQueryParams({ key: keyPrefix + key })}`
    );
    return result.data;
  },
  setKey: async ({ key, value }: { key: string; value?: any }) => {
    const result = await axiosInstance.post(`/json-data`, {
      key: keyPrefix + key,
      value,
    });
    return result.data;
  },
  createMany: async (data: { key: string; value?: any }[]) => {
    const result = await axiosInstance.post(`/json-data/bulk`, {
      data: data.map((d) => ({ key: keyPrefix + d.key, value: d.value })),
    });
    return result.data;
  },
};
export default jsonDataService;
