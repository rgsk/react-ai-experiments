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
                make sure you perform print/console.log, so you can the see the
                code execution output, if you won't do that you would get empty
                string as output.
              </important>
              <note>
              you also have the ability to generate urls for csv files and graphs
              <span>
                # for eg for csv file you can do below
                import pandas as pd
                data = pd.DataFrame({'x': [1, 2, 3], 'y': [2, 4, 6]})
                data.to_csv("filename.csv") 
                # or
                data.head() # data will be saved to head.csv
              </span>
              <span>
                # for generating graph use matplotlib like below
                import matplotlib.pyplot as plt
                x = [1, 2, 3, 4, 5]
                y = [10, 20, 25, 30, 50]
                plt.plot(x, y, marker='o', linestyle='-', color='b', label='Line 1')
                plt.legend()
                plt.show()
              </span>
              </note>
              `,
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
