import { useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ShieldCheck, UserRound, Wrench } from "lucide-react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const VISUAL_REVIEW_TOKEN = "visual-review-token";

const userRoutes = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Partner invitation", path: "/partner/insurer-active" },
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
  { label: "Partner Programmes", path: "/admin/partner-programmes" },
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

const adminPartners = [
  {
    id: 1,
    name: "Northstar Mutual",
    partnerType: "insurer",
    status: "active",
    reportingMode: "aggregate_only",
  },
  {
    id: 2,
    name: "Hearthside Building Society",
    partnerType: "mortgage_provider",
    status: "active",
    reportingMode: "aggregate_only",
  },
  {
    id: 3,
    name: "Common Ground Homes",
    partnerType: "home_developer",
    status: "active",
    reportingMode: "aggregate_only",
  },
];

const adminPartnerProgrammes = [
  {
    id: 41,
    programmeKey: "home-ready-2026",
    name: "Home Ready",
    status: "active",
    ownerUserId: "visual-admin",
    startDate: "2026-09-01",
    endDate: "2027-08-31",
    entitlement: { pack: "shared_core", participantLimit: 500 },
    inviteMode: "both",
    approvedContentRefs: ["copy/homeowner-promise-v1"],
    partner: adminPartners[0],
    campaigns: [
      {
        id: 51,
        campaignKey: "autumn-prevention",
        name: "Autumn prevention invitation",
        status: "active",
        inviteRoute: "/partner/autumn-2026",
      },
    ],
    cohorts: [
      {
        id: 61,
        cohortKey: "autumn-2026",
        name: "Autumn homeowner cohort",
        status: "active",
        targetSize: 500,
        reportingLevel: "aggregate_only",
      },
    ],
  },
  {
    id: 42,
    programmeKey: "completion-companion",
    name: "Completion Companion",
    status: "draft",
    ownerUserId: "visual-admin",
    startDate: "2026-10-01",
    endDate: "2027-09-30",
    entitlement: { pack: "shared_core", participantLimit: 250 },
    inviteMode: "cohort_code",
    approvedContentRefs: ["copy/completion-promise-v1"],
    partner: adminPartners[1],
    campaigns: [
      {
        id: 52,
        campaignKey: "completion-q4",
        name: "Q4 completion invitation",
        status: "draft",
        inviteRoute: "/partner/completion-q4",
      },
    ],
    cohorts: [
      {
        id: 62,
        cohortKey: "completion-q4",
        name: "Q4 completion cohort",
        status: "planned",
        targetSize: 250,
        reportingLevel: "aggregate_only",
      },
    ],
  },
  {
    id: 43,
    programmeKey: "handover-support",
    name: "Handover Support",
    status: "paused",
    ownerUserId: "visual-admin",
    entitlement: { pack: "shared_core", participantLimit: 120 },
    inviteMode: "individual_invite",
    approvedContentRefs: ["copy/handover-promise-v1"],
    partner: adminPartners[2],
    campaigns: [
      {
        id: 53,
        campaignKey: "phase-one-handover",
        name: "Phase one handover",
        status: "paused",
      },
    ],
    cohorts: [
      {
        id: 63,
        cohortKey: "phase-one-owners",
        name: "Phase one homeowners",
        status: "paused",
        targetSize: 120,
        reportingLevel: "aggregate_only",
      },
    ],
  },
];

const visualConsentScopes = [
  {
    scope: "hometruth_processing",
    required: true,
    label: "Use HomeTruth for your home",
    summary:
      "Allows HomeTruth to create and manage the property record, documents and actions you choose to add.",
    textHash: "1".repeat(64),
  },
  {
    scope: "aggregate_analytics",
    required: false,
    label: "Include my use in aggregate programme analytics",
    summary:
      "Allows de-identified activity to contribute to grouped programme measures. No individual property record is shown to the partner.",
    textHash: "2".repeat(64),
  },
  {
    scope: "partner_reporting",
    required: false,
    label: "Include my progress in aggregate partner reporting",
    summary:
      "Allows HomeTruth to include your activity in thresholded programme totals shared with the sponsoring partner.",
    textHash: "3".repeat(64),
  },
  {
    scope: "partner_contact_servicing",
    required: false,
    label: "Allow programme follow-up from the partner",
    summary:
      "Allows the sponsoring partner to contact you about this programme. It does not grant access to your HomeTruth records.",
    textHash: "4".repeat(64),
  },
];

