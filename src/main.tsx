import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './i18n/LanguageContext.tsx';
import { AppearanceProvider } from "./theme/AppearanceContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppearanceProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </AppearanceProvider>
  </StrictMode>,
);
