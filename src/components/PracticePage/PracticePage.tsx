interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div>
      <App />
    </div>
  );
};
export default PracticePage;
import mermaid from "mermaid";
import panzoom, { PanZoom } from "panzoom";
import React, { useEffect, useRef } from "react";
import { Button } from "../ui/button";

// Initialize mermaid with your desired settings
mermaid.initialize({
  startOnLoad: true,
});

interface MermaidChartProps {
  chart: string;
}

const MermaidChart: React.FC<MermaidChartProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panzoomInstance = useRef<PanZoom>();

  // Re-render the mermaid diagram and reinitialize panzoom when the chart changes
  useEffect(() => {
    if (containerRef.current) {
      // Render the diagram
      mermaid.contentLoaded();

      // Dispose the previous panzoom instance if it exists
      if (panzoomInstance.current) {
        panzoomInstance.current.dispose();
      }
      // Initialize panzoom on the outer container
      panzoomInstance.current = panzoom(containerRef.current, {
        smoothScroll: false,
      });
    }
  }, [chart]);

  const resetZoom = () => {
    if (panzoomInstance.current) {
      // panzoomInstance.current.reset();
      panzoomInstance.current.moveTo(0, 0);
      panzoomInstance.current.zoomAbs(0, 0, 1);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <Button onClick={resetZoom}>Reset</Button>
      </div>
      {/* Use an outer container that remains stable */}
      <div className="border border-red-500 overflow-hidden w-full h-[50vh]">
        <div className="mermaid" ref={containerRef}>
          {chart}
        </div>
      </div>
    </div>
  );
};

const chartDef = `
graph TD;
    A[Total Expenses: 9434]
    B[Amount Given: 8000]
    C[Reimbursement: 1434]
    D[Amount belonging to Lal and Aksh: 200]
    E[Amount due to Rahul Gupta: 1234]

    A --> B
    A --> C
    C --> D
    C --> E

    subgraph Expenses Breakdown
        F[Uber Trip - Noida to Bhiwadi: 2590]
        G[Tolls to Driver: 780]
        H[Pizza Breakfast: 291]
        I[Lunch in Expo: 400]
        J[Water Bottles: 40]
        K[Tea: 40]
        L[Auto Rikshaw Expo to Hotel: 100]
        M[Boiled Eggs: 60]
        N[Egg Rolls: 150]
        O[Hotel: 1211]
        P[Soap: 40]
        Q[Breakfast Sunday Morning: 251]
        R[Snacks: 130]
        S[Auto: 100]
        T[Lunch: 150]
        U[Water Bottle: 20]
        V[Tea: 40]
        W[Taxi to Noida: 3000]
        X[Ride to home: 41]
    end

    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    A --> K
    A --> L
    A --> M
    A --> N
    A --> O
    A --> P
    A --> Q
    A --> R
    A --> S
    A --> T
    A --> U
    A --> V
    A --> W
    A --> X

`;
const App: React.FC = () => {
  const chartDefinition = `
    graph LR
      A[Start] --> B{Decision}
      B --> Yes --> C[Option 1]
      B --> No --> D[Option 2]
      C --> E[End]
      D --> E
  `;

  return (
    <div>
      <h1>Mermaid Flowchart in React (Single File)</h1>
      <MermaidChart chart={chartDef} />
    </div>
  );
};
