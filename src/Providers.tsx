import { ThemeProvider } from "./providers/ThemeProvider";

interface ProvidersProps {
  children: any;
}
const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <div>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {children}
      </ThemeProvider>
    </div>
  );
};
export default Providers;
