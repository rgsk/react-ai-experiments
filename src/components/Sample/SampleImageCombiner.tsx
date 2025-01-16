import React, { useRef, useState } from "react";

const SampleImageCombiner = () => {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [company, setCompany] = useState("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "profile") {
        setProfileImage(file);
      } else {
        setBackgroundImage(file);
      }
    }
  };

  const handleGenerateImage = async () => {
    if (!profileImage || !backgroundImage || !canvasRef.current) {
      alert("Please upload both profile and background images");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const profileImg = new Image();
    const backgroundImg = new Image();

    backgroundImg.src = URL.createObjectURL(backgroundImage);
    backgroundImg.onload = () => {
      // Set canvas dimensions to match background image resolution
      const dpr = window.devicePixelRatio || 1; // Device Pixel Ratio
      canvas.width = backgroundImg.width * dpr;
      canvas.height = backgroundImg.height * dpr;
      ctx.scale(dpr, dpr); // Scale the canvas for high-resolution rendering

      // Draw background image
      ctx.drawImage(
        backgroundImg,
        0,
        0,
        backgroundImg.width,
        backgroundImg.height
      );

      // Load the profile image
      profileImg.src = URL.createObjectURL(profileImage);
      profileImg.onload = () => {
        // Draw profile image inside the designated box
        // const profileBox = { top: 125, left: 117, width: 400, height: 400 };
        const profileBox = { top: 75, left: 70, width: 238, height: 238 };
        ctx.drawImage(
          profileImg,
          profileBox.left,
          profileBox.top,
          profileBox.width,
          profileBox.height
        );

        const textHeight = 115;

        // Add text inside the second box
        ctx.font = `bold 30px sans-serif`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";

        // const textBox = {
        //   top: 553,
        //   left: 104,
        //   width: 426,
        //   height: 193,
        // };
        const textBox = {
          top: 330,
          left: 62,
          width: 254,
          height: 115,
        };
        const leftOffset = textBox.left + textBox.width / 2;
        const topOffset = textBox.top;
        ctx.fillText(name, leftOffset, topOffset);
        ctx.font = "20px sans-serif";
        ctx.fillText(designation, leftOffset, topOffset + 30);
        ctx.fillText(company, leftOffset, topOffset + 60);

        // Set the preview source
        const outputImage = canvas.toDataURL("image/png");
        setPreviewSrc(outputImage);
      };
    };
  };

  return (
    <div>
      <h2>Combine Profile and Background Images</h2>

      <div>
        <label>
          Upload Profile Image:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "profile")}
          />
        </label>
      </div>

      <div>
        <label>
          Upload Background Image:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "background")}
          />
        </label>
      </div>

      <div>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label>
          Designation:
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label>
          Company:
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      <button onClick={handleGenerateImage}>Generate Combined Image</button>

      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {previewSrc && (
        <div>
          <h3>Preview:</h3>
          <img src={previewSrc} alt="Preview" style={{ maxWidth: "800px" }} />
        </div>
      )}
    </div>
  );
};

export default SampleImageCombiner;
