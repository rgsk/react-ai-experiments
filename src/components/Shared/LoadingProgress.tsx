import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

interface LoadingProgressProps {
  percentage: number;
  size?: number;
}
const LoadingProgress: React.FC<LoadingProgressProps> = ({
  percentage,
  size = 20,
}) => {
  return (
    <div style={{ width: size }}>
      <CircularProgressbar
        value={percentage}
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
