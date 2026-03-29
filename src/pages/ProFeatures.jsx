import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

export default function ProFeatures() {
  const navigate = useNavigate();



  const handleStartFree = () => {
    navigate("/register");
  };
  const items = [
    {

      description: "Records that can't be changed or lost.",
      image: "/assets/trustSeurity/pic1.svg",
    },
    {

      description: "GDPR compliant from the ground up.",
      image: "/assets/trustSeurity/pic2.svg",
    },
    {

      description: "We never sell your data.",
      image: "/assets/trustSeurity/pic3.svg",
    },
  ];
  const features = [
    {
      title: "Chat With Your Documents",
      image: "/assets/getWithPro/Vector (3).png",
      description: "Upload legal documents and ask questions get answers based on what's actually in them.",
      extras: [
        "\"What's my earliest break clause?\"",
        "\"Does my contract mention damp issues?\""
      ]
    },
    {
      title: "Document Vault",
      image: "/assets/getWithPro/Vector (4).png",
      description: "Store, organize, and manage key property documents securely.",
      subText: "PDF, DOCX, JPG, PNG"
    },
    {
      title: "Notes & Organisation",
      image: "/assets/getWithPro/Vector (5).png",
      description: "Save unlimited notes and organise your conversations by topic, timeline, or property.",
    },
    {
      title: "Answers Shaped by You",
      image: "/assets/getWithPro/Vector (6).png",
      description: "Your assistant adapts to your preferences, communication style, and needs.",
    },
    {
      title: "Save Listings as You Browse",
      image: "/assets/getWithPro/Vector (7).png",
      description: "Bookmark homes from any property site and view them all on your dashboard.",
    },
    {
      title: "Budget Planner",
      image: "/assets/getWithPro/pic2.svg",
      description: "Easy to use calculator for estimating affordability and planning your budget.",
    },
  ];

  return (
    <div className="bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="flex items-center justify-center bg-white">
        <div className="relative w-full max-w-9xl h-[35vh] min-h-[35vh] overflow-hidden shadow-lg">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/howitworks/howitworks.png')" }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Explore Pro Features
            </h1>
            <p className="text-base md:text-xl max-w-xl">
              Your Home. Your Terms. Your Advantage.

            </p>
            <p className="text-base md:text-xl mt-4 max-w-xl">
              Get answers that draw on your actual documents, alerts before things go wrong, and guidance specific to your property.


            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-16 text-[#1a1a1a]">
            What You Get with Pro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-10">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:shadow-xl cursor-default"
              >
                <div className="flex justify-center mb-5">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-[#666666] text-[13px] leading-relaxed text-center px-2">
                  {feature.description}
                </p>

                {feature.subText && (
                  <p className="mt-3 text-[#999999] text-[11px] font-medium uppercase tracking-widest text-center">
                    {feature.subText}
                  </p>
                )}

                {feature.extras && (
                  <div className="mt-4 flex flex-col gap-1">
                    {feature.extras.map((extra, i) => (
                      <p key={i} className="text-[#999999] text-[12px] text-center italic">
                        {extra}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-[20px] md:text-[22px] font-medium text-[#00c0f9] mb-4">
            Upgrade for £8/month per property
          </h3>
          <p className="text-sm text-[#666666] mb-8">
            Everything you need to feel confident, organised, and informed about your property.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleStartFree}
              className="border border-[#00c0f9] text-[#00c0f9] px-6 py-2 rounded-md font-medium text-sm hover:bg-sky-50 transition-colors"
            >
              Start Free
            </button>
            <button
              className="bg-[#00c0f9] text-white px-6 py-2 rounded-md font-medium text-sm hover:bg-[#00b0e6] transition-colors flex items-center gap-2"
            >
              Upgrade to Pro
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#F4F9FF] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col items-center justify-center text-center mb-10 relative w-fit mx-auto">
            {/* Orange corner - top left of header */}
            <img
              src="/assets/orange.png"
              alt=""
              aria-hidden="true"
              className="absolute -top-6 -left-10 w-8 h-8"
            />

            <h2 className="text-2xl font-bold text-black mb-2">
              Trust & Security
            </h2>

            <p className="text-lg text-gray-600 relative">
              Your information stays yours. Always.
              {/* Blue corner - bottom right of paragraph */}
              <img
                src="/assets/blue.png"
                alt=""
                aria-hidden="true"
                className="absolute -bottom-6 -right-10 w-8 h-8"
              />
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <div
                key={`trust-item-${index}`}
                className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-50"
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-14 h-14 object-contain"
                  />
                </div>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
