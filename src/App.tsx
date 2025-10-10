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
import MockInterview from "./pages/student/MockInterview";
import AptitudeTest from "./pages/student/AptitudeTest";
import CodeCompiler from "./pages/student/CodeCompiler";
import Performance from "./pages/student/Performance";
import Profile from "./pages/student/Profile";
import StudentAnnouncements from "./pages/student/Announcements";
import Companies from "./pages/admin/Companies";
import ManageDrives from "./pages/admin/ManageDrives";
import ManageAssessments from "./pages/admin/ManageAssessments";
import ViewApplications from "./pages/admin/ViewApplications";
import Announcements from "./pages/admin/Announcements";
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
          <Route path="/student/mock-interview" element={<MockInterview />} />
          <Route path="/student/aptitude-test" element={<AptitudeTest />} />
          <Route path="/student/code-compiler" element={<CodeCompiler />} />
          <Route path="/student/performance" element={<Performance />} />
          <Route path="/student/profile" element={<Profile />} />
          <Route path="/student/announcements" element={<StudentAnnouncements />} />
          <Route path="/admin/companies" element={<Companies />} />
          <Route path="/admin/drives" element={<ManageDrives />} />
          <Route path="/admin/assessments" element={<ManageAssessments />} />
          <Route path="/admin/applications" element={<ViewApplications />} />
          <Route path="/admin/announcements" element={<Announcements />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
