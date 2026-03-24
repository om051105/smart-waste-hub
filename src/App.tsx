import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedPage from "./components/ProtectedPage";
import AIDetectPage from "./pages/AIDetectPage";
import ComplaintsPage from "./pages/ComplaintsPage";
import TrainingPage from "./pages/TrainingPage";
import RewardsPage from "./pages/RewardsPage";
import FacilitiesPage from "./pages/FacilitiesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CollectionsPage from "./pages/CollectionsPage";
import ChampionDashboard from "./pages/ChampionDashboard";
import { getSession } from "./lib/auth";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedPage>{children}</ProtectedPage>;
}

function UserProp({ children }: { children: (user: any) => React.ReactNode }) {
  const user = getSession();
  if (!user) return null;
  return <>{children(user)}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ai-detect" element={<ProtectedRoute><AIDetectPage /></ProtectedRoute>} />
          <Route path="/complaints" element={<ProtectedRoute><UserProp>{(user) => <ComplaintsPage user={user} />}</UserProp></ProtectedRoute>} />
          <Route path="/training" element={<ProtectedRoute><TrainingPage /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><UserProp>{(user) => <RewardsPage user={user} />}</UserProp></ProtectedRoute>} />
          <Route path="/facilities" element={<ProtectedRoute><FacilitiesPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/collections" element={<ProtectedRoute><CollectionsPage /></ProtectedRoute>} />
          <Route path="/inspections" element={<ProtectedRoute><UserProp>{(user) => <ChampionDashboard user={user} />}</UserProp></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
