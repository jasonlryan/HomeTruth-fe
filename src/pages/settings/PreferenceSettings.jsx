import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import {
  getPreferences,
  savePreferences,
} from "../../api/api";

export default function PreferenceSettings() {
  const navigate = useNavigate();
  const [tone, setTone] = useState("");
  const [responseStyle, setResponseStyle] = useState("");
  const [aiBehavior, setAIBehavior] = useState("");
  const [personalization, setPersonalization] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null); // null | "success" | "error"

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const data = await getPreferences();

        // Set values from API response or use defaults
        setTone(data?.communication_tone || "friendly");
        setResponseStyle(data?.communication_style || "narrative_summary");
        setAIBehavior(data?.behavior || "link_notes");
        // Handle null values properly - default to true if null or undefined
        setPersonalization(data?.use_profile_personalization === true);
      } catch (err) {
        if (err?.response?.status === 404) {
          console.warn("No preferences found using defaults.");
          setTone("friendly");
          setResponseStyle("narrative_summary");
          setAIBehavior("link_notes");
          setPersonalization(true);
        } else {
          alert("Failed to fetch preferences.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleSave = async () => {
    const payload = {
      communication_tone: tone,
      communication_style: responseStyle,
      behavior: aiBehavior,
      use_profile_personalization: personalization,
    };


    try {
      await savePreferences(payload);
      setSaveStatus("success");

      // Hide after 3s
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("❌ Failed to save preferences", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      setSaveStatus("error");

      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-gray-500 text-sm">
        Loading preferences...
      </div>
    );
  }

  return (
    <div className="mt-4 mb-20">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-start gap-3 ">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-customActiveText rounded-full ">
            <img src="/assets/settings/preferences.svg" alt="" className="w-5 h-5" />
          </div>
          <PageTitle>Preferences</PageTitle>
        </div>
        <p className="text-gray-600 text-sm mt-2">
          HomeTruth remembers useful details about you and your preferences so
          it can be more <br /> helpful.
        </p>
      </div>

      <div className="max-w-7xl mx-auto text-textColor mt-10 px-4 space-y-6">
        <Section
          title="Communication Tone & Style"
          icon={
            <span className="material-symbols-outlined mt-2 text-customActiveText text-xl">
              chat_bubble
            </span>
          }
        >
          <div className="mb-4">
            <p className="text-textColor mb-2">
              How would you like HomeTruth to speak with you?
            </p>
            {["formal", "friendly", "encouraging"].map((option) => (
              <RadioOption
                key={option}
                value={option}
                selected={tone}
                onChange={setTone}
                label={capitalize(option)}
              />
            ))}
          </div>

          <div>
            <p className="mb-2">Response Style:</p>
            {["bullet_points", "narrative_summary", "visual_aids"].map(
              (style) => (
                <RadioOption
                  key={style}
                  value={style}
                  selected={responseStyle}
                  onChange={setResponseStyle}
                  label={
                    style === "bullet_points"
                      ? "Bullet Points"
                      : style === "narrative_summary"
                        ? "Narrative Summary"
                        : "Visual Aids (Charts/Icons)"
                  }
                />
              )
            )}
          </div>
        </Section>

        <Section
          title="Assistant behaviour settings"
          icon={
            <span className="material-symbols-outlined mt-1 text-customActiveText">
              brightness_5
            </span>
          }
        >
          <p className="mb-2 text-textColor">
            Control how much HomeTruth adapts to you.
          </p>
          {[
            {
              value: "follow_ups",
              label: "Suggest follow-up questions after answers",
            },
            { value: "link_notes", label: "Link advice to my notes and profile" },
            {
              value: "checklist",
              label: "Convert short answers into full checklists",
            },
          ].map(({ value, label }) => (
            <RadioOption
              key={value}
              value={value}
              selected={aiBehavior}
              onChange={setAIBehavior}
              label={label}
            />
          ))}
        </Section>

        <Section
          title={
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M16.5 8.38341C16.5029 9.4833 16.2459 10.5683 15.75 11.5501C15.162 12.7265 14.2581 13.7161 13.1395 14.4078C12.021 15.0996 10.7319 15.4662 9.41667 15.4667C8.31678 15.4696 7.23176 15.2126 6.25 14.7167L1.5 16.3001L3.08333 11.5501C2.58744 10.5683 2.33047 9.4833 2.33333 8.38341C2.33384 7.0682 2.70051 5.77911 3.39227 4.66053C4.08402 3.54195 5.07355 2.63805 6.25 2.05007C7.23176 1.55418 8.31678 1.2972 9.41667 1.30007H9.83333C11.5703 1.3959 13.2109 2.12904 14.441 3.35912C15.671 4.5892 16.4042 6.22978 16.5 7.96674V8.38341Z"
                  stroke="#19B0F0F0"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Personalization Settings</span>
            </div>
          }
        >
          <div className="space-y-3">
            <p className="font-medium">
              Should HomeTruth tailor advice to your behavior and answers?
            </p>

            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={personalization}
                  onChange={() => setPersonalization(!personalization)}
                />
                <div
                  className={`relative w-11 h-6 rounded-full shadow-inner transition ${personalization ? "bg-customActiveText" : "bg-gray-300"
                    }`}
                >
                  <div
                    className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transition-transform ${personalization ? "translate-x-full" : ""
                      }`}
                  ></div>
                </div>
              </label>

              <span className="text-sm">
                Use my profile & behavior to personalize
              </span>
            </div>

            <div className="bg-blue-50 text-customActiveText text-sm px-4 py-2 rounded-md flex items-start gap-2 mt-1">
              <span className="material-symbols-outlined text-base">
                shield
              </span>
              <span>
                Turning this off disables adaptive checklists and tone
                personalization.
              </span>
            </div>
          </div>
        </Section>

        {/* Questionnaire Section */}
        <Section
          title="Questionnaire"
          icon={
            <span className="material-symbols-outlined text-customActiveText text-xl">
              quiz
            </span>
          }
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Edit my answers?</h4>
              <p className="text-sm text-gray-600">
                Update the information you provided during signup
              </p>
            </div>
            <button
              onClick={() => navigate("/quiz")}
              className="bg-customActiveText text-white px-4 py-2 rounded-lg hover:bg-sky-500 transition"
            >
              Update answers
            </button>
          </div>
        </Section>

        {saveStatus === "success" && (
          <div className="text-green-600 text-sm">✅ Preferences saved!</div>
        )}
        {saveStatus === "error" && (
          <div className="text-red-600 text-sm">
            ❌ Failed to save preferences.
          </div>
        )}

        <div className="text-right space-x-3">
          <button
            onClick={() => {
              setTone("friendly");
              setResponseStyle("narrative_summary");
              setAIBehavior("link_notes");
              setPersonalization(true);
            }}
            className="bg-gray-100 text-customActiveText border border-customActiveText hover:bg-gray-200 text-sm px-4 py-2 rounded-md"
          >
            Return to default
          </button>
          <button
            onClick={handleSave}
            className="bg-customActiveText text-white hover:bg-opacity-90 text-sm px-4 py-2 rounded-md"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-lg border shadow p-6">
      <h3 className="text-md font-bold mb-4 flex items-center gap-2 border-b pb-2">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function RadioOption({ value, selected, onChange, label }) {
  return (
    <label className="flex items-center space-x-2 mb-2 cursor-pointer">
      <input
        type="radio"
        value={value}
        checked={selected === value}
        onChange={() => onChange(value)}
        className={`w-4 h-4 bg-white focus:ring-customActiveText focus:ring-2 ${selected === value
            ? 'border-2 border-customActiveText'
            : 'border-2 border-gray-300'
          }`}
        style={{
          accentColor: 'var(--customActiveText)'
        }}
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}
