import MermaidChart from "../ChatPage/Children/MermaidChart";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div>
      <MermaidChart chart={chartDef} />
    </div>
  );
};
export default PracticePage;

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
