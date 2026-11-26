import { mayaHomeDestination } from "./utils/demoEntry";
import { localManualAskEnabled } from "./features/items/manualAskContext";
import { controlCentreEnabled } from "./utils/localDemo";
import DemoEntry from './pages/DemoEntry';
import OperationsDemo from './pages/OperationsDemo';
// src/App.jsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AuthenticatedLayout from "./layout/AuthenticatedLayout";
import ScrollToTop from "./components/ScrollToTop"; // ✅ Import scroll helper

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import HowHomeTruthWorks from "./pages/LandingPage";
import ProFeature from "./pages/ProFeatures";
import AboutUs from "./pages/AboutUs";
import TermsOfService from "./pages/TermsOfService";
import FAQ from "./pages/FAQ";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AskAI from "./pages/AskAI";
import Documents from "./pages/Documents";
import PropertyProfile from "./pages/PropertyProfile";
import PartnerOnboarding from "./pages/PartnerOnboarding";
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
import Tools from "./pages/Tools";
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
import AdminUXSpecifications from "./pages/AdminUXSpecifications";
import AdminWorkspace, { AdminOverview, AdminResources } from "./pages/AdminWorkspace";
import AdminDataAccess from "./pages/AdminDataAccess";
import ComingSoon from "./pages/ComingSoon";
import Pricing from "./pages/Pricing";
import HomeTruths from "./pages/HomeTruths";
import ArticleDetail from "./pages/ArticleDetail";
import AdminArticleManager from "./pages/AdminArticleManager";
import PartnerProgrammeAdmin from "./pages/PartnerProgrammeAdmin";
import PartnerProgrammeWorkspace from "./pages/PartnerProgrammeWorkspace";
import VisualReviewHarness from "./dev/VisualReviewHarness";
// Check if we're in "Coming Soon" mode
const isComingSoonMode = process.env.REACT_APP_COMING_SOON === 'true';
const isVisualReviewMode = process.env.REACT_APP_VISUAL_REVIEW === 'true';
const hasHomepagePreview = process.env.NODE_ENV === "development" || isVisualReviewMode;
const openHomepagePreviewByDefault = hasHomepagePreview && process.env.REACT_APP_HOMEPAGE_PREVIEW_DEFAULT === "true";
const showHomepageQuestions = process.env.REACT_APP_HOMEPAGE_QUESTIONS === "true";
const Homepage = lazy(() => import("./pages/Homepage"));
const LocalApplianceWorkspace = lazy(() => import("./pages/LocalApplianceWorkspace"));
const FindMyManualPreview = lazy(() => import("./pages/FindMyManualPreview"));
const StartHomeRecord = lazy(() => import("./pages/StartHomeRecord"));
const ControlCentre = lazy(() => import("./pages/ControlCentre"));
const ControlCentrePreview = lazy(() => import("./pages/ControlCentrePreview"));
const AdminOntology = lazy(() => import("./pages/ontology/AdminOntology"));
const AdminDesignSystem = lazy(() => import("./pages/AdminDesignSystem"));

const adminRoutes = (
  <Route path="/admin" element={<AdminProtectedRoute><AuthenticatedLayout /></AdminProtectedRoute>}>
    <Route element={<AdminWorkspace />}>
      <Route index element={<AdminOverview />} />
      <Route path="operations" element={<OperationsDemo />} />
      <Route path="knowledge-base" element={<KnowledgeBaseAdmin />} />
      <Route path="dashboard" element={<AdminReportingDashboard />} />
      <Route path="partner-programmes" element={<PartnerProgrammeAdmin />} />
      <Route path="resources" element={<AdminResources />} />
      <Route path="resources/ontology" element={<Suspense fallback={<p>Loading ontology…</p>}><AdminOntology /></Suspense>} />
      <Route path="articles" element={<AdminArticleManager />} />
      <Route path="user-flows" element={<AdminUXSpecifications />} />
      <Route path="design-system" element={<Suspense fallback={null}><AdminDesignSystem /></Suspense>} />
      <Route path="design-system/reference" element={<Suspense fallback={null}><AdminDesignSystem /></Suspense>} />
      <Route path="design-system/index.html" element={<Suspense fallback={null}><AdminDesignSystem /></Suspense>} />
      <Route path="data-access" element={<AdminDataAccess />} />
    </Route>
  </Route>
);

function CustomerHome({ children }) {
  const { user } = useAuth();
  const destination = mayaHomeDestination(user);
  return destination ? <Navigate to={destination} replace /> : children;
}

