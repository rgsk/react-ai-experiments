interface SampleLinkPreviewProps {}
const SampleLinkPreview: React.FC<SampleLinkPreviewProps> = ({}) => {
  return (
    <div>
      <WebsitePreview />
    </div>
  );
};
export default SampleLinkPreview;

import React, { useState } from "react";

function WebsitePreview() {
  const [url, setUrl] = useState("");
  const [previewData, setPreviewData] = useState<any>(null);

  const fetchPreview = async () => {
    try {
      const response = await fetch(
        `http://localhost:4004/experiments/meta?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();
      setPreviewData(data);
    } catch (error) {
      console.error("Error fetching preview:", error);
    }
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <button
        onClick={fetchPreview}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Generate Preview
      </button>

      {previewData && (
        <div className="mt-4 border rounded p-4">
          <img src={previewData.image} alt="Preview" className="w-full mb-2" />
          <h3 className="text-lg font-bold">{previewData.title}</h3>
          <p>{previewData.description}</p>
          <a
            href={previewData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            Visit Site
          </a>
        </div>
      )}
    </div>
  );
}
