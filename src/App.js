import RecruitmentDashboard from './recruitment-dashboard.tsx';
import { Analytics } from "@vercel/analytics/react";
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <RecruitmentDashboard />
      <Analytics />
    </ErrorBoundary>
  );
}

export default App;
