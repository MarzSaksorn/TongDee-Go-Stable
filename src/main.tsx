import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './i18n/LanguageContext.tsx';
import { AppearanceProvider } from "./theme/AppearanceContext";
import { ToastProvider } from "./components/ToastProvider";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <AppearanceProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AppearanceProvider>
    </ToastProvider>
  </StrictMode>,
);
