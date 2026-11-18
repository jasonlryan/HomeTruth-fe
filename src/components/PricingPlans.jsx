import HTGlyph from "./HTGlyph";
const CheckIcon = () => (
  <HTGlyph name="success" size={24} className="text-ht-cyan" />
);

const ListItem = ({ text }) => (
  <li className="flex items-start gap-3 text-lg text-gray-800">
    <span className="mt-1 flex items-center justify-center w-8 h-8 rounded-full">
      <CheckIcon />
    </span>
    <span>{text}</span>
  </li>
);

export default function PricingPlans() {
  return (
    <div className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-14">
          Explore plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col pt-10 justify-between">
            <div>
              <h3 className="text-4xl font-bold text-black mb-8">Free User</h3>
              <ul className="space-y-5 text-lg">
                {[
                  "Ask up to 10 general property questions per month",
                  "Save up to 5 responses",
                  "Complete onboarding quiz",
                  "Use browser extension to bookmark properties",
                  "Full access to affordability tool",
                ].map((item, i) => (
                  <ListItem key={i} text={item} />
                ))}
              </ul>
            </div>
            <button className="mt-10 bg-ht-cyan text-white w-full py-3 rounded-md text-sm font-medium hover:bg-ht-cyan-light transition">
              Create Free Account
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col pt-10  justify-between">
            <div>
              <h3 className="text-4xl font-bold text-black mb-8">
                <span className="text-4xl font-bold text-black mb-8">👑</span> Pro User
              </h3>
              <ul className="space-y-5">
                {[
                  "Unlimited general + document-based questions",
                  "Unlimited notes with folders, tags, and filters",
                  "Ongoing dynamic profile refinement",
                  "Enhanced listing management with tags & filters",
                  "Full access with future personalization",
                  "Upload & store PDFs, DOCX, JPG, PNG (up to 25MB)",
                  "Answers based on uploaded documents using RAG",
                ].map((item, i) => (
                  <ListItem key={i} text={item} />
                ))}
              </ul>
              <p className="mt-10 text-black font-bold text-4xl">
                £50 <span className="font-medium text-base">/ month</span>
              </p>
            </div>
            <button className="mt-10 bg-ht-cyan text-white w-full py-3 rounded-md text-sm font-medium hover:bg-ht-cyan-light transition">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
