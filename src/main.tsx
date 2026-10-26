import { StrictMode, useLayoutEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { I18nextProvider } from "react-i18next";
import i18n, { localeFromPath } from "./i18n";
import App from "./App.tsx";
import { LegalPage } from "./components/LegalPage";
import "./index.css";

function LocaleSync({ children }: { children: ReactNode }) {
  const location = useLocation();
  const locale = localeFromPath(location.pathname);

  useLayoutEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
    document.documentElement.lang = locale;
  }, [locale]);

  return children;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <LocaleSync>
            <Routes>
              <Route path="/" element={<App key="es" />} />
              <Route path="/en" element={<App key="en" />} />
              <Route path="/terminos" element={<LegalPage doc="terms" />} />
              <Route path="/privacidad" element={<LegalPage doc="privacy" />} />
              <Route path="/en/terms" element={<LegalPage doc="terms" />} />
              <Route path="/en/privacy" element={<LegalPage doc="privacy" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </LocaleSync>
        </BrowserRouter>
      </I18nextProvider>
    </HelmetProvider>
  </StrictMode>,
);
