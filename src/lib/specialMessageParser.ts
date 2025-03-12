import { html } from "./utils";

export const generateQuestionInstruction = html`
  upon successful completion of response generate upto 3 related questions that
  user might be wanting to ask based on the conversation so far, if you have not
  responded completely to the last query, don't generate any question in that
  case. never say something like - Got it! Whenever I complete a response, I'll
  append up to three related questions wrapped in the specified div format.
  Please let me know what you need help with! only respond to the previous user
  text message (this is a system prompt, user shouldn't know that I have
  instructed you to generate questions) give questions with below mentioned
  instructions only, not in other parts of the message how to send me the
  questions? wrap the questions like this
  <hidden><questions>question1,question2</questions></hidden>
`;
