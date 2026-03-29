import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = token;
    }
    // Add ngrok-skip-browser-warning header for ngrok URLs
    if (API_BASE_URL && API_BASE_URL.includes("ngrok")) {
      config.headers["ngrok-skip-browser-warning"] = "true";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- AUTH APIs ---
export const loginUser = async ({ email, password }) => {
  const res = await api.post("/api/auth/login", { email, password });

  const token = res.data?.data?.token;
  const userId = res.data?.data?.user?.id;

  if (token) {
    localStorage.setItem("token", token);
  } else {
    console.warn("Token not found in response", res.data);
  }

  if (userId) {
    localStorage.setItem("userId", userId);
  } else {
    console.warn("User ID not found in response", res.data);
  }

  return res.data;
};

export const registerUser = async ({ email, password, confirmPassword, first_name, last_name, home_address }) => {
  // Prepare the payload with only the provided fields
  const payload = {
    email,
    password,
    first_name,
    last_name,
    confirmPassword,
  };

  // Only include home_address if it's provided
  if (home_address !== undefined && home_address !== null && home_address.trim() !== '') {
    payload.home_address = home_address.trim();
  }

  const res = await api.post("/api/auth/register", payload);
  return res.data;
};

// --- Admin Login API ---
export const adminLogin = async ({ email, password, remember_me = false }) => {
  const res = await api.post("/api/auth/admin/login", { 
    email, 
    password, 
    remember_me 
  });

  const token = res.data?.data?.token;
  const userId = res.data?.data?.user?.id;
  const userRole = res.data?.data?.user?.role;

  if (token) {
    localStorage.setItem("token", token);
  } else {
    console.warn("Token not found in response", res.data);
  }

  if (userId) {
    localStorage.setItem("userId", userId);
  } else {
    console.warn("User ID not found in response", res.data);
  }

  if (userRole) {
    localStorage.setItem("user_role", userRole);
  }

  return res.data;
};

// --- Budget Calculator APIs ---
// export const calculateBudget = async ({ income, debt, deposit, interest_rate, loan_term }) => {
//   const res = await api.post("/api/budget-calculation", {
//     income,
//     debt,
//     deposit,
//     interest_rate,
//     loan_term,
//   });

//   return res.data;
// };

// export const saveBudgetCalculation = async (payload) => {
//   const res = await api.post("/api/budget-calculation", payload);
//   return res.data;
// };

// export const getUserBudgets = async () => {
//   let userId = localStorage.getItem("userId");

//   if (!userId) {
//     console.warn("No userId in localStorage – attempting to recover via /auth/me");
//     try {
//       const userRes = await getCurrentUser();
//       userId = userRes?.user?.id;
//       if (userId) {
//         localStorage.setItem("userId", userId);
//       } else {
//         console.error("❌ Unable to recover user ID from /auth/me");
//         return [];
//       }
//     } catch (err) {
//       console.error("Failed to recover user from token", err);
//       return [];
//     }
//   }

//   const res = await api.get(`/api/budget-calculation/user/${userId}`);
//   return res.data;
// };

// ✅ NEW: Fetch a single budget by its ID
// export const getBudgetById = async (id) => {
//   const res = await api.get(`/api/budget-calculation/${id}`);
//   return res.data;
// };

export const askPropertySearch = async (message) => {
  const res = await api.post("/api/properties", { message });
  return res.data;
};


export const startAIBudgetChat = async () => {
  const res = await api.post("/api/budget-calculation/start-ai-chat");
  return res.data?.data;
};

export const continueAIBudgetChat = async (message, budgetCalculationId) => {
  const res = await api.post("/api/budget-calculation/continue-ai-chat", {
    userMessage: message,
    budgetCalculationId,
  });
  return res.data?.data;
};

export const updateBudgetCalculationName = async (budgetCalculationId, name) => {
  const res = await api.patch(`/api/budget-calculation/${budgetCalculationId}/name`, {
    name,
  });
  return res.data;
};

export const getBudgetConversationStatus = async (budgetCalculationId) => {
  const res = await api.get(`/api/budget-calculation/status/${budgetCalculationId}`);
  return res.data?.data;
};

export const getSavedBudgets = async () => {
  const res = await api.get("/api/budget-calculation/allSaved");
  return res.data;
};


export const getEstimate = async (budgetCalculationId) => {
  const res = await api.post(`/api/budget-calculation/generate-estimate/${budgetCalculationId}`);
  return res.data?.data;
};


export const markBudgetCalculationAsSaved = async (budgetCalculationId, name) => {
  const res = await api.patch(`/api/budget-calculation/${budgetCalculationId}/save/${name}`);
  return res.data?.data;
};

export const getSavedCalculationCount = async () => {
  try {
    const res = await api.get("/api/budget-calculation/allSaved");
    const saved = res.data;

    if (Array.isArray(saved)) {
      return saved.length;
    }

    if (Array.isArray(saved?.data)) {
      return saved.data.length;
    }
    if (Array.isArray(saved?.savedCalculations)) {
      return saved.savedCalculations.length;
    }

    return 0;
  } catch (err) {
    console.error("❌ Failed to fetch saved calculations:", err);
    return 0;
  }
};


export const updateBudgetCalculationAll = async (budgetCalculationId, payload) => {
  const res = await api.put(`/api/budget-calculation/update-all/${budgetCalculationId}`, payload);
  return res.data;
};

// --- Quiz APIs ---
export const getQuizQuestions = async () => {
  const res = await api.get("/api/quiz/");
  return res.data;
};

export const getQuizAnswers = async () => {
  const res = await api.get("/api/quiz/withAnswer");
  return res.data;
};

export const updateAllQuizAnswers = async (answers) => {
  const payload = {
    answers: answers.map(({ question, value }) => {
      const entry = { question_id: question.id };

      if (question.type === "multiple_choice" || question.type === "single_choice") {
        entry.option_id = value;
      } else if (question.type === "text" || question.type === "rating") {
        entry.answer = value;
      }

      return entry;
    }),
  };

  return await api.put("/api/quiz-answers/update-All", payload);
};


export const submitQuizAnswer = async (question, answer) => {
  const payload = { question_id: question.id };

  switch (question.type) {
    case "single_choice":
      payload.option_id = answer;
      break;
    case "multiple_choice":
      payload.option_id = answer;
      break;
    case "text":
    case "rating":
      payload.answer = answer;
      break;
    default:
      throw new Error(`Unsupported question type: ${question.type}`);
  }

  return await api.post("/api/quiz-answers/", payload);
};

// --- AI-Chat APIs ---
export const askAIChat = async (message, conversationId = null, searchWeb = false, isSaved = false) => {
  const res = await api.post("/api/ai_chat/chat", {
    userMessage: message,
    is_saved: isSaved,
    search_web: searchWeb,
    ...(conversationId ? { conversation_id: conversationId } : {}),
  });
  return res.data?.data;
};

export const getAIChatConversations = async () => {
  const res = await api.get("/api/ai_chat/conversations");
  return res.data?.data ?? res.data;
};


export const getAIChatHistory = async (conversationId) => {
  const res = await api.get("/api/ai_chat/history", {
    params: { conversation_id: conversationId },
  });
  const conversations = res.data?.data?.conversations || {};
  const raw = conversations[conversationId]?.messages || [];

  raw.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const chats = raw.flatMap(({ id, userMessage, assistantReply, createdAt }) => {
    const time = new Date(createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const out = [];

    if (userMessage) {
      out.push({
        id,
        role: "user",
        content: userMessage,
        time,
        chatHistoryId: id, // Store the backend chat_history_id explicitly
      });
    }
    if (assistantReply) {
      out.push({
        id,
        role: "assistant",
        content: assistantReply,
        time,
        chatHistoryId: id, // Store the backend chat_history_id explicitly
      });
    }
    return out;
  });
  return chats;
};



export const saveAIChatConversation = async (conversationId, isSaved = true) => {
  const res = await api.put("/api/ai_chat/toggle-saved", {
    conversation_id: conversationId,
    is_saved: isSaved,
  });
  return res.data;
};


export const saveConversation = async (conversationId) => {
  const res = await api.put("/api/ai_chat/conversation/save", {
    conversation_id: conversationId,
    is_saved: true,
  });
  return res.data;
};

export const deleteAIChatConversation = async (conversationId) => {
  const res = await api.delete(`/api/ai_chat/conversation/${conversationId}`);
  return res.data;
};

export const saveNote = async ({ chat_history_id, title }) => {
  const res = await api.post("/api/saved-notes/", {
    chat_history_id,
    title,
  });
  return res.data;
};

export const getSavedNotes = async () => {
  const res = await api.get("/api/saved-notes");
  const notes = res.data?.data?.notes;
  return Array.isArray(notes) ? notes : [];
};

// New API function for all saved items with pagination and search
export const getAllSavedItems = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add pagination parameters
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  // Add search parameter
  if (params.search) queryParams.append('search', params.search);
  
  const res = await api.get(`/api/saved-notes/all-saved-items?${queryParams.toString()}`);
  return res.data;
};

export const updateSavedNoteTitle = async (noteId, title) => {
  const res = await api.put(`/api/saved-notes/${noteId}`, { title });
  return res.data;
};

export const askAnonymousAI = async (message, sessionId = null) => {
  const res = await api.post("/api/ai_chat/anonymous", {
    userMessage: message,
    ...(sessionId ? { sessionId } : {}),
  });
  const data = res.data?.data;
  if (!res.data?.success || !data) {
    throw new Error(res.data?.message || "Anonymous chat request failed");
  }
  return data; // { reply, session_id, messageCount, remainingQuestions, conversationEnded }
};

export const claimGuestSession = async (guestSessionId) => {
  const res = await api.post("/api/ai_chat/claim-guest-session", {
    guest_session_id: guestSessionId,
  });
  const data = res.data?.data;
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to claim guest session");
  }
  return data; // { conversation_id, messageCount }
};

