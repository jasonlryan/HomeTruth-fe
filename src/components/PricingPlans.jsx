const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="29"
    viewBox="0 0 28 29"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14 24.8994C15.3789 24.8994 16.7443 24.6278 18.0182 24.1001C19.2921 23.5725 20.4496 22.799 21.4246 21.824C22.3996 20.849 23.1731 19.6915 23.7007 18.4176C24.2284 17.1437 24.5 15.7783 24.5 14.3994C24.5 13.0205 24.2284 11.6552 23.7007 10.3812C23.1731 9.10732 22.3996 7.94981 21.4246 6.97479C20.4496 5.99978 19.2921 5.22635 18.0182 4.69868C16.7443 4.171 15.3789 3.89941 14 3.89941C11.2152 3.89941 8.54451 5.00566 6.57538 6.97479C4.60625 8.94392 3.5 11.6146 3.5 14.3994C3.5 17.1842 4.60625 19.8549 6.57538 21.824C8.54451 23.7932 11.2152 24.8994 14 24.8994ZM13.7293 18.6461L19.5627 11.6461L17.7707 10.1527L12.754 16.1716L10.1582 13.5746L8.5085 15.2242L12.0085 18.7242L12.9115 19.6272L13.7293 18.6461Z"
      fill="#7098FE"
    />
    <path
      d="M19.562 11.6457L13.7286 18.6457L12.9108 19.6268L12.0078 18.7238L8.50781 15.2238L10.1575 13.5742L12.7533 16.1712L17.77 10.1523L19.562 11.6457Z"
      fill="white"
    />
  </svg>
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
            <button className="mt-10 bg-myblue text-white w-full py-3 rounded-md text-sm font-medium hover:bg-fuchsia-700 transition">
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
            <button className="mt-10 bg-myblue text-white w-full py-3 rounded-md text-sm font-medium hover:bg-fuchsia-700 transition">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
