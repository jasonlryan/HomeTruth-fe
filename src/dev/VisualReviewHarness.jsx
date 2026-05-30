import { useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ShieldCheck, UserRound, Wrench } from "lucide-react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const VISUAL_REVIEW_TOKEN = "visual-review-token";

const userRoutes = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Documents", path: "/documents" },
  { label: "Property Profile", path: "/property-profile" },
  { label: "Ask HomeTruth", path: "/ask-ai" },
  { label: "Quiz", path: "/quiz" },
  { label: "Account", path: "/settings/account" },
  { label: "Preferences", path: "/settings/preferences" },
  { label: "Notifications", path: "/settings/notifications" },
  { label: "Data Privacy", path: "/settings/data-privacy" },
  { label: "Bookmarks", path: "/bookmarked" },
];

const adminRoutes = [
  { label: "Admin Dashboard", path: "/admin/dashboard" },
  { label: "Articles", path: "/admin/articles" },
  { label: "Knowledge Base", path: "/admin/knowledge-base" },
  { label: "Data Access", path: "/admin/data-access" },
];

const visualDocuments = [
  {
    id: "visual-doc-1",
    name: "Mortgage offer review.pdf",
    title: "Mortgage offer review",
    doc_type: "Mortgage",
    category: "Finance",
    status: "ready",
    created_at: "2026-05-12T09:30:00Z",
  },
  {
    id: "visual-doc-2",
    name: "Leasehold information pack.docx",
    title: "Leasehold information pack",
    doc_type: "Leasehold",
    category: "Legal",
    status: "processing",
    created_at: "2026-05-18T14:20:00Z",
  },
  {
    id: "visual-doc-3",
    name: "Survey summary.pdf",
    title: "Survey summary",
    doc_type: "Survey",
    category: "Condition",
    status: "ready",
    created_at: "2026-05-21T11:00:00Z",
  },
];

const visualSavedItems = [
  {
    id: "saved-1",
    type: "note",
    title: "Stamp duty planning",
    content: "Check second-home surcharge before exchange.",
    createdAt: "2026-05-14T10:00:00Z",
  },
  {
    id: "saved-2",
    type: "budget",
    name: "North London budget",
    summary: "Monthly payment scenario for a 20% deposit.",
    createdAt: "2026-05-19T16:30:00Z",
  },
];

const visualPropertyRecords = [
  {
    property: {
      id: 42,
      uprn: null,
      propertyType: "house",
      tenure: "freehold",
      lifecycleStatus: "active",
      sourceType: "manual",
      sourceRef: null,
      createdByUserId: "visual-user",
      createdAt: "2026-05-30T09:00:00Z",
      updatedAt: "2026-05-30T09:00:00Z",
    },
    currentAddress: {
      id: 77,
      propertyId: 42,
      isCurrent: true,
      addressLine1: "24 Chestnut Road",
      addressLine2: null,
      townCity: "Guildford",
      county: "Surrey",
      postcode: "GU1 1AA",
      country: "GB",
      sourceType: "manual",
      confidence: null,
      validFrom: null,
      validTo: null,
      createdAt: "2026-05-30T09:00:00Z",
      updatedAt: "2026-05-30T09:00:00Z",
    },
    relationship: {
      id: 88,
      propertyId: 42,
      userId: "visual-user",
      relationshipType: "owner",
      relationshipStatus: "active",
      permissionLevel: "admin",
      isPrimary: true,
      verificationStatus: "user_confirmed",
    },
    linkedDocumentCount: 2,
    linkedDocuments: [],
    currentFacts: [
      {
        id: 1001,
        factKey: "maintenance.next_service_due",
        displayValue: "Boiler service due on 15 July 2026",
      },
      {
        id: 1002,
        factKey: "risk.known_issue",
        displayValue: "Small damp patch in rear bedroom",
      },
    ],
    currentFactsByNamespace: {},
  },
];

const visualPropertyTasks = [
  {
    id: 501,
    propertyId: 42,
    assignedUserId: "visual-user",
    taskType: "service_due",
    title: "Review upcoming service",
    description: "Boiler service due on 15 July 2026 indicates a service date to review.",
    recommendedAction: "Check whether the service is booked, complete or no longer relevant.",
    priority: "high",
    status: "open",
    sourceType: "property_fact",
    sourceModel: "PropertyFact",
    sourceId: 1001,
    dueDate: "2026-07-15",
  },
  {
    id: 502,
    propertyId: 42,
    assignedUserId: "visual-user",
    taskType: "known_issue_follow_up",
    title: "Follow up a known issue",
    description: "Small damp patch in rear bedroom is recorded as a known issue for this home.",
    recommendedAction: "Review the issue and add an update, repair evidence or mark it no longer relevant.",
    priority: "high",
    status: "open",
    sourceType: "property_fact",
    sourceModel: "PropertyFact",
    sourceId: 1002,
    dueDate: null,
  },
];

