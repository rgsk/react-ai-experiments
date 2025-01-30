import { LiveEditor, LiveError, LivePreview, LiveProvider } from "react-live";

const code = `
function Counter() {
  // Use the useState hook to create a state variable 'count' with an initial value of 0
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const doubleCount = count * 2;
    console.log({doubleCount})
  }, [count])

  // Function to increment the counter
  const increment = () => {
    setCount(count + 1);
  };

  // Function to decrement the counter
  const decrement = () => {
    setCount(count - 1);
  };

  // Render the counter component
  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
}
`;

function SampleReactLive() {
  return (
    <LiveProvider code={code}>
      <LiveEditor />
      <LiveError />
      <LivePreview />
    </LiveProvider>
  );
}

export default SampleReactLive;
