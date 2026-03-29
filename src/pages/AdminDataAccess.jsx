import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  FileText,
  MessageSquare,
  Filter,
} from "lucide-react";
import {
  getAdminUsers,
  getAdminUserDetail,
  exportAdminUsers,
} from "../api/api";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PlanBadge({ type }) {
  if (type === "pro") {
    return (
      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
        Pro
      </span>
    );
  }
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
      Free
    </span>
  );
}

function LoadingSkeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

// ─── User Detail Drawer ────────────────────────────

function UserDetailDrawer({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError("");
    getAdminUserDetail(userId)
      .then((data) => setUser(data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load user details.");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="space-y-4">
              <LoadingSkeleton className="h-20 w-full" />
              <LoadingSkeleton className="h-32 w-full" />
              <LoadingSkeleton className="h-48 w-full" />
            </div>
          ) : error ? (
            <p className="text-red-600 text-sm">{error}</p>
          ) : user ? (
            <div className="space-y-6">
              {/* Profile */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User size={16} /> Profile
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <Row label="Name" value={`${user.first_name || ""} ${user.last_name || ""}`.trim() || "—"} />
                  <Row label="Email" value={user.email} />
                  <Row label="Plan" value={<PlanBadge type={user.plan_type} />} />
                  <Row label="Signup Date" value={formatDate(user.createdAt)} />
                  <Row label="Last Activity" value={formatDate(user.updatedAt)} />
                  <Row label="Location" value={user.home_address || "—"} />
                  <Row label="Verified" value={user.is_verified ? "Yes" : "No"} />
                </div>
              </section>

              {/* Activity Summary */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MessageSquare size={16} /> Activity Summary
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-teal-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-teal-700">
                      {user.activity_summary?.documents_uploaded ?? 0}
                    </p>
                    <p className="text-xs text-teal-600">Documents</p>
                  </div>
                  <div className="bg-sky-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-sky-700">
                      {user.activity_summary?.ai_chat_records ?? 0}
                    </p>
                    <p className="text-xs text-sky-600">AI Chat Records</p>
                  </div>
                </div>
              </section>

              {/* Preferences */}
              {user.profile_preference && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Preferences</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <Row label="Tone" value={user.profile_preference.communication_tone || "—"} />
                    <Row label="Style" value={user.profile_preference.communication_style || "—"} />
                    <Row label="Behavior" value={user.profile_preference.behavior || "—"} />
                  </div>
                </section>
              )}

              {/* Quiz Answers */}
              {user.quiz_answers && user.quiz_answers.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText size={16} /> Quiz Answers ({user.quiz_answers.length})
                  </h3>
                  <div className="space-y-2">
                    {user.quiz_answers.map((qa, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-lg p-3 text-sm"
                      >
                        <p className="font-medium text-gray-800">
                          {qa.question_text || `Question #${qa.question_id}`}
                        </p>
                        <p className="text-gray-600 mt-1">
                          {qa.selected_option ||
                            (qa.answer_value != null ? JSON.stringify(qa.answer_value) : "—")}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────

export default function AdminDataAccess() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const searchTimeout = useRef(null);

  // Debounce search input
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await getAdminUsers({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        plan_type: planFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      if (res.success) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, planFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleExport = async (format) => {
    try {
      setExporting(true);
      const res = await exportAdminUsers({
        format,
        search: debouncedSearch || undefined,
        plan_type: planFilter || undefined,
      });

      if (format === "csv") {
        const blob = new Blob([res.data], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `users_export_${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const jsonData = res.data?.data || res.data;
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `users_export_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export error:", err);
      setError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "DESC" ? "ASC" : "DESC"));
    } else {
      setSortBy(field);
      setSortOrder("DESC");
    }
  };

  const SortIndicator = ({ field }) => {
    if (sortBy !== field) return null;
    return <span className="ml-1 text-purple-500">{sortOrder === "ASC" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Data Access</h1>
        <p className="text-sm text-gray-500 mt-1">
          View, search, and export user records and onboarding data
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
            />
          </div>

          {/* Plan filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
          </div>

          {/* Export */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => handleExport("csv")}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Download size={14} />
              CSV
            </button>
            <button
              onClick={() => handleExport("json")}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Download size={14} />
              JSON
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                <th
                  className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-purple-600"
                  onClick={() => toggleSort("email")}
                >
                  Email <SortIndicator field="email" />
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-purple-600"
                  onClick={() => toggleSort("first_name")}
                >
                  Name <SortIndicator field="first_name" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                <th
                  className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-purple-600"
                  onClick={() => toggleSort("createdAt")}
                >
                  Signup Date <SortIndicator field="createdAt" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Last Activity</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td colSpan={8} className="px-4 py-3">
                      <LoadingSkeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500">{u.id}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{u.email}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {u.first_name || u.last_name
                        ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge type={u.plan_type} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(u.last_activity_date)}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">
                      {u.home_address || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedUserId(u.id)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchUsers(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                      pageNum === pagination.page
                        ? "bg-purple-600 text-white"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Drawer */}
      {selectedUserId && (
        <UserDetailDrawer
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}
