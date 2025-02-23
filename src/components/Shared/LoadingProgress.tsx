import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

interface LoadingProgressProps {
  progress: number;
  size?: number;
}
const LoadingProgress: React.FC<LoadingProgressProps> = ({
  progress,
  size = 20,
}) => {
  return (
    <div style={{ width: size }}>
      <CircularProgressbar
        value={progress}
        counterClockwise
        strokeWidth={10}
        styles={buildStyles({
          pathColor: "#fff",
          trailColor: "#808080",
        })}
      />
    </div>
  );
};
export default LoadingProgress;
