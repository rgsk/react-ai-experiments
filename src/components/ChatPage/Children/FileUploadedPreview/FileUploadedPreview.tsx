// import { uploadDataToS3AndGetUrl } from '@/app/hooks/api/useFileUpload';
// import assistantsService from '@/components/AITools/assistantsService';
// import FloaterLoader from '@/components/Chat/Floater/FloaterLoader';
// import { CloseCircle, DocumentText1, Gallery } from 'iconsax-react';
// import Image from 'next/image';
// import { FileObject } from 'openai/resources';
// import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { FileEntry } from '../MessageInput/MessageInput';
// export const fileIcons = {
//   document: <DocumentText1 size={16} />,
//   image: <Gallery size={16} />,
// };
// interface FileUploadedPreviewProps {
//   fileEntry: FileEntry;
//   onRemove: () => void;
//   onFileObjectUpload: (fileObject: FileObject) => void;
//   onFileUrlUpload: (fileUrl: string) => void;
// }
// const FileUploadedPreview: React.FC<FileUploadedPreviewProps> = ({
//   fileEntry: { id, file, fileObject },
//   onRemove,
//   onFileObjectUpload,
//   onFileUrlUpload,
// }) => {
//   const [loading, setLoading] = useState(false);
//   const onFileObjectUploadRef = useRef(onFileObjectUpload);
//   onFileObjectUploadRef.current = onFileObjectUpload;
//   const onFileUrlUploadRef = useRef(onFileUrlUpload);
//   onFileUrlUploadRef.current = onFileUrlUpload;
//   const isImage = file.type.startsWith('image/');
//   const localHandleUpload = useCallback(async () => {
//     setLoading(true);
//     if (isImage) {
//       const { data: { key, responseData } = {} } = await uploadDataToS3AndGetUrl(
//         file,
//         'assignment'
//       );
//       const imageUrl = `${responseData?.url}/${key}`;
//       onFileUrlUploadRef.current(imageUrl);
//     }
//     const newFileObject = await assistantsService.uploadFile(file);
//     onFileObjectUploadRef.current(newFileObject);
//     setLoading(false);
//   }, [file, isImage]);
//   useEffect(() => {
//     if (!fileObject) {
//       localHandleUpload();
//     }
//   }, [fileObject, localHandleUpload]);
//   const imageUrl = useMemo(() => URL.createObjectURL(file), [file]);
//   const renderCloseButton = () => {
//     return (
//       <div className="absolute top-0 right-0 translate-x-[10px] -translate-y-1/2">
//         <button onClick={onRemove}>
//           <CloseCircle size={20} className="bg-white rounded-full" />
//         </button>
//       </div>
//     );
//   };
//   if (isImage) {
//     return (
//       <div className="relative min-w-[64px] w-[64px] h-[64px]">
//         <Image
//           src={imageUrl}
//           alt={file.name}
//           className="rounded-[8px] object-cover object-center"
//           fill
//         />
//         {renderCloseButton()}
//         {loading && (
//           <div className="absolute top-0 left-0 w-full h-full rounded-[8px] bg-black bg-opacity-5 flex justify-center items-center">
//             <div className="scale-75">
//               <FloaterLoader />
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }
//   return (
//     <div className="bg-[#F7F7F8] min-w-[295px] px-[12px] border border-[#030A2133] py-[16px] rounded-[8px] relative">
//       <div className="flex gap-[8px] items-center">
//         <div className="rounded-[8px] relative w-[30px] h-[30px] flex justify-center items-center border border-gslearnMockingbird bg-white">
//           {loading ? (
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-75">
//               <FloaterLoader />
//             </div>
//           ) : (
//             fileIcons.document
//           )}
//         </div>
//         <p className="text-[14px] font-medium text-ellipsis overflow-hidden whitespace-nowrap">
//           {file.name}
//         </p>
//         {renderCloseButton()}
//       </div>
//     </div>
//   );
// };
// export default FileUploadedPreview;
