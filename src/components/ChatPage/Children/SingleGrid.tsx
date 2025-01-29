import ReactGridLayout from "react-grid-layout";

interface SingleGridProps {
  children: any;
  gridWidth: number;
}
const SingleGrid: React.FC<SingleGridProps> = ({ gridWidth, children }) => {
  const stepSize = 10;
  const cols = gridWidth / stepSize;
  const rowHeight = stepSize;
  const layout = [{ i: "b", x: 0, y: 0, w: cols, h: 30 }];
  return (
    <div>
      {/* @ts-ignore */}
      <ReactGridLayout
        className="layout"
        layout={layout}
        cols={cols}
        rowHeight={rowHeight}
        width={gridWidth}
      >
        <div key="b" className="border border-black rounded-lg overflow-hidden">
          {children}
        </div>
      </ReactGridLayout>
    </div>
  );
};
export default SingleGrid;
