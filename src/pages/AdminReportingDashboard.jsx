import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserCheck,
  Crown,
  FileText,
  MessageSquare,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  getAdminDashboardKPIs,
  getAdminDashboardChart,
  getAdminDashboardRecent,
  getAdminPilotCohortReport,
} from "../api/api";

const PERIODS = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "all", label: "All Time" },
];

const CHART_COLORS = [
  "var(--ht-purple)",
  "var(--ht-cyan)",
  "var(--ht-green)",
  "rgb(245 158 11)",
  "rgb(239 68 68)",
  "var(--ht-purple-light)",
];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(num) {
  if (num === null || num === undefined) return "—";
  return num.toLocaleString();
}

function TrendBadge({ value }) {
  if (value === null || value === undefined) return null;
  const isUp = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isUp ? "text-green-600" : "text-red-500"
      }`}
    >
      {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {isUp ? "+" : ""}
      {value}%
    </span>
  );
}

function KPICard({ icon: Icon, label, value, subtitle, trend, color = "purple" }) {
  const colorMap = {
    purple: "bg-purple-50 text-ht-purple",
    blue: "bg-sky-50 text-ht-cyan",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    indigo: "bg-purple-50 text-ht-purple-light",
    teal: "bg-teal-50 text-teal-600",
    sky: "bg-sky-50 text-ht-cyan",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
        <TrendBadge value={trend} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function LoadingSkeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

function ChartCard({ title, children, loading }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {loading ? (
        <LoadingSkeleton className="h-56 w-full" />
      ) : (
        <div className="h-56">{children}</div>
      )}
    </div>
  );
}

function ReadinessBadge({ status }) {
  const classes = {
    ready: "bg-green-50 text-green-700 border-green-200",
    needs_data: "bg-amber-50 text-amber-700 border-amber-200",
    blocked: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[11px] ${
        classes[status] || classes.needs_data
      }`}
    >
      {status ? status.replace("_", " ") : "review"}
    </span>
  );
}

