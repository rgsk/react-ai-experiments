import experimentsService from "~/services/experimentsService";
import jsonDataService from "~/services/jsonDataService";
import { Button } from "../ui/button";
type RandomPerson = {
  name: string;
  age: number;
  designation: string;
};
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
          const result =
            await experimentsService.getJsonCompletion<RandomPerson>({
              messages: [
                {
                  role: "user",
                  content:
                    "generate a random person with name, age and designation as json, name should be mehak",
                },
              ],
            });
          console.log({ result });
          console.log("name:", result.name);
          console.log("age:", result.age);
          console.log("designation:", result.designation);
          await jsonDataService.createMany<RandomPerson>([
            {
              key: "randomPerson1",
              value: result,
            },
          ]);
        }}
      >
        JSON Completion
      </Button>
      <Button
        onClick={async () => {
          const result = await jsonDataService.getKey<RandomPerson>({
            key: "randomPerson1",
          });
          console.log(result?.value.name);
        }}
      >
        Log Value
      </Button>
    </div>
  );
};
export default SampleCompletion;
