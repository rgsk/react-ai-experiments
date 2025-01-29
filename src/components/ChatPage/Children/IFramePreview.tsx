interface IFramePreviewProps {
  srcDoc: string;
}
const IFramePreview: React.FC<IFramePreviewProps> = ({ srcDoc }) => {
  return <iframe srcDoc={srcDoc} className="w-full h-full" />;
};
export default IFramePreview;
