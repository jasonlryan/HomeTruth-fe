export default function TrustSecurity() {
  const items = [
    {
      title: "Complete Records",
      description: "Your property history is permanent and tamper-proof.",
      image: "/assets/trustSeurity/pic1.svg",
    },
    {
      title: "GDPR Compliant",
      description: "Your privacy is built into how we work.",
      image: "/assets/trustSeurity/pic2.svg",
    },
    {
      title: "Your Privacy",
      description: "Your information stays yours, period.",
      image: "/assets/trustSeurity/pic3.svg",
    },
  ];

  return (
    <section className="bg-[#F4F9FF] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <h2 className="text-2xl font-bold text-black mb-2">
            Trust & Privacy
          </h2>

          <p className="text-lg text-gray-600">
            Your information stays yours. Always.
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

              {/* Title */}
              <h3 className="text-xl font-bold text-black mb-4">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
