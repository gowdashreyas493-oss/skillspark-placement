import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PlacementDrives from "./pages/student/PlacementDrives";
import MyApplications from "./pages/student/MyApplications";
import Assessments from "./pages/student/Assessments";
import Companies from "./pages/admin/Companies";
import ManageDrives from "./pages/admin/ManageDrives";
import ManageAssessments from "./pages/admin/ManageAssessments";
import ViewApplications from "./pages/admin/ViewApplications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/student/drives" element={<PlacementDrives />} />
          <Route path="/student/applications" element={<MyApplications />} />
          <Route path="/student/assessments" element={<Assessments />} />
          <Route path="/admin/companies" element={<Companies />} />
          <Route path="/admin/drives" element={<ManageDrives />} />
          <Route path="/admin/assessments" element={<ManageAssessments />} />
          <Route path="/admin/applications" element={<ViewApplications />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
