import { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "../../api/api";

const defaultSettings = {
  documentAnalysis: true,
  chatSummary: true,
  aiInsights: true,
  propertyAlerts: true,
  extensionSave: false,
  productTips: false,
};

const mapBackendToFrontend = (data) => ({
  documentAnalysis: data.documentAnalysisComplete,
  chatSummary: data.chatSummaryFollowUps,
  aiInsights: data.newAiInsightsAvailable,
  propertyAlerts: data.propertyAlerts,
  extensionSave: data.extensionSaveConfirmations,
  productTips: data.tipsAndProductUpdates,
});

const mapFrontendToBackend = (settings) => ({
  documentAnalysisComplete: settings.documentAnalysis,
  chatSummaryFollowUps: settings.chatSummary,
  newAiInsightsAvailable: settings.aiInsights,
  propertyAlerts: settings.propertyAlerts,
  extensionSaveConfirmations: settings.extensionSave,
  tipsAndProductUpdates: settings.productTips,
});

export default function NotificationSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // "success" | "error" | null

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getNotificationSettings();
        setSettings(mapBackendToFrontend(data));
      } catch (err) {
        console.error("Failed to load notification settings:", err);
        setError("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const toggle = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const saveSettings = async () => {
    setSaving(true);
    try {
      const payload = mapFrontendToBackend(settings);
      await updateNotificationSettings(payload);
      setSaveStatus("success");
    } catch (err) {
      console.error("Failed to save notification settings:", err);
      setSaveStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  if (loading) return <div className="p-4">Loading settings...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 mt-4 mb-20">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-primary rounded-full">
          <img src="/assets/settings/notification.svg" alt="" className="w-5 h-5" />
        </div>
        <PageTitle>Notifications</PageTitle>
      </div>

      <Section
        title="Checklist & Task Updates"
        description="Stay on top of your property process with personalized checklists and smart reminders."
      >
        <ToggleItem
          label="Document Analysis Complete"
          description="Be notified when your property documents have been reviewed."
          value={settings.documentAnalysis}
          onChange={() => toggle("documentAnalysis")}
          pro
        />
      </Section>

      <Section
        title="Chat Follow-ups"
        description="Let HomeTruth follow up with helpful tips or summaries after a chat."
      >
        <div className="mt-8"></div>

        <ToggleItem
          label="Chat Summary Follow-ups"
          description="Get summaries and suggested actions after asking questions in chat."
          value={settings.chatSummary}
          onChange={() => toggle("chatSummary")}
        />
        <div className="border-t border-gray-200 my-2"></div>
        <ToggleItem
          label="New property guidance available"
          description="Be alerted when new document-based guidance is added to your dashboard."
          value={settings.aiInsights}
          onChange={() => toggle("aiInsights")}
          pro
        />
      </Section>

      <Section
        title="Listings & Discovery Alerts"
        description="Control alerts related to new listings and bookmarks."
      >
        <div className="mt-8"></div>

        <ToggleItem
          label="Property Alerts"
          description="Be notified when a listing matches your lifestyle and saved tags."
          value={settings.propertyAlerts}
          onChange={() => toggle("propertyAlerts")}
        />
        <div className="border-t border-gray-200 my-2 mb-5"></div>
        <ToggleItem
          label="Extension Save Confirmations"
          description="Show a toast when saving a listing from a partner site."
          value={settings.extensionSave}
          onChange={() => toggle("extensionSave")}
        />
      </Section>

      <Section
        title="Product Tips & Feature Updates"
        description="Stay informed on platform improvements and tips."
      >
        <div className="mt-8"></div>

        <ToggleItem
          label="Tips & Product Updates"
          description="Occasional guidance on how to use features and platform enhancements."
          value={settings.productTips}
          onChange={() => toggle("productTips")}
        />
      </Section>

      {saveStatus === "success" && (
        <div className="text-green-600 text-sm">✅ Settings saved successfully.</div>
      )}
      {saveStatus === "error" && (
        <div className="text-red-600 text-sm">❌ Failed to save settings.</div>
      )}

      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className={`px-4 py-2 rounded-lg text-sm ${
            saving
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-customActiveText text-white hover:bg-sky-500"
          }`}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border space-y-4">
      <div>
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-sm text-darkGrey">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ToggleItem({ label, description, value, onChange, pro = false }) {
  return (
    <div className="flex justify-between items-start">
      <div className="mr-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-grayDeep">{label}</span>
          {pro && (
            <span className="text-xs bg-customActiveText text-white px-2 py-0.5 rounded-full">
              PRO
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          checked={value}
          onChange={onChange}
        />
        <div
          className={`relative w-11 h-6 rounded-full shadow-inner transition ${
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
