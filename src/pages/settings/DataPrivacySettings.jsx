import { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle";
import api, { resetPrivacySettings } from "../../api/api";

const defaultSettings = {
  enableBehaviorBasedPersonalization: true,
  useChatHistoryToRefineInsights: false,
  gdprDataCollectionConsent: true,
  allowAnonymousUsageAnalytics: false,
  disableDocumentRetention: true,
};

export default function DataPrivacySettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [settingsId, setSettingsId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // "success" | "error" | null

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/api/privacy-settings/");
        const data = res.data?.data;
        setSettings((prev) => ({
          ...prev,
          ...data,
        }));
        setSettingsId(data?.id || null);
      } catch (err) {
        console.error("Error loading settings:", err);
        setError("⚠️ Failed to load settings from server.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const toggle = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const _handleRetentionChange = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    setSettings((prev) => ({
      ...prev,
      documentRetentionPeriod: value,
    }));
  };

  const saveSettings = async () => {
    if (settings.documentRetentionPeriod < 0) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    try {
      const payload = settingsId
        ? { ...settings, id: settingsId }
        : { ...settings };
      await api.put("/api/privacy-settings/", payload);
      setSaveStatus("success");
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("error");
    } finally {
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleReset = async () => {
    try {
      const res = await resetPrivacySettings();
      setSettings((prev) => ({ ...prev, ...res }));
      setSaveStatus("success");
    } catch (err) {
      console.error("Reset error:", err);
      setSaveStatus("error");
    } finally {
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  if (loading) return <div className="p-4">Loading settings...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6 mt-4 mb-20">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-primary rounded-full">
          <img src="/assets/settings/data-privacy.svg" alt="" className="w-5 h-5" />
        </div>
        <PageTitle>Data Privacy</PageTitle>
      </div>

      <Section
        title="Settings / Data Privacy"
        description="Manage how your data is stored, personalized, and used to power your HomeTruth experience."
      >
        <div className="ml-8">
          <h2 className="font-extrabold text-lg text-textColor mt-12 ">
            Personalisation preferences
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Control how your behavior and quiz responses are used to tailor
            suggestions and tone.
          </p>
          <ToggleRow
            label="Enable behavior-based personalization"
            value={settings.enableBehaviorBasedPersonalization}
            onChange={() => toggle("enableBehaviorBasedPersonalization")}
            border={true}
          />
          <ToggleRow
            label="Use chat history to refine insights"
            value={settings.useChatHistoryToRefineInsights}
            onChange={() => toggle("useChatHistoryToRefineInsights")}
          />
        </div>
      </Section>

      <Section
        title="Consent & Analytics"
        description="Manage your consent and how anonymous data helps improve the platform."
      >
        <ToggleRow
          label="GDPR Data Collection Consent"
          value={settings.gdprDataCollectionConsent}
          onChange={() => toggle("gdprDataCollectionConsent")}
          border={true}
        />
        <ToggleRow
          label="Allow anonymous usage analytics"
          value={settings.allowAnonymousUsageAnalytics}
          onChange={() => toggle("allowAnonymousUsageAnalytics")}
        />
      </Section>

      <Section
        title="Data Control Options"
        description="Export or delete your profile, preferences, and documents at any time."
      >
        <div className="flex gap-4 mt-2">
          <button
            onClick={() => alert("📤 Export feature coming soon...")}
            className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
          >
            Export My Data
          </button>
          <button
            onClick={() =>
              window.confirm("Are you sure?") &&
              alert("🗑️ Delete feature coming soon...")
            }
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
          >
            Delete My Data
          </button>
        </div>
      </Section>

      <Section
        title="Uploaded Document Settings"
        description="Control how long your files are stored and used after insights are generated."
        pro={true}
      >

        <ToggleRow
          label="Disable document retention"
          value={settings.disableDocumentRetention}
          onChange={() => toggle("disableDocumentRetention")}
        />
      </Section>

      {/* ✅ Inline Status Message */}
      {saveStatus === "success" && (
        <div className=" text-green-800 px-4 py-2 rounded-md text-sm">
          ✅ Privacy settings saved successfully.
        </div>
      )}
      {saveStatus === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-md text-sm">
          ❌ Failed to save privacy settings.
        </div>
      )}

      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-gray-100 border-customActiveText text-customActiveText text-sm hover:bg-gray-200 border"
        >
          Return to Default
        </button>
        <button
          onClick={saveSettings}
          className="px-4 py-2 rounded-lg bg-customActiveText text-white text-sm hover:bg-sky-500"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}


function Section({ title, description, children, pro = false }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-extrabold text-lg text-textColor">{title}</h2>
          {pro && (
            <span className="text-xs bg-customActiveText text-white px-2 py-0.5 rounded-full">
              PRO
            </span>
          )}
        </div>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ToggleRow({ label, value, onChange, border }) {
  return (
    <div
      className={`flex justify-between items-start ${
        border ? "border-b border-gray-200 pb-4" : ""
      }`}
    >
      <div className="mr-4 flex items-center gap-1">
        <span className="font-normal text-sm mt-4 text-textColor">{label}</span>
        <span
          className="material-symbols-outlined text-[16px] mt-4 text-gray-400 cursor-pointer"
          title="Info"
        >
          info
        </span>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          checked={value}
          onChange={onChange}
        />
        <div
          className={`relative w-11 h-6 mt-3 rounded-full shadow-inner transition ${
            value ? "bg-customActiveText" : "bg-gray-300"
          }`}
        >
          <div
            className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transition-transform ${
              value ? "translate-x-full" : ""
            }`}
          ></div>
        </div>
      </label>
    </div>
  );
}
