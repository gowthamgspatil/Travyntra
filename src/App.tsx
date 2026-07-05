import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import BackToTop from "@/components/BackToTop";
import ChatWidget from "@/components/ChatWidget";
import Recommend from "./pages/Recommend.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ExperiencesPage from "./pages/Experiences.tsx";
// Beach pages removed from routing
import DestinationsPage from "./pages/Destinations.tsx";
import BlogPage from "./pages/Blog.tsx";
import AboutPage from "./pages/About.tsx";
import ContactPage from "./pages/Contact.tsx";
import ProfilePage from "./pages/Profile.tsx";
import SearchPage from "./pages/Search.tsx";
import DestinationDetail from "./pages/DestinationDetail.tsx";
import PaymentSuccess from "./pages/PaymentSuccess.tsx";
import WeekendTrips from "./pages/WeekendTrips.tsx";
import WishlistPage from "./pages/Wishlist.tsx";
import AdminPage from "./pages/Admin.tsx";
import Packages from "./pages/Packages.tsx";
import PackageDetail from "./pages/PackageDetail.tsx";
import Services from "./pages/Services.tsx";
import Partners from "./pages/Partners.tsx";
import Enquiry from "./pages/Enquiry.tsx";
import BeachHolidays from "./pages/BeachHolidays";
import BeachDetail from "./pages/BeachDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
          <BackToTop />
          <ChatWidget />
          <Routes>
            <Route path="/recommend" element={<Recommend />} />
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/experiences" element={<ExperiencesPage />} />
            <Route path="/experiences/beach-holidays" element={<BeachHolidays />} />
            <Route path="/experiences/beach/:slug" element={<BeachDetail />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/destinations/:slug" element={<DestinationDetail />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/packages/:id" element={<PackageDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/enquiry" element={<Enquiry />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/weekend-trips" element={<WeekendTrips />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
