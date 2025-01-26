export type ISODateString = string;
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
export type UserData = {
  id: string;
  name: string;
  email: string;
  createdAt: ISODateString;
};