function App() {
  // If Coming Soon mode is enabled, show only the Coming Soon page (except admin routes)
  if (isComingSoonMode) {
    return (
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {adminRoutes}
            <Route path="/login" element={<Login comingSoon />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />

            <Route
              path="/partner-programmes"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PartnerProgrammeWorkspace />} />
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
          {adminRoutes}
          {/* Public Routes */}
          {hasHomepagePreview && (
            <Route path="/homepage-preview" element={<Suspense fallback={null}><Homepage questionHome="/homepage-preview" /></Suspense>}>
              <Route path="start-home-record" element={<StartHomeRecord homeHref="/homepage-preview" />} />
            </Route>
          )}
          {hasHomepagePreview && (
            <Route path="/workspace-preview" element={<Suspense fallback={null}><ControlCentrePreview /></Suspense>} />
          )}
          <Route path="/demo" element={<DemoEntry />} />
          {showHomepageQuestions ? (
            <Route path="/" element={<Suspense fallback={null}><Homepage questionHome="/" /></Suspense>}>
              <Route path="start-home-record" element={<StartHomeRecord />} />
              <Route path="find-my-manual" element={<FindMyManualPreview />} />
            </Route>
          ) : (
            <Route
              path="/"
              element={openHomepagePreviewByDefault ? <Navigate to="/homepage-preview" replace /> : (
                <PublicRoute allowAdmin>
                  <Suspense fallback={null}><Homepage /></Suspense>
                </PublicRoute>
              )}
            />
          )}
          <Route path="/how-it-works" element={<PublicRoute allowAdmin><HowHomeTruthWorks /></PublicRoute>} />
          <Route
            path="/pro-features"
            element={
              <PublicRoute allowAdmin>
                <ProFeature />
              </PublicRoute>
            }
          />
          <Route
            path="/about"
            element={
              <PublicRoute allowAdmin>
                <AboutUs />
              </PublicRoute>
            }
          />
          <Route
            path="/terms-of-service"
            element={
              <PublicRoute allowAdmin>
                <TermsOfService />
              </PublicRoute>
            }
          />
          <Route
            path="/faq"
            element={<FAQ />}
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/privacy-policy" element={<PublicRoute allowAdmin><PrivacyPolicyPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/chat" element={<PublicRoute><GuestChat /></PublicRoute>} />
          <Route path="/coming-soon" element={<PublicRoute><ComingSoon /></PublicRoute>} />
          <Route path="/pricing" element={<PublicRoute allowAdmin><Pricing /></PublicRoute>} />
          <Route path="/home-truths" element={<HomeTruths />} />
          <Route path="/home-truths/:slug" element={<ArticleDetail />} />
          <Route path="/partner/:inviteCode" element={<PartnerOnboarding />} />
          {isVisualReviewMode && <Route path="/visual-review" element={<VisualReviewHarness />} />}
          {isVisualReviewMode && <Route path="/visual-review/:role" element={<VisualReviewHarness />} />}

          {/* Protected Routes with Shared Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<CustomerHome><Dashboard /></CustomerHome>} />
            {controlCentreEnabled() && <Route path="control-centre" element={<Suspense fallback={null}><ControlCentre /></Suspense>} />}
            <Route path="welcome" element={<WelcomePage />} />
            <Route path="ask-ai" element={<AskAI />} />
            <Route path="documents" element={<Documents />} />
            <Route path="property-profile" element={<PropertyProfile />} />
            {localManualAskEnabled && <Route path="appliances" element={<Suspense fallback={null}><LocalApplianceWorkspace /></Suspense>} />}
            <Route path="operations" element={<Navigate to={controlCentreEnabled() ? "/control-centre" : "/dashboard"} replace />} />
            <Route path="home" element={<CustomerHome><Home /></CustomerHome>} />
            <Route path="quiz" element={<QuizPage />} />
            {/* <Route path="budget" element={<BudgetRedirect />} /> */}
            {/* <Route path="budget-calculator" element={<BudgetCalculator />} /> */}
            {/* <Route path="budget-history" element={<BudgetHistory />} /> */}
            {/* <Route path="budget-history/:id" element={<BudgetDetail />} /> */}
            <Route path="complete-profile" element={<CompleteProfile />} />
            <Route path="saved-notes" element={<SavedNotes />} />
            <Route path="tools" element={<Tools />} />
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
            <Route path="/partner-programmes" element={<PartnerProgrammeWorkspace />} />
          </Route>

        </Routes>
      </BrowserRouter >
    </AuthProvider >
  );
}

export default App;
