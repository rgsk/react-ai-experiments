import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./providers/ThemeProvider";
const queryClient = new QueryClient();

interface ProvidersProps {
  children: any;
}
const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
};
export default Providers;
