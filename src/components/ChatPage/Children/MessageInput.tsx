// import { removeFileUpload } from "@/app/hooks/api/useFileUpload";
// import useBreakpoints from "@/app/hooks/custom/useBreakpoints";
// import MaintiainOriginalWidth from "@/app/shared/components/MaintiainOriginalWidth/MaintiainOriginalWidth";
// import { cn } from "@/app/utils/utils";
// import assistantsService, {
//   codeInterpreterSpecificExtensions,
//   supportedExtensions,
// } from "@/components/AITools/assistantsService";
// import { Paperclip2 } from "iconsax-react";
// import { FileObject } from "openai/resources";
// import { MessageCreateParams } from "openai/resources/beta/threads/messages";
// import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";
// import TextareaAutosize from "react-textarea-autosize";
// import { HandleSend } from "../../ChatPage";
// import FileUploadedPreview from "./FileUploadedPreview/FileUploadedPreview";
// export const getToolForFile = (
//   filename: string
// ): "code_interpreter" | "file_search" => {
//   if (
//     codeInterpreterSpecificExtensions.some((ext) =>
//       filename.endsWith(`.${ext}`)
//     )
//   ) {
//     return "code_interpreter";
//   }
//   return "file_search";
// };
// export type FileEntry = {
//   id: string;
//   file: File;
//   fileObject?: FileObject;
//   fileUrl?: string;
// };
// interface MessageInputProps {
//   handleSend: HandleSend;
//   loading: boolean;
//   interrupt: () => void;
//   placeholder: string;
//   attachedFiles: FileEntry[];
//   setAttachedFiles: Dispatch<SetStateAction<FileEntry[]>>;
//   handleFilesChange: (files: File[]) => void;
//   interruptEnabled: boolean;
// }
// const MessageInput: React.FC<MessageInputProps> = ({
//   handleSend,
//   loading,
//   interrupt,
//   placeholder,
//   attachedFiles,
//   setAttachedFiles,
//   handleFilesChange,
//   interruptEnabled,
// }) => {
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleFileInputClick = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click(); // Trigger the file input click
//     }
//   };
//   const [text, setText] = useState("");
//   const { md } = useBreakpoints();
//   const canSend = useMemo(() => {
//     return (
//       !loading &&
//       (!!text || !!attachedFiles.length) &&
//       attachedFiles.every((fe) =>
//         fe.file.type.startsWith("image/")
//           ? !!fe.fileObject && !!fe.fileUrl
//           : !!fe.fileObject
//       )
//     );
//   }, [attachedFiles, loading, text]);
//   const handleSubmit = () => {
//     if (!canSend) return;
//     const attachments: MessageCreateParams.Attachment[] = [];
//     const imageFileIds: string[] = [];
//     const imageUrls: Record<string, string> = {};

//     attachedFiles.forEach((fileEntry) => {
//       const isImage = fileEntry.file.type.startsWith("image/");
//       if (fileEntry.fileObject) {
//         if (isImage) {
//           imageFileIds.push(fileEntry.fileObject.id);
//         } else {
//           attachments.push({
//             file_id: fileEntry.fileObject.id,
//             tools: [
//               {
//                 type: getToolForFile(fileEntry.file.name),
//               },
//             ],
//           });
//         }
//       }
//       if (fileEntry.fileObject && fileEntry.fileUrl) {
//         if (isImage) {
//           imageUrls[fileEntry.fileObject.id] = fileEntry.fileUrl;
//         }
//       }
//     });
//     handleSend({ text, attachments: attachments, imageFileIds, imageUrls });
//     setAttachedFiles([]);
//     setText("");
//   };

