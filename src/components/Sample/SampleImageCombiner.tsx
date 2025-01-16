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

    const drawImage = (textHeight?: number) => {
      console.log({ textHeight });

      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const profileImg = new Image();
      const backgroundImg = new Image();

      backgroundImg.crossOrigin = "anonymous";
      backgroundImg.src = `http://localhost:4001/proxy?url=${encodeURIComponent(
        "https://s3.ap-south-1.amazonaws.com/submissions.growthschool.io/68-c96c38c2-5d38-45e0-9b19-5d4f2967a862.jpg"
      )}`;
      // backgroundImg.src = URL.createObjectURL(backgroundImage);
      backgroundImg.onload = () => {
        canvas.width = backgroundImg.width;
        canvas.height = backgroundImg.height;
        const multiplier = 4;
        const halfMultiplier = multiplier / 2;
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
          profileBox.top *= multiplier;
          profileBox.left *= multiplier;
          profileBox.height *= multiplier;
          profileBox.width *= multiplier;
          ctx.drawImage(
            profileImg,
            profileBox.left,
            profileBox.top,
            profileBox.width,
            profileBox.height
          );

          // Add text inside the second box
          const primaryFontSize = 30 * halfMultiplier;
          const secondaryFontSize = 20 * halfMultiplier;
          const primaryTextMargin = 10 * halfMultiplier;
          const secondaryTextMargin = 10 * halfMultiplier;
          ctx.font = `bold ${primaryFontSize}px sans-serif`;
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";

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
          textBox.top *= multiplier;
          textBox.left *= multiplier;
          textBox.height *= multiplier;
          textBox.width *= multiplier;

          const leftOffset = textBox.left + textBox.width / 2;
          const topOffset =
            textBox.top + textBox.height / 2 - (textHeight ?? 0) / 2;
          ctx.fillText(name, leftOffset, topOffset);
          const metrics = ctx.measureText(name);
          const primaryTextHeight =
            metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
          ctx.font = `${secondaryFontSize}px sans-serif`;
          ctx.fillText(
            designation,
            leftOffset,
            topOffset + primaryTextHeight + primaryTextMargin
          );
          const metrics2 = ctx.measureText(designation);
          const secondaryTextHeight =
            metrics2.actualBoundingBoxAscent +
            metrics2.actualBoundingBoxDescent;
          ctx.fillText(
            company,
            leftOffset,
            topOffset +
              primaryTextHeight +
              primaryTextMargin +
              secondaryTextHeight +
              secondaryTextMargin
          );
          if (textHeight) {
            // Set the preview source
            const outputImage = canvas.toDataURL("image/png");
            setPreviewSrc(outputImage);
          } else {
            textHeight =
              primaryTextHeight +
              primaryTextMargin +
              secondaryTextHeight +
              secondaryTextMargin +
              secondaryTextHeight;
            drawImage(textHeight);
          }
        };
      };
    };
    drawImage();
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
