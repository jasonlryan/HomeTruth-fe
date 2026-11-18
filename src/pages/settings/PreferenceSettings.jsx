import HTGlyph from "../../components/HTGlyph";
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
          <div className="w-8 h-8 flex items-center justify-center bg-sky-50 text-ht-cyan rounded-full ">
            <img src="/assets/settings/preferences.svg" alt="" className="w-5 h-5" />
          </div>
          <PageTitle>Preferences</PageTitle>
        </div>
        <p className="text-gray-600 text-sm mt-2">
          HomeTruth remembers useful details about you and your preferences so
          it can be more <br /> helpful.
        </p>
      </div>

      <div className="max-w-7xl mx-auto text-ht-black mt-10 px-4 space-y-6">
        <Section
          title="Communication Tone & Style"
          icon={
            <HTGlyph name="assistant" size={20} className="mt-2 text-ht-cyan " />
          }
        >
          <div className="mb-4">
            <p className="text-ht-black mb-2">
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
            <HTGlyph name="preferences" className="mt-1 text-ht-cyan" />
          }
        >
          <p className="mb-2 text-ht-black">
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
              <HTGlyph name="preferences" size={18} className="text-ht-cyan" />
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
                  className={`relative w-11 h-6 rounded-full shadow-inner transition ${personalization ? "bg-ht-cyan" : "bg-gray-300"
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

            <div className="bg-sky-50 text-ht-cyan text-sm px-4 py-2 rounded-md flex items-start gap-2 mt-1">
              <HTGlyph name="consent" size={16} />
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
            <HTGlyph name="checklist" size={20} className="text-ht-cyan " />
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
              className="bg-ht-cyan text-white px-4 py-2 rounded-lg hover:bg-ht-cyan-light transition"
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
            className="bg-gray-100 text-ht-cyan border border-ht-cyan hover:bg-gray-200 text-sm px-4 py-2 rounded-md"
          >
            Return to default
          </button>
          <button
            onClick={handleSave}
            className="bg-ht-cyan text-white hover:bg-ht-cyan-light text-sm px-4 py-2 rounded-md"
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
        className={`w-4 h-4 bg-white focus:ring-ht-cyan focus:ring-2 ${selected === value
            ? 'border-2 border-ht-cyan'
            : 'border-2 border-gray-300'
          }`}
        style={{
          accentColor: 'var(--ht-cyan)'
        }}
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}