const visualPartnerInvites = {
  "insurer-active": {
    partnerName: "Northstar Mutual",
    partnerType: "insurer",
    programmeName: "Home Ready",
    campaignName: "Autumn prevention invitation",
    cohortName: "Autumn homeowner cohort",
    headline: "Make the important details of your home easier to manage",
  },
  "mortgage-active": {
    partnerName: "Hearthside Building Society",
    partnerType: "mortgage_provider",
    programmeName: "Completion Companion",
    campaignName: "Completion support",
    cohortName: "New homeowner cohort",
    headline: "Start a useful home record as you complete your move",
  },
  "developer-active": {
    partnerName: "Common Ground Homes",
    partnerType: "home_developer",
    programmeName: "Handover Support",
    campaignName: "New home handover",
    cohortName: "Phase one homeowners",
    headline: "Keep your new-home information and next steps together",
  },
  "other-active": {
    partnerName: "SurveySafe Services",
    partnerType: "other",
    programmeName: "Home Record Starter",
    campaignName: "Survey follow-up",
    cohortName: "Homeowner support cohort",
    headline: "Turn important home information into practical next steps",
  },
};

const buildVisualPartnerInvite = (code, options = {}) => {
  const statusByCode = {
    expired: "expired",
    paused: "ineligible",
    closed: "ineligible",
  };
  const configured = visualPartnerInvites[code];
  const status = configured ? "valid" : statusByCode[code] || "invalid";
  const details = configured || visualPartnerInvites["insurer-active"];
  const safeMessage =
    {
      expired: "This invite has expired.",
      paused: "This partner programme is currently paused.",
      closed: "This partner programme is closed.",
    }[code] ||
    (status === "valid" ? "Invite is valid." : "Invite code was not recognised.");
  const acquisition = {
    eyebrow: "A HomeTruth partner programme",
    headline: details.headline,
    homeownerPromise:
      "Build a useful record of your home, understand important documents and keep practical actions in one place.",
    setupExpectations: [
      "Create or sign in to your HomeTruth account",
      "Choose the programme permissions you want to grant",
      "Connect an existing property or start a new home record",
    ],
    privacySummary:
      "Your HomeTruth record stays under your control. The partner receives no individual property, document or task data through this journey.",
    support: { label: "Get help from HomeTruth", url: "/faq" },
    partnerLogo: null,
    partnerName: details.partnerName,
    partnerType: details.partnerType,
    programmeName: details.programmeName,
    campaignName: details.campaignName,
    cohortName: details.cohortName,
    productName: "HomeTruth",
  };
  const consentContract = {
    version: "partner-acquisition-v1",
    scopes: visualConsentScopes,
  };

  if (status === "invalid") {
    return {
      invite: { code, mode: "unknown", status, message: safeMessage },
      partner: null,
      programme: null,
      campaign: null,
      cohort: null,
      member: null,
      acquisition: { ...acquisition, partnerName: null, partnerType: null },
      consentContract,
    };
  }

  return {
    invite: {
      code,
      mode: code === "mortgage-active" ? "individual_invite" : "cohort_code",
      status,
      message: safeMessage,
    },
    partner: {
      id: 1,
      name: details.partnerName,
      partnerType: details.partnerType,
      reportingMode: "aggregate_only",
    },
    programme: {
      id: 41,
      programmeKey: `${details.partnerType}-programme`,
      name: details.programmeName,
      status: status === "valid" ? "active" : code,
    },
    campaign: {
      id: 51,
      campaignKey: `${details.partnerType}-campaign`,
      name: details.campaignName,
      status: status === "valid" ? "active" : code,
    },
    cohort: {
      id: 61,
      cohortKey: code,
      name: details.cohortName,
      status: status === "valid" ? "active" : code,
      reportingLevel: "aggregate_only",
    },
    member: options.authenticated
      ? { id: 71, membershipStatus: "onboarded", propertyId: null }
      : null,
    acquisition: { ...acquisition, consentContract },
    branding: acquisition,
    consentContract,
    requiredConsentScopes: ["hometruth_processing"],
    optionalConsentScopes: [
      "aggregate_analytics",
      "partner_reporting",
      "partner_contact_servicing",
    ],
    ...(options.authenticated
      ? {
          consentState: {
            version: consentContract.version,
            completed: Boolean(options.consentComplete),
            choices: options.choices || {},
          },
        }
      : {}),
  };
};

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

    const inviteMatch = path.match(
      /^\/api\/partner-onboarding\/invites\/([^/]+)$/
    );
    if (method === "get" && inviteMatch) {
      return toAxiosResponse(config, {
        success: true,
        data: buildVisualPartnerInvite(decodeURIComponent(inviteMatch[1])),
      });
    }

    if (
      method === "post" &&
      path.match(/^\/api\/partner-onboarding\/invites\/[^/]+\/view$/)
    ) {
      return toAxiosResponse(
        config,
        { success: true, data: { recorded: true } },
        202
      );
    }

    if (method === "post" && path === "/api/partner-onboarding/claim") {
      return toAxiosResponse(config, {
        success: true,
        data: buildVisualPartnerInvite(data.inviteCode, { authenticated: true }),
      });
    }

    if (method === "post" && path === "/api/partner-onboarding/consents") {
      const choices = Object.fromEntries(
        (data.consents || []).map(({ scope, granted }) => [
          scope,
          Boolean(granted),
        ])
      );
      return toAxiosResponse(config, {
        success: true,
        data: {
          ...buildVisualPartnerInvite(data.inviteCode, {
            authenticated: true,
            consentComplete: true,
            choices,
          }),
          consents: visualConsentScopes.map(({ scope }, index) => ({
            id: index + 1,
            consentScope: scope,
            consentVersion: "partner-acquisition-v1",
            status: choices[scope] ? "granted" : "withdrawn",
          })),
        },
      });
    }

    if (method === "post" && path === "/api/partner-onboarding/property") {
      const invite = buildVisualPartnerInvite(data.inviteCode, {
        authenticated: true,
        consentComplete: true,
      });
      return toAxiosResponse(config, {
        success: true,
        data: {
          ...invite,
          member: { ...invite.member, propertyId: data.propertyId },
        },
      });
    }

    if (method === "post" && path === "/api/partner-onboarding/events") {
      return toAxiosResponse(config, {
        success: true,
        data: {
          eventName: data.eventName,
          metadata: { path: data.metadata?.path },
        },
      });
    }

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

    if (method === "get" && path === "/api/admin/pilot/cohort-report") {
      return toAxiosResponse(config, {
        success: true,
        data: {
          period: url.searchParams.get("period") || "30d",
          generatedAt: "2026-05-30T12:00:00Z",
          privacyBoundary:
            "Cohort aggregate metrics only. No user, member, property, document or raw fact rows are returned.",
          reports: [
            {
              cohort: {
                id: 1,
                name: "Zurich Home Pilot",
                cohortKey: "zurich-2026",
                status: "active",
                targetSize: 500,
                startDate: "2026-06-01",
                endDate: "2026-08-31",
              },
              partner: {
                id: 1,
                name: "Zurich UK",
                partnerType: "insurer",
                reportingMode: "aggregate_only",
              },
              metrics: {
                targetSize: 500,
                invitedMembers: 126,
                onboardedMembers: 84,
                activeMembers: 71,
                propertiesLinked: 68,
                aggregateConsentGranted: 82,
                totalEvents: 402,
                inviteViewed: 118,
                signupCompleted: 84,
                consentRecorded: 82,
                propertySetupCompleted: 68,
                documentLinked: 41,
                factCreated: 93,
                tasksGenerated: 156,
                taskCompleted: 44,
                taskDismissed: 11,
                taskNotRelevant: 7,
                feedbackSubmitted: 12,
                averageFeedbackRating: 4.2,
                activationRate: 54,
                consentRate: 65,
                taskCompletionRate: 71,
              },
              dropOff: {
                inviteToSignup: 34,
                signupToConsent: 2,
                consentToProperty: 14,
                propertyToDocument: 27,
              },
              readiness: {
                recommendation: "no_go",
                blockers: [
                  "Data deletion and withdrawal path",
                  "Incident and support escalation",
                ],
                items: [
                  {
                    key: "event_pipeline",
                    label: "Pilot event pipeline",
                    status: "ready",
                    note: "Durable pilot events are being recorded.",
                  },
                  {
                    key: "consent_boundary",
                    label: "Consent-bound aggregate reporting",
                    status: "ready",
                    note: "Report returns cohort aggregates only; no personal rows are exposed.",
                  },
                  {
                    key: "onboarding_monitoring",
                    label: "Failed onboarding monitoring",
                    status: "ready",
                    note: "Invite activity is visible in aggregate.",
                  },
                  {
                    key: "data_deletion",
                    label: "Data deletion and withdrawal path",
                    status: "blocked",
                    note: "Operational owner and withdrawal runbook still need confirmation.",
                  },
                  {
                    key: "incident_response",
                    label: "Incident and support escalation",
                    status: "blocked",
                    note: "Support owner and escalation contact must be assigned before launch.",
                  },
                  {
                    key: "notification_scope",
                    label: "Notification scope",
                    status: "ready",
                    note: "External push notifications are excluded from the V1 pilot.",
                  },
                ],
              },
            },
          ],
        },
      });
    }

    if (method === "get" && path === "/api/admin/partner-programmes/partners") {
      return toAxiosResponse(config, { success: true, data: adminPartners });
    }

    if (method === "get" && path === "/api/admin/partner-programmes/programmes") {
      return toAxiosResponse(config, { success: true, data: adminPartnerProgrammes });
    }

    if (method === "post" && path === "/api/admin/partner-programmes/programmes") {
      const partner = data.partnerId
        ? adminPartners.find((item) => item.id === data.partnerId)
        : {
            id: adminPartners.length + 1,
            name: data.partner?.name,
            partnerType: data.partner?.partnerType || "other",
            status: "active",
            reportingMode: "aggregate_only",
          };
      if (!data.partnerId) adminPartners.push(partner);
      const programme = {
        id: Math.max(...adminPartnerProgrammes.map((item) => item.id)) + 1,
        programmeKey: data.programmeKey,
        name: data.name,
        status: "draft",
        ownerUserId: "visual-admin",
        startDate: data.startDate,
        endDate: data.endDate,
        entitlement: data.entitlement || {},
        inviteMode: data.inviteMode,
        approvedContentRefs: data.approvedContentRefs || [],
        partner,
        campaigns: [{ id: 70, ...data.campaign, status: "draft" }],
        cohorts: [{ id: 80, ...data.cohort, status: "planned", reportingLevel: "aggregate_only" }],
      };
      adminPartnerProgrammes.unshift(programme);
      return toAxiosResponse(config, { success: true, data: programme }, 201);
    }

    if (
      method === "post" &&
      path.match(/^\/api\/admin\/partner-programmes\/programmes\/\d+\/transitions$/)
    ) {
      const programmeId = Number(path.split("/").at(-2));
      const programme = adminPartnerProgrammes.find((item) => item.id === programmeId);
      const childStatus = data.status === "active" ? "active" : data.status;
      programme.status = data.status;
      programme.campaigns = programme.campaigns.map((item) => ({ ...item, status: childStatus }));
      programme.cohorts = programme.cohorts.map((item) => ({ ...item, status: childStatus }));
      return toAxiosResponse(config, { success: true, data: programme });
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

function seedVisualSession(role, login, logout) {
  if (role === "guest") {
    logout();
    localStorage.removeItem("partner_invite_code");
    localStorage.removeItem("partner_onboarding_context");
    return;
  }

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
  const { login, logout } = useAuth();

  const startReview = (reviewRole, targetPath) => {
    installVisualReviewApiMock();
    seedVisualSession(reviewRole, login, logout);
    navigate(targetPath, { replace: true });
  };

  useEffect(() => {
    if (role !== "user" && role !== "admin" && role !== "guest") return;
    const targetPath =
      searchParams.get("to") ||
      (role === "admin"
        ? "/admin/dashboard"
        : role === "guest"
          ? "/partner/insurer-active"
          : "/dashboard");
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
