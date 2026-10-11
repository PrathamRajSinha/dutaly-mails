import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { ThemeProvider } from "./hooks/useTheme";
import "./index.css";
import "./components/landing/landing.css";

const fonts = document.createElement("link");
fonts.rel = "stylesheet";
fonts.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800&family=Karla:wght@300;400;500;600;700&family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&family=Lora:ital,wght@0,400;0,500;1,400&family=Roboto:wght@400;500;600&display=swap";
document.head.appendChild(fonts);

const root = document.getElementById("root");
if (!root) throw new Error("The application could not start.");
createRoot(root).render(
  <HelmetProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </HelmetProvider>
);
