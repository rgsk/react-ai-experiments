import OpenAI from "openai/index.mjs";
import {
  Message,
  MessageCreateParams,
} from "openai/resources/beta/threads/messages.mjs";
import { FileDeleted, FileObject } from "openai/resources/files.mjs";
import { axiosExperimentsInstance } from "./experimentsService";
const getMimeTypeFromFilename = (filename?: string) => {
  if (!filename) {
    return undefined;
  }
  // Get the file extension
  const extension = filename.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    default:
      return undefined;
  }
};
const assistantsService = {
  getMessages: async ({ threadId }: { threadId: string }) => {
    const result = await axiosExperimentsInstance.get<Message[]>(
      `/assistants/threads/${threadId}/messages`
    );
    return result.data;
  },
  chat: async (body: {
    threadId: string;
    assistantId: string;
    userMessage: string;
    userContextString?: string;
    secondaryMessages?: string[];
    userId: string;
    socketId?: string;
    attachments?: MessageCreateParams.Attachment[];
    imageFileIds?: string[];
    imageUrls?: Record<string, string>;
  }) => {
    const result = await axiosExperimentsInstance.post(
      "/assistants/chat",
      body
    );
    return result.data;
  },

  createThread: async () => {
    const result = await axiosExperimentsInstance.post<{ threadId: string }>(
      `/assistants/threads`
    );
    return result.data;
  },

  cancelRun: async ({
    threadId,
    runId,
  }: {
    threadId: string;
    runId: string;
  }) => {
    const result =
      await axiosExperimentsInstance.post<OpenAI.Beta.Threads.Runs.Run>(
        `/assistants/threads/${threadId}/runs/${runId}/cancel`
      );
    return result.data;
  },
  retrieveFileContent: async (fileId: string, fileObject?: FileObject) => {
    // Make a GET request using Axios to fetch the file content as a blob
    const response = await axiosExperimentsInstance.get(
      `/assistants/files/${fileId}/content`,
      {
        responseType: "blob", // Specify the response type as 'blob'
      }
    );
    // Create a URL for the blob
    const url = window.URL.createObjectURL(
      new Blob([response.data], {
        type: getMimeTypeFromFilename(fileObject?.filename),
      })
    );
    return { url };
  },
  retrieveFile: async (fileId: string) => {
    const result = await axiosExperimentsInstance.get<FileObject>(
      `/assistants/files/${fileId}`
    );
    return result.data;
  },
  uploadFile: async (
    file: File,
    onUploadProgress?: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    const result = await axiosExperimentsInstance.post<FileObject>(
      "/assistants/files",
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress) {
            if (progressEvent.progress) {
              onUploadProgress(progressEvent.progress);
            }
          }
        },
      }
    );
    return result.data;
  },
  deleteFile: async (fileId: string) => {
    const result = await axiosExperimentsInstance.delete<FileDeleted>(
      `/assistants/files/${fileId}`
    );
    return result.data;
  },
};

export const imageExtensions = ["gif", "jpeg", "jpg", "png", "webp"];
export const getToolForFile = (
  filename: string
): "code_interpreter" | "file_search" => {
  if (
    codeInterpreterSpecificExtensions.some((ext) =>
      filename.endsWith(`.${ext}`)
    )
  ) {
    return "code_interpreter";
  }
  return "file_search";
};

export const fileExtensions = [
  "c",
  "cpp",
  "css",
  "csv",
  "docx",
  "html",
  "java",
  "js",
  "json",
  "md",
  "pdf",
  "php",
  "pkl",
  "pptx",
  "py",
  "rb",
  "tar",
  "tex",
  "ts",
  "txt",
  "xlsx",
  "xml",
  "zip",
];

export const codeInterpreterSpecificExtensions = ["csv", "xlsx"];

export const supportedExtensions = [...imageExtensions, ...fileExtensions];

export default assistantsService;
