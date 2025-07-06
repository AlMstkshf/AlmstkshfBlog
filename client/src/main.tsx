import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set initial language and direction based on URL - execute immediately
(function initializeLanguage() {
  const urlPath = window.location.pathname;
  const isArabic = urlPath.startsWith("/ar");
  const language = isArabic ? "ar" : "en";
  const direction = isArabic ? "rtl" : "ltr";

  // Update HTML attributes immediately
  document.documentElement.lang = language;
  document.documentElement.dir = direction;
  
  // Clear any existing classes and set proper language classes
  document.body.className = `lang-${language} dir-${direction}`;
  
  // Also set on HTML element for comprehensive styling support
  document.documentElement.className = `lang-${language} dir-${direction}`;
})();

createRoot(document.getElementById("root")!).render(<App />);