const quizAnswers = [
  {
    id: 1,
    question_text: "What stage are you at?",
    type: "single_choice",
    options: [
      { id: 11, text: "Researching" },
      { id: 12, text: "Viewing properties" },
      { id: 13, text: "Offer accepted" },
    ],
    user_answer: [{ is_answered: true, option_id: 12, option_text: "Viewing properties" }],
  },
  {
    id: 2,
    question_text: "What matters most?",
    type: "multiple_choice",
    options: [
      { id: 21, text: "Affordability" },
      { id: 22, text: "Schools" },
      { id: 23, text: "Commute" },
    ],
    user_answer: [
      { is_answered: true, option_id: 21, option_text: "Affordability" },
      { is_answered: true, option_id: 23, option_text: "Commute" },
    ],
  },
  {
    id: 5,
    question_text: "How do you like guidance presented?",
    type: "single_choice",
    options: [
      { id: 51, text: "Visuals" },
      { id: 52, text: "Bullet summaries" },
      { id: 53, text: "Narrative guides" },
      { id: 54, text: "Interactive Q&A" },
    ],
    user_answer: [{ is_answered: true, option_id: 52, option_text: "Bullet summaries" }],
  },
];

const adminUsers = [
  {
    id: "user-1",
    first_name: "Amelia",
    last_name: "Hart",
    email: "amelia@example.com",
    plan_type: "pro",
    home_address: "Islington",
    is_verified: true,
    createdAt: "2026-05-01T10:00:00Z",
    updatedAt: "2026-05-22T09:30:00Z",
    activity_summary: { documents_uploaded: 4, ai_chat_records: 18 },
    profile_preference: {
      communication_tone: "friendly",
      communication_style: "bullet_points",
      behavior: "link_notes",
    },
    quiz_answers: quizAnswers,
  },
  {
    id: "user-2",
    first_name: "Noah",
    last_name: "Patel",
    email: "noah@example.com",
    plan_type: "free",
    home_address: "Walthamstow",
    is_verified: true,
    createdAt: "2026-05-10T12:15:00Z",
    updatedAt: "2026-05-20T17:20:00Z",
    activity_summary: { documents_uploaded: 1, ai_chat_records: 5 },
    profile_preference: null,
    quiz_answers: [],
  },
];

const adminArticles = [
  {
    id: "article-1",
    title: "What to check before exchange",
    author: "HomeTruth",
    excerpt: "A short checklist for buyers approaching exchange.",
    content: "<p>Confirm funds, enquiries, fixtures, and completion timing.</p>",
    category: "guide",
    tags: ["exchange", "checklist"],
    status: "published",
    published_at: "2026-05-15T08:00:00Z",
  },
  {
    id: "article-2",
    title: "Understanding survey risk",
    author: "HomeTruth",
    excerpt: "How to read common findings without overreacting.",
    content: "<p>Separate maintenance items from structural red flags.</p>",
    category: "article",
    tags: ["survey"],
    status: "draft",
    published_at: null,
  },
];

const knowledgeDocuments = [
  {
    id: "kb-1",
    document_id: "kb-1",
    title: "Buying process glossary",
    category: "General",
    source: "HomeTruth editorial",
    tags: ["glossary", "buyer"],
    chunks_count: 18,
    status: "ready",
    file_type: "markdown",
    created_at: "2026-05-08T09:00:00Z",
  },
  {
    id: "kb-2",
    document_id: "kb-2",
    title: "Leasehold risk guide",
    category: "Leasehold",
    source: "Knowledge upload",
    tags: ["leasehold", "risk"],
    chunks_count: 24,
    status: "ready",
    file_type: "pdf",
    created_at: "2026-05-16T13:30:00Z",
  },
];

const toAxiosResponse = (config, data, status = 200) =>
  Promise.resolve({
    config,
    data,
    headers: {},
    request: {},
    status,
    statusText: status === 200 ? "OK" : "Error",
  });

const parsePayload = (payload) => {
  if (!payload || typeof payload !== "string") return payload || {};
  try {
    return JSON.parse(payload);
  } catch {
    return {};
  }
};

