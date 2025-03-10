import ReactGridLayout from "react-grid-layout";

interface SingleGridProps {
  children: any;
  gridWidth: number;
  gridHeight: number;
}
const SingleGrid: React.FC<SingleGridProps> = ({
  gridWidth,
  children,
  gridHeight,
}) => {
  const stepSize = 10;
  const cols = gridWidth / stepSize;
  const rowHeight = stepSize;
  const layout = [{ i: "b", x: 0, y: 0, w: cols, h: gridHeight / rowHeight }];
  return (
    <div>
      {/* @ts-ignore */}
      <ReactGridLayout
        className="layout"
        layout={layout}
        isDraggable={false}
        cols={cols}
        rowHeight={rowHeight}
        width={gridWidth}
        margin={[0, 0]}
      >
        <div
          key="b"
          className="border border-muted-foreground rounded-lg overflow-hidden"
        >
          {children}
        </div>
      </ReactGridLayout>
    </div>
  );
};
export default SingleGrid;
