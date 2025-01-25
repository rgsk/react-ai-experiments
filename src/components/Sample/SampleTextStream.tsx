import { useState } from "react";
import { v4 } from "uuid";
import { Input } from "~/components/ui/input";
import useTextStream from "~/hooks/useTextStream";
import { Button } from "../ui/button";

interface SampleTextStreamProps {}
const SampleTextStream: React.FC<SampleTextStreamProps> = ({}) => {
  const [input, setInput] = useState("");
  const { handleGenerate, loading, text } = useTextStream();

  return (
    <div>
      <Input
        type="text"
        placeholder="Message"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button
        onClick={() =>
          handleGenerate({
            messages: [{ id: v4(), role: "user", content: input }],
          })
        }
      >
        Send
      </Button>

      <div>{loading ? "Generating..." : ""}</div>
      <div>{text}</div>
    </div>
  );
};
export default SampleTextStream;
