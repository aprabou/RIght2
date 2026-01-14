import RecruitmentDashboard from './recruitment-dashboard.tsx';
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <>
      <RecruitmentDashboard />
      <Analytics/>
    </>
  );
}

export default App;