function PilotReadinessPanel({ report, loading }) {
  if (loading) {
    return <LoadingSkeleton className="mb-6 h-72 w-full" />;
  }

  const pilot = report?.reports?.[0];
  if (!pilot) {
    return (
      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Pilot readiness
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          No partner cohort reporting data is available yet.
        </p>
      </section>
    );
  }

  const metrics = pilot.metrics || {};
  const readiness = pilot.readiness || {};
  const recommendation = readiness.recommendation || "review";
  const isBlocked = recommendation === "no_go";

  return (
    <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-medium text-ht-purple">
            500-user pilot readiness
          </p>
          <h2 className="mt-1 text-xl font-semibold text-gray-900">
            {pilot.partner?.name || "Partner"} · {pilot.cohort?.name || "Cohort"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-gray-500">
            {report.privacyBoundary}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
            isBlocked
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {isBlocked ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          {recommendation.replaceAll("_", " ")}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KPICard
          icon={Users}
          label="Target Size"
          value={formatNumber(metrics.targetSize)}
          color="purple"
        />
        <KPICard
          icon={UserCheck}
          label="Invited Members"
          value={formatNumber(metrics.invitedMembers)}
          color="blue"
        />
        <KPICard
          icon={ShieldCheck}
          label="Consent Rate"
          value={`${metrics.consentRate || 0}%`}
          color="green"
        />
        <KPICard
          icon={ClipboardCheck}
          label="Properties Linked"
          value={formatNumber(metrics.propertiesLinked)}
          color="teal"
        />
        <KPICard
          icon={ClipboardList}
          label="Tasks Generated"
          value={formatNumber(metrics.tasksGenerated)}
          color="amber"
        />
        <KPICard
          icon={CheckCircle2}
          label="Tasks Completed"
          value={formatNumber(metrics.taskCompleted)}
          color="green"
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Readiness checklist
          </h3>
          <div className="mt-3 space-y-3">
            {(readiness.items || []).map((item) => (
              <div
                key={item.key}
                className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {item.note}
                  </p>
                </div>
                <ReadinessBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Funnel drop-off
          </h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Invite to signup</dt>
              <dd className="font-medium text-gray-900">
                {formatNumber(pilot.dropOff?.inviteToSignup || 0)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Signup to consent</dt>
              <dd className="font-medium text-gray-900">
                {formatNumber(pilot.dropOff?.signupToConsent || 0)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Consent to property</dt>
              <dd className="font-medium text-gray-900">
                {formatNumber(pilot.dropOff?.consentToProperty || 0)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Property to document</dt>
              <dd className="font-medium text-gray-900">
                {formatNumber(pilot.dropOff?.propertyToDocument || 0)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export default function AdminReportingDashboard() {
  const [period, setPeriod] = useState("30d");
  const [kpis, setKpis] = useState(null);
  const [signupsChart, setSignupsChart] = useState([]);
  const [aiUsageChart, setAiUsageChart] = useState([]);
  const [documentsChart, setDocumentsChart] = useState([]);
  const [docCategoriesChart, setDocCategoriesChart] = useState([]);
  const [recentSignups, setRecentSignups] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [recentAI, setRecentAI] = useState([]);
  const [pilotReport, setPilotReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [pilotLoading, setPilotLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchKPIs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboardKPIs(period);
      setKpis(data);
    } catch (err) {
      setError("Failed to load dashboard KPIs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  const fetchCharts = useCallback(async () => {
    try {
      setChartsLoading(true);
      const [signups, ai, docs, cats] = await Promise.all([
        getAdminDashboardChart("signups", period),
        getAdminDashboardChart("ai-usage", period),
        getAdminDashboardChart("documents", period),
        getAdminDashboardChart("doc-categories"),
      ]);
      setSignupsChart(signups || []);
      setAiUsageChart(ai || []);
      setDocumentsChart(docs || []);
      setDocCategoriesChart(cats || []);
    } catch (err) {
      console.error("Chart fetch error:", err);
    } finally {
      setChartsLoading(false);
    }
  }, [period]);

  const fetchRecent = useCallback(async () => {
    try {
      setRecentLoading(true);
      const [signups, uploads, aiActivity] = await Promise.all([
        getAdminDashboardRecent("signups", 10),
        getAdminDashboardRecent("uploads", 10),
        getAdminDashboardRecent("ai-activity", 10),
      ]);
      setRecentSignups(signups || []);
      setRecentUploads(uploads || []);
      setRecentAI(aiActivity || []);
    } catch (err) {
      console.error("Recent activity fetch error:", err);
    } finally {
      setRecentLoading(false);
    }
  }, []);

  const fetchPilotReport = useCallback(async () => {
    try {
      setPilotLoading(true);
      const data = await getAdminPilotCohortReport({ period });
      setPilotReport(data);
    } catch (err) {
      console.error("Pilot report fetch error:", err);
    } finally {
      setPilotLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchKPIs();
    fetchCharts();
    fetchPilotReport();
  }, [fetchKPIs, fetchCharts, fetchPilotReport]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  const refreshAll = () => {
    setError("");
    fetchKPIs();
    fetchCharts();
    fetchRecent();
    fetchPilotReport();
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reporting Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Product metrics based on stored data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  period === p.value
                    ? "bg-white text-ht-purple font-medium shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={refreshAll}
            className="p-2 text-gray-500 hover:text-ht-purple hover:bg-purple-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-28" />
          ))}
        </div>
      ) : kpis ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPICard
            icon={Users}
            label="Total Users"
            value={formatNumber(kpis.totalUsers)}
            trend={kpis.trends?.totalUsers}
            color="purple"
          />
          <KPICard
            icon={UserCheck}
            label="Free Users"
            value={formatNumber(kpis.freeUsers)}
            color="blue"
          />
          <KPICard
            icon={Crown}
            label="Pro Users"
            value={formatNumber(kpis.proUsers)}
            color="amber"
          />
          <KPICard
            icon={TrendingUp}
            label="Pro User Rate"
            value={`${kpis.proUserRate}%`}
            subtitle="of users are on Pro"
            color="green"
          />
          <KPICard
            icon={ClipboardList}
            label="Quiz Completed"
            value={formatNumber(kpis.quizCompletedCount)}
            subtitle={`of ${formatNumber(kpis.totalQuizUsers)} users`}
            color="indigo"
          />
          <KPICard
            icon={FileText}
            label="Documents Uploaded"
            value={formatNumber(kpis.documentsUploaded)}
            subtitle={`${formatNumber(kpis.documentAIChats)} document AI chats`}
            trend={kpis.trends?.documentsUploaded}
            color="teal"
          />
          <KPICard
            icon={MessageSquare}
            label="AI Chat Records"
            value={formatNumber(kpis.aiChatRecords)}
            trend={kpis.trends?.aiChatRecords}
            color="sky"
          />
          <KPICard
            icon={Mail}
            label="Waitlist Signups"
            value={formatNumber(kpis.waitlistSignups)}
            trend={kpis.trends?.waitlistSignups}
            color="rose"
          />
        </div>
      ) : null}

      <PilotReadinessPanel report={pilotReport} loading={pilotLoading} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="User Signups Over Time" loading={chartsLoading}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={signupsChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(240 240 240)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                }
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                labelFormatter={(d) => formatDate(d)}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="count" name="Signups" fill="var(--ht-purple)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="AI Chat Records Over Time" loading={chartsLoading}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aiUsageChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(240 240 240)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                }
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                labelFormatter={(d) => formatDate(d)}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Records"
                stroke="var(--ht-cyan)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Documents Uploaded Over Time" loading={chartsLoading}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={documentsChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(240 240 240)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                }
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                labelFormatter={(d) => formatDate(d)}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="count" name="Uploads" fill="var(--ht-green)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Documents by Category" loading={chartsLoading}>
          {docCategoriesChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={docCategoriesChart}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ category, percent }) =>
                    `${category} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {docCategoriesChart.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              No document data yet
            </div>
          )}
        </ChartCard>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Signups */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Signups</h3>
          {recentLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentSignups.length > 0 ? (
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {recentSignups.map((u) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {u.first_name || u.last_name
                        ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                        : u.email}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {formatDate(u.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No signups yet</p>
          )}
        </div>

        {/* Recent Uploads */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Uploads</h3>
          {recentLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentUploads.length > 0 ? (
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {recentUploads.map((d) => (
                <div key={d.id} className="py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                      {d.name}
                    </p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        d.status === "ready"
                          ? "bg-green-50 text-green-700"
                          : d.status === "error"
                          ? "bg-red-50 text-red-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {d.user?.email || "Unknown"} · {formatDate(d.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No uploads yet</p>
          )}
        </div>

        {/* Recent AI Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent AI Activity</h3>
          {recentLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentAI.length > 0 ? (
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {recentAI.map((c) => (
                <div key={c.id} className="py-2.5">
                  <p className="text-sm text-gray-900 truncate max-w-full">
                    {c.userMessage?.substring(0, 80)}
                    {c.userMessage?.length > 80 ? "…" : ""}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {c.user?.email || "Unknown"} · {formatDate(c.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No AI activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
