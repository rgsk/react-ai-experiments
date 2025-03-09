import { codeRunnerSupportedLanguages } from "~/hooks/codeRunners/useCodeRunners";
import { Tool, ToolSource, ToolVariant } from "~/services/experimentsService";

const clientTools: Tool[] = [
  {
    type: "function",
    variant: ToolVariant.clientSide,
    source: ToolSource.web,
    function: {
      name: "executeCode",
      description:
        "you have to ability to execute code and give outputs of stdout to the user.",
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: `the code to execute.
      <important>
        make sure you perform print/console.log, so you can the see the code
        execution output, if you won't do that you would get empty string as
        output.
      </important>`,
          },
          language: {
            type: "string",
            enum: [...codeRunnerSupportedLanguages],
            description: `programming language to use. If the user explicitly
      tells about which language to use, use that language. if it's not one of
      known language, then you can't execute code in that language.`,
          },
        },
        required: ["code", "language"],
        additionalProperties: false,
      },
      strict: false,
    },
  },
];
export default clientTools;
