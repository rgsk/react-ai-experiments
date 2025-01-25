import axios from "axios";
import { User } from "firebase/auth";
import { localStorageWithExpiry } from "~/hooks/useLocalStorageState";
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

const addPrefixToKey = (key: string) => {
  const firebaseUser = localStorageWithExpiry.getItem<User>("firebaseUser");
  if (!firebaseUser) {
    window.location.href = "/login";
    throw new Error("Please login to continue");
  }
  return `reactAIExperiments/users/${firebaseUser.email}/${key}`;
};

const jsonDataService = {
  getKey: async <T>({ key }: { key: string }) => {
    const result = await axiosInstance.get<
      (Omit<JsonData, "value"> & { value: T }) | null
    >(`/json-data?${encodeQueryParams({ key: addPrefixToKey(key) })}`);
    return result.data;
  },
  getKeysLike: <T>({ key }: { key: string }) => {
    const path = `/json-data/key-like?${encodeQueryParams({
      key: addPrefixToKey(key),
    })}`;
    return {
      queryKey: [path],
      queryFn: async () => {
        const result = await axiosInstance.get<
          (Omit<JsonData, "value"> & { value: T })[]
        >(path);
        return result.data;
      },
    };
  },

  deleteKeysLike: async ({ key }: { key: string }) => {
    const result = await axiosInstance.delete(
      `/json-data/key-like?${encodeQueryParams({
        key: addPrefixToKey(key),
      })}`
    );
    return result.data;
  },
  deleteKey: async ({ key }: { key: string }) => {
    const result = await axiosInstance.delete(
      `/json-data?${encodeQueryParams({ key: addPrefixToKey(key) })}`
    );
    return result.data;
  },
  setKey: async <T>({ key, value }: { key: string; value?: T }) => {
    const result = await axiosInstance.post(`/json-data`, {
      key: addPrefixToKey(key),
      value,
    });
    return result.data;
  },
  createMany: async <T>(data: { key: string; value?: T }[]) => {
    const result = await axiosInstance.post(`/json-data/bulk`, {
      data: data.map((d) => ({ key: addPrefixToKey(d.key), value: d.value })),
    });
    return result.data;
  },
};
export default jsonDataService;
