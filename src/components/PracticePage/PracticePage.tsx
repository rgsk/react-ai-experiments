import { Button } from "../ui/button";

interface PracticePageProps {}
const PracticePage: React.FC<PracticePageProps> = ({}) => {
  return (
    <div>
      <Button
        onClick={() => {
          const markdown = createMarkdownContent(messages);
          downloadMarkdownFile(markdown);
        }}
      >
        Download{" "}
      </Button>
    </div>
  );
};
export default PracticePage;

// Define the Message type
interface Message {
  id: string;
  role: string;
  status: string;
  content: string;
}

// Function to create markdown content from messages array
function createMarkdownContent(messages: Message[]): string {
  let markdownContent = "# Chat Export\n\n";
  messages.forEach((message) => {
    const role = message.role.charAt(0).toUpperCase() + message.role.slice(1);
    markdownContent += `**${role}:** ${message.content}\n\n`;
  });
  return markdownContent;
}

// Function to trigger a download of a file created from a string
function downloadMarkdownFile(
  markdown: string,
  filename: string = "chat_export11.md"
) {
  // Create a new Blob with the markdown content
  const blob = new Blob([markdown]);
  // Create a URL for the Blob
  const url = window.URL.createObjectURL(blob);
  // Create an anchor element and trigger a click to download the file
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  // Clean up the DOM and release the object URL
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

// Example usage:
const messages = [
  {
    id: "adc59053-b84c-4ef5-87fb-54b105355886",
    role: "user",
    status: "completed",
    content: "hi",
  },
  {
    id: "5bb73b50-d495-428a-aa98-53d0c7412ef7",
    role: "assistant",
    status: "completed",
    content: "Hello! How can I assist you today?",
  },
  {
    id: "2f392f4e-252f-4624-8dc1-d39b0ee32518",
    role: "user",
    status: "completed",
    content: "execute this in python 19191 * 38383",
  },
  {
    id: "4e372bba-470f-4578-a83b-a02efdd4ea2b",
    role: "assistant",
    status: "completed",
    content: "calling tools - executeCode",
    tool_calls: [
      {
        id: "call_PgpOPcA1nK4oPb5ySRKDnlYn",
        type: "function",
        index: 0,
        source: "web",
        variant: "clientSide",
        function: {
          name: "executeCode",
          arguments: {
            code: "19191 * 38383",
            language: "python",
          },
        },
      },
    ],
  },
  {
    id: "438a4b1f-fe8c-492e-9302-53684457f4b6",
    role: "tool",
    status: "completed",
    content: "736608153\n",
    tool_call_id: "call_PgpOPcA1nK4oPb5ySRKDnlYn",
  },
  {
    id: "7defe93c-c273-4726-9abd-0bdd85d367e6",
    role: "assistant",
    status: "completed",
    content: "The result of \\( 19191 \\times 38383 \\) is 73,660,8153.",
  },
];
