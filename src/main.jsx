import React from "react";
import { createRoot } from "react-dom/client";
import {HashRouter, BrowserRouter} from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

import { AuthProvider }
from "./context/AuthContext.jsx";

import { Toaster }
from "react-hot-toast";
import { NotificationProvider } from "./context/NotificationContext.jsx";

createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,

            style: {
              fontSize: "14px",
              zIndex: 99999999999999,
            },
          }}
        />
        <App />
        </NotificationProvider>
      </AuthProvider>

    </BrowserRouter>

  </React.StrictMode>
);