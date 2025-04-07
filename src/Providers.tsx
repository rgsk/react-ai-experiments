import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalContextProvider } from "./providers/GlobalContextProvider";
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
          <GlobalContextProvider>{children}</GlobalContextProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
};
export default Providers;
