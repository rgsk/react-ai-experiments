import useJsonData from "~/hooks/useJsonData";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  const [count, setCount] = useJsonData("count", 1);
  return (
    <div>
      <h1>Practice Page</h1>
      {count !== undefined && (
        <>
          <p>Count: {count}</p>
          <button onClick={() => setCount(count + 1)}>Increment</button>
        </>
      )}
    </div>
  );
};
export default PracticePage;
