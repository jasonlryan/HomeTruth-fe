export default function HowItWorks() {
  const steps = [
    {
      title: "Add Your Property",
      description:
        "Start with your address. We'll pull in the basics.",
      image: "/assets/trustSeurity/Vector (1).svg",
    },
    {
      title: "Upload Your Records",
      description:
        "Add documents, receipts, photos. Everything that matters about your property.",
      image: "/assets/trustSeurity/Vector (2).svg",
    },
    {
      title: "Ask Questions",
      description:
        "Get answers specific to your property not generic advice.",
      image: "/assets/trustSeurity/Vector (3).svg",
    },
    {
      title: "Stay Proactive",
      description:
        "We'll tell you what's coming up, what to watch, what matters.",
      image: "/assets/trustSeurity/Vector (4).svg",
    },
  ];

  return (
    <section id="how-it-works" className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <h2 className="text-2xl font-bold text-black mb-2">
            How It Works
          </h2>

          <p className="text-lg text-gray-600">
            Four steps to real answers about your property
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={`step-${index}`}
              className="p-6 text-center hover:shadow-xl transition-shadow"
            >
              {/* Icon - all steps now use bg container */}
              <div className="flex justify-center mb-6 h-20 items-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-black mb-4">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
