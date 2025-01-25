import experimentsService from "~/services/experimentsService";
import { Button } from "../ui/button";

interface SampleCompletionProps {}
const SampleCompletion: React.FC<SampleCompletionProps> = ({}) => {
  return (
    <div>
      <Button
        onClick={async () => {
          const { content } = await experimentsService.getCompletion({
            messages: [{ role: "user", content: "Hello" }],
          });
          console.log({ content });
        }}
      >
        Completion
      </Button>
      <Button
        onClick={async () => {
          const result = await experimentsService.getJsonCompletion<{
            name: string;
            age: number;
            designation: string;
          }>({
            messages: [
              {
                role: "user",
                content:
                  "generate a random person with name, age and designation as json",
              },
            ],
          });
          console.log({ result });
          console.log("name:", result.name);
          console.log("age:", result.age);
          console.log("designation:", result.designation);
        }}
      >
        JSON Completion
      </Button>
    </div>
  );
};
export default SampleCompletion;
