import { createRoot } from 'react-dom/client';
import './styles.css';
import { App } from './App';
import { startDomTranslation } from '@eday/i18n/dom';

createRoot(document.getElementById('root')!).render(<App />);
// Screens are written in Spanish; in English the page is translated as it renders (ADR 0007).
startDomTranslation();