function installVisualReviewApiMock() {
  if (window.__HT_VISUAL_REVIEW_API_MOCK__) return;

  api.defaults.adapter = async (config) => {
    const method = (config.method || "get").toLowerCase();
    const url = new URL(config.url || "", window.location.origin);
    const path = url.pathname;
    const data = parsePayload(config.data);

    if (method === "get" && path === "/api/user-documents") {
      return toAxiosResponse(config, {
        success: true,
        data: { documents: visualDocuments, pagination: { page: 1, total: visualDocuments.length } },
        total: visualDocuments.length,
        count: visualDocuments.length,
      });
    }

    if (method === "get" && path === "/api/property-records") {
      return toAxiosResponse(config, { success: true, data: visualPropertyRecords });
    }

    if (method === "post" && path.match(/^\/api\/property-records\/\d+\/tasks\/generate$/)) {
      return toAxiosResponse(
        config,
        {
          success: true,
          data: {
            createdCount: 0,
            updatedCount: 0,
            proposalCount: visualPropertyTasks.length,
            tasks: visualPropertyTasks,
          },
        },
        201
      );
    }

    if (method === "get" && path.match(/^\/api\/property-records\/\d+\/tasks$/)) {
      return toAxiosResponse(config, { success: true, data: visualPropertyTasks });
    }

    if (method === "patch" && path.match(/^\/api\/property-records\/\d+\/tasks\/\d+$/)) {
      const taskId = Number(path.split("/").pop());
      const task = visualPropertyTasks.find((item) => item.id === taskId);
      return toAxiosResponse(config, {
        success: true,
        data: {
          ...task,
          status: data.status || "completed",
          statusUpdatedAt: "2026-05-30T10:30:00Z",
        },
      });
    }

    if (method === "get" && path.includes("/api/user-documents/") && path.endsWith("/preview")) {
      return toAxiosResponse(config, {
        success: true,
        data: {
          preview_content:
            "Visual review preview content for the selected HomeTruth document. This confirms modal, typography, and surface states render while authenticated.",
        },
      });
    }

    if (method === "get" && path.includes("/api/user-documents/") && path.endsWith("/chats")) {
      return toAxiosResponse(config, { success: true, data: { chats: [], pagination: { total: 0 } } });
    }

    if (method === "get" && path === "/api/saved-notes/all-saved-items") {
      return toAxiosResponse(config, {
        success: true,
        data: { items: visualSavedItems, pagination: { page: 1, total: visualSavedItems.length } },
      });
    }

    if (method === "get" && path === "/api/saved-notes") {
      return toAxiosResponse(config, { success: true, data: { notes: [] } });
    }

    if (method === "get" && path === "/api/profile-preferences") {
      return toAxiosResponse(config, {
        success: true,
        data: {
          communication_tone: "friendly",
          communication_style: "narrative_summary",
          behavior: "link_notes",
          use_profile_personalization: true,
        },
      });
    }

    if (method === "post" && path === "/api/profile-preferences/") {
      return toAxiosResponse(config, { success: true, data });
    }

    if (method === "get" && path === "/api/notification-settings") {
      return toAxiosResponse(config, {
        success: true,
        data: {
          documentAnalysisComplete: true,
          chatSummaryFollowUps: true,
          newAiInsightsAvailable: true,
          propertyAlerts: true,
          extensionSaveConfirmations: false,
          tipsAndProductUpdates: false,
        },
      });
    }

    if (method === "put" && path === "/api/notification-settings") {
      return toAxiosResponse(config, { success: true, data });
    }

    if (method === "get" && path === "/api/privacy-settings/") {
      return toAxiosResponse(config, {
        success: true,
        data: {
          id: "privacy-visual",
          enableBehaviorBasedPersonalization: true,
          useChatHistoryToRefineInsights: false,
          gdprDataCollectionConsent: true,
          allowAnonymousUsageAnalytics: false,
          disableDocumentRetention: true,
        },
      });
    }

    if (method === "put" && path === "/api/privacy-settings/") {
      return toAxiosResponse(config, { success: true, data });
    }

    if (method === "post" && path === "/api/privacy-settings/reset") {
      return toAxiosResponse(config, {
        success: true,
        data: {
          enableBehaviorBasedPersonalization: true,
          useChatHistoryToRefineInsights: false,
          gdprDataCollectionConsent: true,
          allowAnonymousUsageAnalytics: false,
          disableDocumentRetention: true,
        },
      });
    }

    if (method === "get" && path === "/api/properties/bookmark") {
      return toAxiosResponse(config, {
        bookmarks: [
          {
            id: "bookmark-1",
            property_details: {
              title: "Victorian terrace near the station",
              location: "Walthamstow, London",
              bedrooms: 3,
              bathrooms: 1,
              price: 725000,
            },
          },
          {
            id: "bookmark-2",
            property_details: {
              title: "Two-bed flat with balcony",
              location: "Islington, London",
              bedrooms: 2,
              bathrooms: 2,
              price: 610000,
            },
          },
        ],
      });
    }

    if (method === "get" && path === "/api/quiz/") {
      return toAxiosResponse(config, { success: true, data: quizAnswers });
    }

    if (method === "get" && path === "/api/quiz/withAnswer") {
      return toAxiosResponse(config, { success: true, data: quizAnswers });
    }

    if (method === "put" && path === "/api/quiz-answers/update-All") {
      return toAxiosResponse(config, { success: true, data: data.answers || [] });
    }

    if (method === "get" && path === "/api/ai_chat/conversations") {
      return toAxiosResponse(config, {
        success: true,
        data: {
          conversations: [
            {
              conversation_id: "visual-chat-1",
              preview: "What should I check in the survey?",
              lastMessageAt: "2026-05-21T12:00:00Z",
              messageCount: 2,
              remainingQuestions: 20,
              is_saved: false,
              messages: [],
            },
          ],
        },
      });
    }

    if (method === "get" && path === "/api/ai_chat/history") {
      const conversationId = url.searchParams.get("conversation_id") || "visual-chat-1";
      return toAxiosResponse(config, {
        success: true,
        data: {
          conversations: {
            [conversationId]: {
              messages: [
                {
                  id: "chat-1",
                  userMessage: "What should I check in the survey?",
                  assistantReply:
                    "Focus on structural movement, damp, roof condition, electrics, and any items your solicitor should raise before exchange.",
                  createdAt: "2026-05-21T12:00:00Z",
                },
              ],
            },
          },
        },
      });
    }

    if (method === "post" && path === "/api/ai_chat/chat") {
      return toAxiosResponse(config, {
        success: true,
        data: {
          conversation_id: data.conversation_id || "visual-chat-1",
          chat_history_id: "visual-chat-history-1",
          reply:
            "For visual review, this mocked answer shows markdown, spacing, save affordances, and the message layout without contacting the backend.",
          remainingQuestions: 19,
        },
      });
    }

    if (method === "get" && path === "/api/admin/dashboard/kpis") {
      return toAxiosResponse(config, {
        success: true,
        data: {
          totalUsers: 248,
          freeUsers: 197,
          proUsers: 51,
          proUserRate: 20.6,
          quizCompletedCount: 156,
          totalQuizUsers: 181,
          documentsUploaded: 432,
          documentAIChats: 98,
          aiChatRecords: 1240,
          waitlistSignups: 74,
          trends: { totalUsers: 8, documentsUploaded: 12, aiChatRecords: 17, waitlistSignups: 4 },
        },
      });
    }

    if (method === "get" && path.startsWith("/api/admin/dashboard/charts/")) {
      const chart = path.split("/").pop();
      if (chart === "doc-categories") {
        return toAxiosResponse(config, {
          success: true,
          data: [
            { category: "Mortgage", count: 32 },
            { category: "Survey", count: 24 },
            { category: "Legal", count: 18 },
          ],
        });
      }
      return toAxiosResponse(config, {
        success: true,
        data: [
          { date: "2026-05-01", count: 8 },
          { date: "2026-05-08", count: 14 },
          { date: "2026-05-15", count: 21 },
          { date: "2026-05-22", count: 17 },
        ],
      });
    }

    if (method === "get" && path.startsWith("/api/admin/dashboard/recent/")) {
      const table = path.split("/").pop();
      if (table === "signups") return toAxiosResponse(config, { success: true, data: adminUsers });
      if (table === "uploads") {
        return toAxiosResponse(config, {
          success: true,
          data: visualDocuments.map((doc) => ({ ...doc, user: { email: "amelia@example.com" } })),
        });
      }
      return toAxiosResponse(config, {
        success: true,
        data: [
          {
            id: "activity-1",
            userMessage: "Can I renegotiate after a survey?",
            user: { email: "amelia@example.com" },
            createdAt: "2026-05-22T16:45:00Z",
          },
        ],
      });
    }

    if (method === "get" && path === "/api/admin/users") {
      return toAxiosResponse(config, {
        success: true,
        data: {
          users: adminUsers,
          pagination: { page: 1, limit: 20, total: adminUsers.length, totalPages: 1 },
        },
      });
    }

    if (method === "get" && path.startsWith("/api/admin/users/")) {
      return toAxiosResponse(config, { success: true, data: adminUsers[0] });
    }

    if (method === "get" && path === "/api/documents/documents") {
      return toAxiosResponse(config, {
        success: true,
        data: { documents: knowledgeDocuments, total: knowledgeDocuments.length },
      });
    }

    if (method === "get" && path === "/api/documents/knowledge/stats") {
      return toAxiosResponse(config, {
        success: true,
        data: {
          total_records: 142,
          general_namespace: 118,
          embedding_dimension: 768,
          total_documents: knowledgeDocuments.length,
          total_chunks: 42,
          vector_store_status: "healthy",
          namespace_breakdown: [
            { namespace: "general", vector_count: 118 },
            { namespace: "leasehold", vector_count: 24 },
          ],
          updated_at_formatted: "25 May 2026, 10:00",
        },
      });
    }

    if (method === "get" && path.includes("/api/documents/documents/") && path.endsWith("/preview")) {
      return toAxiosResponse(config, {
        success: true,
        data: {
          preview_content: "Knowledge base preview content for local visual review.",
        },
      });
    }

    if (method === "get" && path === "/api/admin/articles") {
      return toAxiosResponse(config, {
        success: true,
        data: {
          articles: adminArticles,
          pagination: { page: 1, limit: 20, total: adminArticles.length, totalPages: 1 },
        },
      });
    }

    if (method === "get" && path.startsWith("/api/admin/articles/")) {
      return toAxiosResponse(config, { success: true, data: adminArticles[0] });
    }

    return toAxiosResponse(config, { success: true, data: {} });
  };

  window.__HT_VISUAL_REVIEW_API_MOCK__ = true;
}

