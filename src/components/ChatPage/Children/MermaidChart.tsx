import { RotateCcw } from "lucide-react";
import mermaid from "mermaid";
import panzoom, { PanZoom } from "panzoom";
import React, { useCallback, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";

mermaid.initialize({
  startOnLoad: true,
});

interface MermaidChartProps {
  chart: string;
}

const MermaidChart: React.FC<MermaidChartProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const outerContainerRef = useRef<HTMLDivElement>(null);
  const panzoomInstance = useRef<PanZoom | null>(null);

  const centerChart = useCallback(() => {
    setTimeout(() => {
      if (
        outerContainerRef.current &&
        containerRef.current &&
        panzoomInstance.current
      ) {
        const outerRect = outerContainerRef.current.getBoundingClientRect();
        const innerRect = containerRef.current.getBoundingClientRect();
        const dx = (outerRect.width - innerRect.width) / 2;
        const dy = (outerRect.height - innerRect.height) / 2;
        panzoomInstance.current.moveTo(dx, dy);
      }
    });
  }, []);
  useEffect(() => {
    if (containerRef.current) {
      mermaid.contentLoaded();

      if (panzoomInstance.current) {
        panzoomInstance.current.dispose();
      }

      panzoomInstance.current = panzoom(containerRef.current, {
        smoothScroll: false,
      });

      centerChart();
    }
  }, [centerChart, chart]);

  const resetZoom = () => {
    if (
      panzoomInstance.current &&
      outerContainerRef.current &&
      containerRef.current
    ) {
      panzoomInstance.current.moveTo(0, 0);
      panzoomInstance.current.zoomAbs(0, 0, 1);
      centerChart();
    }
  };

  return (
    <div className="border border-muted-foreground rounded-lg overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-500">
        <div className="flex-1"></div>
        <Button variant="outline" onClick={resetZoom}>
          <RotateCcw />
          Reset
        </Button>
      </div>
      <div ref={outerContainerRef} className="overflow-hidden w-full h-[50vh]">
        <div className="mermaid" ref={containerRef}>
          {chart}
        </div>
      </div>
    </div>
  );
};

export default MermaidChart;
