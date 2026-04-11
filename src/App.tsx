import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import KnowledgeBase from "./pages/KnowledgeBase";
import Instructions from "./pages/Instructions";
import Settings from "./pages/Settings";
import AskEmails from "./pages/AskEmails";
import Templates from "./pages/Templates";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import ChoosePlan from "./pages/ChoosePlan";
import Inbox from "./pages/Inbox";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Onboarding from "./pages/Onboarding";
import OnboardingPlan from "./pages/OnboardingPlan";
import OnboardingPayment from "./pages/OnboardingPayment";
import Signup from "./pages/Signup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/mails" replace />} />
            <Route path="/mails" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/choose-plan" element={<ChoosePlan />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/onboarding/plan" element={<OnboardingPlan />} />
            <Route path="/onboarding/payment" element={<OnboardingPayment />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/instructions" element={<Instructions />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/ask" element={<AskEmails />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
