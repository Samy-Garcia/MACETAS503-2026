import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google"
import { activarValidacionEnEspanol } from "./utils/spanishValidation.js";

// Mensajes de validación de los formularios siempre en español
activarValidacionEnEspanol();

ReactDOM.createRoot(document.getElementById("root")).render(
  
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>

      <App />

  </GoogleOAuthProvider>
);
//nota: Este es el componente principal de la aplicación.