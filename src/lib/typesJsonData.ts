import { ISODateString } from "~/services/jsonDataService";

export type Message = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
};
export type Chat = {
  id: string | undefined;
  title: string;
  createdAt: ISODateString;
};
