import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';



import App from './App';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './components/ErrorFallback'
import { BrowserRouter } from 'react-router';
import { LoginProvider } from './auth/LoginProvider';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";


const root = createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <LoginProvider>
      <BrowserRouter>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </LoginProvider>
  </StrictMode>
);


