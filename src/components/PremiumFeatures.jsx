export default function PremiumFeatures() {
  const features = [
    {
      title: "Upload Property Document",
      description:
        "Upload contracts, surveys, and legal documents for analysis and explanation in plain English.",
      image: "/assets/premiumFeatur/upload.png", // put this in public/assets/
    },
    {
      title: "Generate Legal Checklist",
      description:
        "Get personalized checklists for your property journey, from viewing to completion.",
      image: "/assets/premiumFeatur/checklist.png",
    },
    {
      title: "Get Document-Based Answers",
      description:
        "Ask specific questions about your uploaded documents and get precise answers.",
      image: "/assets/premiumFeatur/answers.png",
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-12">
          Premium Features
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={`premium-feature-${index}`}
              className="relative bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              {/* PRO label */}
              <div className="absolute top-4 right-4 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                PRO
              </div>

              {/* Feature Image */}
              <img
                src={feature.image}
                alt={feature.title}
                className="w-16 h-16 mx-auto mb-4"
              />

              <h3 className="text-lg  font-extrabold text-darkGrey mb-2">
                {feature.title}
              </h3>

              <p className="text-sm text-lightGrey mb-6">{feature.description}</p>

              <button className="bg-primary hover:bg-[#4a30d6] text-white text-sm px-4 py-2 rounded-md font-medium transition">
                Unlock with Pro
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