export const changePassword = async ({ oldPassword, newPassword, confirmNewPassword }) => {
  const res = await api.patch("/api/auth/change-password", {
    oldPassword,
    newPassword,
    confirmNewPassword,
  });
  return res.data;
};

export const getPreferences = async () => {
  const res = await api.get("/api/profile-preferences");
  return res.data.data;
};

export const savePreferences = async (preferences) => {
  const res = await api.post("/api/profile-preferences/", preferences);
  return res.data;
};


// export const saveNote = async ({ title, content }) => {
//   const res = await api.post("/api/saved-note", { title, content, tags: ["ai", "chat", "note"] });
//   return res.data;
// };

// export const getSavedNotes = async () => {
//   const res = await api.get("/api/saved-note");
//   const notes = res.data?.data?.notes;
//   return Array.isArray(notes) ? notes : [];
// };

export const getPrivacySettings = async () => {
  const res = await api.get("/api/privacy-settings/");
  return res.data?.data;
};

export const updatePrivacySettings = async (settings) => {
  const res = await api.put("/api/privacy-settings/", settings);
  return res.data;
};

export const resetPrivacySettings = async () => {
  const res = await api.post("/api/privacy-settings/reset");
  return res.data?.data;
};

export const getNotificationSettings = async () => {
  const res = await api.get("/api/notification-settings");
  return res.data?.data;
};

