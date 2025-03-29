import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "@/hooks/use-auth";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import LandingPage from "@/pages/landing-page";
import DashboardPage from "@/pages/dashboard-page";
import ProfilePage from "@/pages/profile-page";
import HistoryPage from "@/pages/history-page";
import CheckinMensalistaPage from "@/pages/checkin-mensalista-page";
import CheckinAvulsoPage from "@/pages/checkin-avulso-page";
import CheckinConfirmationPage from "@/pages/checkin-confirmation-page";
import QrScannerPage from "@/pages/qr-scanner-page";
import VacationAddPage from "@/pages/vacation-add-page";

// Route that redirects to dashboard if authenticated, otherwise shows landing page
function HomeRoute() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (user) {
    navigate("/dashboard");
    return null;
  }
  
  return <LandingPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/qr-scanner" component={QrScannerPage} />
      <Route path="/checkin/avulso/:tripId" component={CheckinAvulsoPage} />
      <Route path="/checkin/confirmation" component={CheckinConfirmationPage} />
      
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/history" component={HistoryPage} />
      <ProtectedRoute path="/checkin/mensalista" component={CheckinMensalistaPage} />
      <ProtectedRoute path="/vacation/add" component={VacationAddPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="mx-auto bg-white min-h-screen relative">
          <Router />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
