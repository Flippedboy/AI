import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

import RoutesComponent from './app.tsx';
import './index.css';
import { createPortal } from 'react-dom';
import { Toaster } from './components/ui/sonner';

const CLIENT_BASE_PATH = '/';

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="max-w-md p-8 text-center">
      <h2 className="text-xl font-bold text-foreground mb-2">页面出现错误</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
      >
        重新加载
      </button>
    </div>
  </div>
);

const MainApp = () => {
  return (
    <BrowserRouter basename={CLIENT_BASE_PATH}>
      <div className="min-h-screen bg-background text-foreground">
        <ErrorBoundary fallbackRender={({ error }) => <ErrorFallback error={error as Error} />}>
          <RoutesComponent />
          {createPortal(<Toaster />, document.body)}
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(<MainApp />);