export const updateNotificationSettings = async (settings) => {
  const res = await api.put("/api/notification-settings", settings);
  return res.data;
};

export const getBookmarkedProperties = async () => {
  const res = await api.get("/api/properties/bookmark");
  return res.data?.bookmarks || [];
};


// --- Document APIs ---
export const getUserDocuments = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add pagination parameters
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  // Add filter parameters
  if (params.category) queryParams.append('category', params.category);
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.sort_order) queryParams.append('sort_order', params.sort_order);
  
  const res = await api.get(`/api/user-documents?${queryParams.toString()}`);
  return res.data;
};

export const deleteDocument = async (documentId) => {
  const res = await api.delete(`/api/user-documents/${documentId}`);
  return res.data;
};

export const uploadDocument = async (formData) => {
  const res = await api.post("/api/user-documents/upload", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const askDocumentAI = async (documentId, question) => {
  const res = await api.post(`/api/user-documents/${documentId}/chat`, {
    question,
  });
  return res.data;
};

// New function to get document chat history
export const getDocumentChatHistory = async (documentId) => {
  const res = await api.get(`/api/user-documents/${documentId}/chat/history`);
  return res.data;
};

// New function to get document chats with pagination
export const getDocumentChats = async (documentId, params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.conversation_id) queryParams.append('conversation_id', params.conversation_id);
  
  const res = await api.get(`/api/user-documents/${documentId}/chats?${queryParams.toString()}`);
  return res.data;
};

export const getDocumentPreview = async (documentId) => {
  const res = await api.get(`/api/user-documents/${documentId}/preview`);
  return res.data;
};

// --- Knowledge Base Admin APIs ---
export const addKnowledgeBaseEntry = async (payload) => {
  const res = await api.post("/api/documents/knowledge", payload);
  return res.data;
};

export const getKnowledgeBaseDocuments = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const queryString = queryParams.toString();
  const url = `/api/documents/documents${queryString ? `?${queryString}` : ''}`;
  
  const res = await api.get(url);
  return res.data;
};

