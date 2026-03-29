// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AuthenticatedLayout from "./layout/AuthenticatedLayout";
import ScrollToTop from "./components/ScrollToTop"; // ✅ Import scroll helper

// Pages
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import Landing from "./pages/LandingPage";
import ProFeature from "./pages/ProFeatures";
import AboutUs from "./pages/AboutUs";
import TermsOfService from "./pages/TermsOfService";
import FAQ from "./pages/FAQ";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AskAI from "./pages/AskAI";
import Documents from "./pages/Documents";
// import BudgetCalculator from "./pages/budget/NoBudgetCalculator";
import QuizPage from "./pages/QuizPage";
// import BudgetHistory from "./pages/budget/BudgetHistory";
// import BudgetRedirect from "./pages/budget/BudgetRedirector";
// import BudgetDetail from "./pages/budget/BudgetDetail";
import CompleteProfile from "./components/CompleteProfileModal";
import AccountSettings from "./pages/settings/AccountSettings";
import PreferenceSettings from "./pages/settings/PreferenceSettings";
import NotificationSettings from "./pages/settings/NotificationSettings";
import DataPrivacySettings from "./pages/settings/DataPrivacySettings";
import SavedNotes from "./pages/SavedNotes";
import Extension from "./pages/Extension";
import BudgetChat from "./pages/budget/BudgetChat";
import BudgetChatViewer from "./pages/budget/BudgetChatViewer";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import MyBookmarks from "./pages/Bookmark";
import ForgotPassword from "./pages/ForgetPassword";
import GuestChat from "./pages/GuestChat";
import WelcomePage from "./pages/WelcomePage";
import KnowledgeBaseAdmin from "./pages/KnowledgeBaseAdmin";
import AdminReportingDashboard from "./pages/AdminReportingDashboard";
import AdminDataAccess from "./pages/AdminDataAccess";
import ComingSoon from "./pages/ComingSoon";
import Pricing from "./pages/Pricing";
import HomeTruths from "./pages/HomeTruths";
import ArticleDetail from "./pages/ArticleDetail";
import AdminArticleManager from "./pages/AdminArticleManager";
// Check if we're in "Coming Soon" mode
const isComingSoonMode = process.env.REACT_APP_COMING_SOON === 'true';

function App() {
  // If Coming Soon mode is enabled, show only the Coming Soon page (except admin routes)
  if (isComingSoonMode) {
    return (
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Allow admin login even in Coming Soon mode */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Protected Routes - accessible during Coming Soon mode */}
            <Route
              path="/admin/knowledge-base"
              element={
                <AdminProtectedRoute>
                  <AuthenticatedLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<KnowledgeBaseAdmin />} />
            </Route>

            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AuthenticatedLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<AdminReportingDashboard />} />
            </Route>

            <Route
              path="/admin/data-access"
              element={
                <AdminProtectedRoute>
                  <AuthenticatedLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<AdminDataAccess />} />
            </Route>

            <Route
              path="/admin/articles"
              element={
                <AdminProtectedRoute>
                  <AuthenticatedLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<AdminArticleManager />} />
            </Route>

            {/* Public article routes even in Coming Soon mode */}
            <Route path="/home-truths" element={<HomeTruths />} />
            <Route path="/home-truths/:slug" element={<ArticleDetail />} />

            {/* All other routes show Coming Soon */}
            <Route path="*" element={<ComingSoon />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    );
  }

  // Normal app routes
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop /> {/* ✅ Always scroll to top on route change */}

        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            }
          />
          <Route
            path="/pro-features"
            element={
              <PublicRoute>
                <ProFeature />
              </PublicRoute>
            }
          />
          <Route
            path="/about"
            element={
              <PublicRoute>
                <AboutUs />
              </PublicRoute>
            }
          />
          <Route
            path="/terms-of-service"
            element={
              <PublicRoute>
                <TermsOfService />
              </PublicRoute>
            }
          />
          <Route
            path="/faq"
            element={
              <PublicRoute>
                <FAQ />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/admin/login"
            element={
              <PublicRoute>
                <AdminLogin />
              </PublicRoute>
            }
          />
          <Route path="/privacy-policy" element={<PublicRoute><PrivacyPolicyPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/chat" element={<PublicRoute><GuestChat /></PublicRoute>} />
          <Route path="/coming-soon" element={<PublicRoute><ComingSoon /></PublicRoute>} />
          <Route path="/pricing" element={<PublicRoute><Pricing /></PublicRoute>} />
          <Route path="/home-truths" element={<HomeTruths />} />
          <Route path="/home-truths/:slug" element={<ArticleDetail />} />

          {/* Protected Routes with Shared Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="welcome" element={<WelcomePage />} />
            <Route path="ask-ai" element={<AskAI />} />
            <Route path="documents" element={<Documents />} />
            <Route path="home" element={<Home />} />
            <Route path="quiz" element={<QuizPage />} />
            {/* <Route path="budget" element={<BudgetRedirect />} /> */}
            {/* <Route path="budget-calculator" element={<BudgetCalculator />} /> */}
            {/* <Route path="budget-history" element={<BudgetHistory />} /> */}
            {/* <Route path="budget-history/:id" element={<BudgetDetail />} /> */}
            <Route path="complete-profile" element={<CompleteProfile />} />
            <Route path="saved-notes" element={<SavedNotes />} />
            <Route path="extension" element={<Extension />} />
            <Route path="/settings/account" element={<AccountSettings />} />
            <Route path="/settings/preferences" element={<PreferenceSettings />} />
            <Route path="/settings/notifications" element={<NotificationSettings />} />
            <Route path="/settings/data-privacy" element={<DataPrivacySettings />} />
            <Route path="/budget" element={<BudgetChat />} />
            <Route path="/budget-chat" element={<BudgetChat />} />
            <Route path="/budget-calculator" element={<BudgetChat />} />
            <Route path="/budget/view/:id" element={<BudgetChatViewer />} />
            <Route path="/bookmarked" element={<MyBookmarks />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin/knowledge-base"
            element={
              <AdminProtectedRoute>
                <AuthenticatedLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<KnowledgeBaseAdmin />} />
          </Route>

          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AuthenticatedLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminReportingDashboard />} />
          </Route>

          <Route
            path="/admin/data-access"
            element={
              <AdminProtectedRoute>
                <AuthenticatedLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDataAccess />} />
          </Route>

          <Route
            path="/admin/articles"
            element={
              <AdminProtectedRoute>
                <AuthenticatedLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminArticleManager />} />
          </Route>
        </Routes>
      </BrowserRouter >
    </AuthProvider >
  );
}

export default App;
