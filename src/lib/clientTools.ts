import { codeRunnerSupportedLanguages } from "~/hooks/codeRunners/useCodeRunners";
import { Tool, ToolSource, ToolVariant } from "./typesJsonData";
import { html } from "./utils";

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
            description: html`the code to execute.
              <important>
                make sure you perform print/console.log, so you can the see the
                code execution output, if you won't do that you would get empty
                string as output.
              </important>
              <note>
                you also have the ability to generate urls for csv files and
                graphs
                <span>
                  # for eg for csv file you can do below
                  <pre>
                    import pandas as pd
                    data = pd.DataFrame({'x': [1, 2, 3], 'y': [2, 4, 6]})
                    data.to_csv("filename.csv") 
                    # or 
                    data.head() # data will be saved to head.csv
                  </pre
                  >
                </span>
                <span>
                  when you have the file url, use code like below to fetch it's
                  contents
                  <pre>
                    pd.read_csv('https://pubbuckrah.s3.us-east-1.amazonaws.com/91bff1cc-6a88-4c4f-9af0-097f0428d8cc/sample_linear_regression.csv')
                 </pre
                  >

                  <important>
                    use only above method to fetch csv content, don't run code
                    like below (because requests module is not available)
                    <pre>
                      response = requests.get(url) 
                      with open('head.csv', 'wb') as file: 
                          file.write(response.content)
                      </pre
                    >
                  </important>
                </span>
                <span>
                  in most cases you are given both csv url and csv content (csv
                  content fetched from that url) make sure you don't type out
                  all csv content in a variable, always use read_csv with a url,
                  so that you can respond quickly</span
                >
                <span>
                  # for generating graph use matplotlib like below (you have
                  only matplotlib in this environment, no seaborn)
                  <pre>
                    import matplotlib.pyplot as plt 
                    x = [1, 2, 3, 4, 5] 
                    y = [10, 20, 25, 30, 50] 
                    plt.plot(x, y, marker='o', linestyle='-', color='b', label='Line 1') 
                    plt.legend() 
                    plt.show()
                  </pre
                  >
                  <important>
                    don't run code like below, just running plt.show() is
                    sufficient
                    <pre>
                    # Save to file
                    plt.savefig('/mnt/data/housing_graphs_corrected.png')
                  </pre
                    >
                  </important>
                </span>
              </note> `,
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