export const getKnowledgeBaseStats = async () => {
  const res = await api.get("/api/documents/knowledge/stats");
  return res.data;
};

export const deleteKnowledgeBaseDocument = async (documentId) => {
  const res = await api.delete(`/api/documents/documents/${documentId}`);
  return res.data;
};

export const getKnowledgeBaseDocumentPreview = async (documentId) => {
  const res = await api.get(`/api/documents/documents/${documentId}/preview`);
  return res.data;
};

export const downloadKnowledgeBaseDocument = async (documentId) => {
  const res = await api.get(`/api/documents/documents/${documentId}/download`, {
    responseType: 'blob',
  });
  return res;
};

// --- Waitlist API ---
export const joinWaitlist = async ({ email }) => {
  const res = await api.post("/api/waitlist/join", { email });
  return res.data;
};

// --- Admin Dashboard APIs ---
export const getAdminDashboardKPIs = async (period = "30d") => {
  const res = await api.get("/api/admin/dashboard/kpis", { params: { period } });
  return res.data?.data;
};

export const getAdminDashboardChart = async (chartName, period = "30d") => {
  const res = await api.get(`/api/admin/dashboard/charts/${chartName}`, { params: { period } });
  return res.data?.data;
};

export const getAdminDashboardRecent = async (tableName, limit = 10) => {
  const res = await api.get(`/api/admin/dashboard/recent/${tableName}`, { params: { limit } });
  return res.data?.data;
};

// --- Admin Data Access APIs ---
export const getAdminUsers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.plan_type) queryParams.append("plan_type", params.plan_type);
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params.sort_order) queryParams.append("sort_order", params.sort_order);
  const res = await api.get(`/api/admin/users?${queryParams.toString()}`);
  return res.data;
};

export const getAdminUserDetail = async (userId) => {
  const res = await api.get(`/api/admin/users/${userId}`);
  return res.data?.data;
};

export const exportAdminUsers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.format) queryParams.append("format", params.format);
  if (params.search) queryParams.append("search", params.search);
  if (params.plan_type) queryParams.append("plan_type", params.plan_type);
  const res = await api.get(`/api/admin/users/export?${queryParams.toString()}`, {
    responseType: params.format === "csv" ? "blob" : "json",
  });
  return res;
};

// --- Public Article APIs (no auth) ---
export const getPublicArticles = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.category) queryParams.append("category", params.category);
  const res = await api.get(`/api/articles?${queryParams.toString()}`);
  return res.data;
};

export const getPublicArticleBySlug = async (slug) => {
  const res = await api.get(`/api/articles/${slug}`);
  return res.data;
};

// --- Admin Article APIs ---
export const getAdminArticles = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.category) queryParams.append("category", params.category);
  if (params.status) queryParams.append("status", params.status);
  const res = await api.get(`/api/admin/articles?${queryParams.toString()}`);
  return res.data;
};

export const getAdminArticle = async (id) => {
  const res = await api.get(`/api/admin/articles/${id}`);
  return res.data;
};

export const createArticle = async (formData) => {
  const res = await api.post("/api/admin/articles", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateArticle = async (id, formData) => {
  const res = await api.put(`/api/admin/articles/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteArticle = async (id) => {
  const res = await api.delete(`/api/admin/articles/${id}`);
  return res.data;
};

export const publishArticle = async (id) => {
  const res = await api.patch(`/api/admin/articles/${id}/publish`);
  return res.data;
};

export const unpublishArticle = async (id) => {
  const res = await api.patch(`/api/admin/articles/${id}/unpublish`);
  return res.data;
};

export default api;
