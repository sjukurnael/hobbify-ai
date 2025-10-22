import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Classes from "@/pages/Classes";
import MyBookings from "@/pages/MyBookings";
import Admin from "@/pages/Admin";
import Studio from "@/pages/Studio";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;