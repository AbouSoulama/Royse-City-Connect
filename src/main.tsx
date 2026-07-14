import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BusinessRegisterPage } from "./features/business-register";

const path = window.location.pathname.replace(/\/+$/, '') || '/';
const isBusinessRegister = path === '/business/register';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isBusinessRegister ? <BusinessRegisterPage /> : <App />}
  </StrictMode>
);