//   return (
//     <div
//       className={cn(
//         canSend
//           ? "border border-gslearnMockingbird"
//           : "border border-gslearnlightmodeGrey3",
//         "bg-white rounded-[12px] py-[16px] px-[16px]"
//       )}
//     >
//       {attachedFiles.length > 0 && (
//         <MaintiainOriginalWidth hideScrollbar>
//           <div className="flex gap-[16px] pb-[24px] pt-[12px]">
//             {attachedFiles.map((fileEntry) => (
//               <FileUploadedPreview
//                 key={fileEntry.id}
//                 fileEntry={fileEntry}
//                 onRemove={() => {
//                   if (fileEntry.fileObject) {
//                     assistantsService.deleteFile(fileEntry.fileObject.id);
//                   }
//                   if (fileEntry.fileUrl) {
//                     const key = fileEntry.fileUrl.split("/").pop();
//                     if (key) {
//                       removeFileUpload(key, "assignment");
//                     }
//                   }
//                   setAttachedFiles((prev) =>
//                     prev.filter((entry) => entry.id !== fileEntry.id)
//                   );
//                 }}
//                 onFileObjectUpload={(fileObject) => {
//                   setAttachedFiles((prev) =>
//                     prev.map((entry) =>
//                       entry.id === fileEntry.id
//                         ? { ...entry, fileObject }
//                         : entry
//                     )
//                   );
//                 }}
//                 onFileUrlUpload={(fileUrl) => {
//                   setAttachedFiles((prev) =>
//                     prev.map((entry) =>
//                       entry.id === fileEntry.id ? { ...entry, fileUrl } : entry
//                     )
//                   );
//                 }}
//               />
//             ))}
//           </div>
//         </MaintiainOriginalWidth>
//       )}

//       <form
//         className="relative flex"
//         onSubmit={(e) => {
//           e.preventDefault();
//         }}
//       >
//         <input
//           ref={fileInputRef}
//           type="file"
//           onChange={(ev) => {
//             const files = ev.target.files;
//             if (files) {
//               handleFilesChange(Array.from(files));
//             }
//           }}
//           multiple
//           className="hidden"
//           accept={supportedExtensions.map((ext) => `.${ext}`).join(",")}
//           onClick={(event: any) => {
//             // Reset the value so that the same file/files can be selected again
//             event.target.value = null;
//           }}
//         />
//         <button onClick={handleFileInputClick}>
//           <Paperclip2 />
//         </button>
//         <div className="w-[8px]"></div>
//         <TextareaAutosize
//           minRows={1}
//           maxRows={6}
//           value={text}
//           onChange={(e) => {
//             setText(e.target.value);
//           }}
//           autoFocus
//           onKeyDown={(e) => {
//             if (e.key === "Enter" && !e.shiftKey) {
//               e.preventDefault();
//               handleSubmit();
//             }
//           }}
//           onPaste={(event) => {
//             const items = event.clipboardData.items;
//             const files: File[] = [];
//             for (let i = 0; i < items.length; i++) {
//               const item = items[i];

//               if (item.kind === "file") {
//                 const file = item.getAsFile();

//                 if (file) {
//                   files.push(file);
//                 }
//               }
//             }
//             if (files.length > 0) {
//               // Prevent default paste behavior (which pastes the file name)
//               event.preventDefault();
//               handleFilesChange(files);
//             }
//           }}
//           placeholder={placeholder}
//           className={cn(
//             `w-full resize-none text-gslearnMockingbird
//             placeholder:text-gs-light-mode-grey-1 text-[14px] md:text-[16px] focus:outline-none`
//           )}
//           style={{
//             // 36 is size of button container
//             paddingRight: 36,
//           }}
//         />
//         <div className="absolute bottom-1/2 translate-y-1/2 right-0">
//           {loading && interruptEnabled ? (
//             <ActionButton onClick={interrupt}>
//               <div className="h-[8px] w-[8px] md:h-[12px] md:w-[12px] rounded-[1px] md:rounded-[2px] bg-white"></div>
//             </ActionButton>
//           ) : (
//             <ActionButton onClick={handleSubmit} disabled={!canSend}>
//               <img
//                 width={md ? 24 : 14}
//                 height={md ? 24 : 14}
//                 src="/images/ai-tools/direct-right.svg"
//                 alt="Send"
//               />
//             </ActionButton>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// };

// export default MessageInput;

// interface ActionButtonProps {
//   onClick: () => void;
//   disabled?: boolean;
//   children: any;
// }
// const ActionButton: React.FC<ActionButtonProps> = ({
//   onClick,
//   disabled,
//   children,
// }) => {
//   return (
//     <button
//       className={cn(
//         "rounded-full w-[24px] h-[24px] md:w-[36px] md:h-[36px] flex justify-center items-center",
//         "bg-gslearnMockingbird disabled:bg-gslearnlightmodeGrey1"
//       )}
//       onClick={onClick}
//       disabled={disabled}
//     >
//       {children}
//     </button>
//   );
// };
