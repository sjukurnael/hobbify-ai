import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SignInModal } from "@/components/SignInModal";
import { useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Classes from "./pages/Classes";
import MyBookings from "./pages/MyBookings";
import Studio from "./pages/Studio";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { showSignInModal, setShowSignInModal } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <SignInModal 
        open={showSignInModal} 
        onOpenChange={setShowSignInModal} 
      />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