function seedVisualSession(role, login) {
  const isAdmin = role === "admin";
  const userData = {
    id: isAdmin ? "visual-admin" : "visual-user",
    name: isAdmin ? "Visual Admin" : "Visual User",
    email: isAdmin ? "visual-admin@hometruth.local" : "visual-user@hometruth.local",
    role: isAdmin ? "admin" : "user",
  };

  localStorage.setItem("token", VISUAL_REVIEW_TOKEN);
  localStorage.setItem("user_role", userData.role);
  localStorage.setItem("userId", userData.id);
  localStorage.setItem("user_name", userData.name);
  localStorage.setItem("user_email", userData.email);
  localStorage.removeItem("new_user");
  localStorage.removeItem("require_profile");
  localStorage.removeItem("from_welcome_page");
  localStorage.removeItem("quiz_modal_active");
  localStorage.removeItem("onboarding_lock");
  localStorage.setItem("quiz_completed", "true");
  localStorage.setItem("quiz_checked_this_session", "true");
  login(VISUAL_REVIEW_TOKEN, userData);
  try {
    window.dispatchEvent(new StorageEvent("storage"));
  } catch {}
}

export default function VisualReviewHarness() {
  const { role } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const startReview = (reviewRole, targetPath) => {
    installVisualReviewApiMock();
    seedVisualSession(reviewRole, login);
    navigate(targetPath, { replace: true });
  };

  useEffect(() => {
    if (role !== "user" && role !== "admin") return;
    const targetPath =
      searchParams.get("to") || (role === "admin" ? "/admin/dashboard" : "/dashboard");
    startReview(role, targetPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot route bootstrap
  }, [role, searchParams]);

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-ht-cyan">
            <Wrench size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visual Review Harness</h1>
            <p className="text-sm text-gray-600">
              Local route enabled by REACT_APP_VISUAL_REVIEW for protected HomeTruth screens.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <UserRound className="text-ht-cyan" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">User Screens</h2>
            </div>
            <div className="grid gap-2">
              {userRoutes.map((route) => (
                <button
                  key={route.path}
                  type="button"
                  onClick={() => startReview("user", route.path)}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 transition hover:border-ht-cyan hover:bg-sky-50"
                >
                  <span>{route.label}</span>
                  <span className="text-xs text-gray-400">{route.path}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="text-ht-purple" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Admin Screens</h2>
            </div>
            <div className="grid gap-2">
              {adminRoutes.map((route) => (
                <button
                  key={route.path}
                  type="button"
                  onClick={() => startReview("admin", route.path)}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 transition hover:border-ht-purple hover:bg-purple-50"
                >
                  <span>{route.label}</span>
                  <span className="text-xs text-gray-400">{route.path}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This harness seeds local auth and mocked API responses only when the visual review
          environment flag is enabled.
        </div>

        <Link className="mt-6 inline-flex text-sm font-medium text-ht-cyan" to="/">
          Return to app
        </Link>
      </div>
    </main>
  );
}
