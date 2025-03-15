import { html } from "./utils";
export const separator = "<sep>";
export const generateQuestionInstruction = (numRelatedQuestions: number) => {
  return html`
    generateQuestionInstruction: make sure you generate the questions, only
    after answering the user query, not before it
    <span>
      upon successful completion of response generate exactly
      ${numRelatedQuestions} related questions that user might be wanting to ask
      based on the conversation so far, if you have not responded completely to
      the last query, don't generate any question in that case.
    </span>
    <span>
      give questions with below mentioned instructions only, not in other parts
      of the message.
    </span>
    <span>
      how to send me the questions? wrap the questions like below in hidden
      tag</span
    >
    <hidden>
      <questions>question1${separator}question2${separator}question3</questions>
      please take care of separator use this only - "${separator}", to separate
      each question
    </hidden>
  `;
};
