import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutUs() {
  // eslint-disable-next-line no-unused-vars -- used in commented-out section below
  const problems = [
    {
      title: "Outdated Models",
      description: "Current methods often miss the behavioral, focusing only on demographics or static credit scores.",
      icon: "/assets/trustSeurity/pic1.svg",
    },
    {
      title: "Widespread Regret",
      description: "A significant 68% of buyers regret their purchase decisions due to misaligned expectations",
      icon: "/assets/trustSeurity/pic2.svg",
    },
    {
      title: "Inefficient Processes",
      description: "Homeowners struggle with managing maintenance, finances, and compliance",
      icon: "/assets/trustSeurity/pic3.svg",
    },
    {
      title: "Fragmented Information",
      description: "Preventing homeowners from effectively maintaining and enhancing their property's value",
      icon: "/assets/trustSeurity/pic1.svg",
    },
  ];

  // eslint-disable-next-line no-unused-vars -- used in commented-out section below
  const solutions = [
    {
      title: "Comprehensive Home Management",
      description: "We are creating a single, centralised hub for all property documents, maintenance records, contractor details, and smart home device integrations",
      icon: "/assets/trustSeurity/pic1.svg",
    },
    {
      title: "Property insights",
      description: "We offer proactive property management alerts, actionable financial opportunities, and dynamic suggestions for cost savings or investment upgrades",
      icon: "/assets/trustSeurity/pic2.svg",
    },
    {
      title: "Trusted Marketplace",
      description: "Connect with pre-vetted service providers and tailored financial offers. What Makes Us Unique",
      icon: "/assets/trustSeurity/pic3.svg",
    },
  ];

  return (
    <div className="bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="w-full flex items-center justify-center bg-white">
        <div className="relative w-full max-w-9xl h-[40vh] min-h-[380px] overflow-hidden shadow-lg">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/aboutUs.png')" }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Property Intelligence for Everyone
            </h1>
            <p className="text-base md:text-xl max-w-5xl">
              Every property decision made with real intelligence, not guesswork.

            </p>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className=" md:py-16 bg-white flex items-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            <span className="text-[#00c0f9] text-sm font-bold uppercase tracking-[0.2em] mb-6 block">
              OUR MISSION
            </span>
            <h2 className="text-[32px] md:text-medium font-bold text-[#1a1a1a] leading-[1.2] mb-10">
              We help people make better property decisions <br className="hidden md:block" />
              by giving them real answers.
            </h2>
            <div className="space-y-8 text-[#666666] text-lg md:text-xl leading-relaxed max-w-3xl">
              <p>
                Specific to their property. Specific to their situation. Specific to their goals.
              </p>
              <p>
                Not generic advice. Not forum posts from 2019. Actual guidance <br className="hidden md:block" />
                you can act on for buying, owning, or renting out property.
              </p>
              <p>
                We're the assistant who actually knows your property and tells you what you need to know before you need to know it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem We Solve Section */}
      {/* <section className="py-16 md:py-24 bg-white">
        <div className="max-w-8xl mx-auto px-40">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-black">
            The Problem We Solve
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {problems.map((problem, index) => (
              <div
                key={`problem-${index}`}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-center mb-6">
                  <img
                    src={problem.icon}
                    alt={problem.title}
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-black mb-4 text-center">
                  {problem.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-center">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* What We Believe Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-medium text-[#1a1a1a] mb-10 text-left">
            What We Believe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {/* Belief 1 */}
            <div className="bg-white p-6 rounded-lg border border-[#f0f0f0] border-l-4 border-l-[#00c0f9] flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <img src="/assets/AboutUs/Vector (5).svg" alt="" className="w-7 h-7 object-contain" />
                <h3 className="text-base text-[#1a1a1a]">Real Answers Over Easy Answers</h3>
              </div>
              <p className="text-[#666666] text-sm leading-relaxed">
                We don't tell you what you want to hear. We tell you what you need to know.
              </p>
            </div>

            {/* Belief 2 */}
            <div className="bg-white p-6 rounded-lg border border-[#f0f0f0] border-l-4 border-l-[#fd6916] flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <img src="/assets/AboutUs/Vector (1).svg" alt="" className="w-7 h-7 object-contain" />
                <h3 className="text-base text-[#1a1a1a]">Clarity Over Complexity</h3>
              </div>
              <p className="text-[#666666] text-sm leading-relaxed">
                Property is complicated. Our answers aren't.
              </p>
            </div>

            {/* Belief 3 */}
            <div className="bg-white p-6 rounded-lg border border-[#f0f0f0] border-l-4 border-l-[#c084fc] flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <img src="/assets/AboutUs/Vector (2).svg" alt="" className="w-7 h-7 object-contain" />
                <h3 className="text-base text-[#1a1a1a]">Proactive Over Reactive</h3>
              </div>
              <p className="text-[#666666] text-sm leading-relaxed">
                We tell you what's coming before it becomes a crisis.
              </p>
            </div>

            {/* Belief 4 */}
            <div className="bg-white p-6 rounded-lg border border-[#f0f0f0] border-l-4 border-l-[#22c55e] flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <img src="/assets/AboutUs/Vector (6).svg" alt="" className="w-7 h-7 object-contain" />
                <h3 className="text-base text-[#1a1a1a]">Evidence Over Opinion</h3>
              </div>
              <p className="text-[#666666] text-sm leading-relaxed">
                Our guidance is based on your property's actual data, not guesses.
              </p>
            </div>

            {/* Belief 5 */}
            <div className="bg-white p-6 rounded-lg border border-[#f0f0f0] border-l-4 border-l-[#00c0f9] flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <img src="/assets/AboutUs/Vector.svg" alt="" className="w-7 h-7 object-contain" />
                <h3 className="text-base text-[#1a1a1a]">Accessible Over Exclusive</h3>
              </div>
              <p className="text-[#666666] text-sm leading-relaxed">
                Good property intelligence shouldn't be only for people who can afford advisors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We're Different Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl text-[#1a1a1a] mb-12 text-left">
            How We're Different
          </h2>
          <div className="space-y-0">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] items-center py-8 border-b border-[#f0f0f0]">
              <div className="flex flex-col items-start gap-3 mb-6 md:mb-0">
                <div className="w-7 h-7 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00c0f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[#1a1a1a]">Specific, not generic</span>
              </div>
              <p className="text-[#666666] text-base leading-relaxed">
                Every answer is about your property, your situation, your data. Not someone else's experience on a forum.
              </p>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] items-center py-8 border-b border-[#f0f0f0]">
              <div className="flex flex-col items-start gap-3 mb-6 md:mb-0">
                <div className="w-7 h-7 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fd6916" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[#1a1a1a]">Proactive, not reactive</span>
              </div>
              <p className="text-[#666666] text-base leading-relaxed">
                We tell you what's coming up before you have to ask. The best guidance arrives before the problem does.
              </p>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] items-center py-8 border-b border-[#f0f0f0]">
              <div className="flex flex-col items-start gap-3 mb-6 md:mb-0">
                <div className="w-7 h-7 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[#1a1a1a]">Real answers, not opinions</span>
              </div>
              <p className="text-[#666666] text-base leading-relaxed">
                Our guidance is grounded in your property's actual history and data. Not what worked for someone else's house.
              </p>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] items-center py-8">
              <div className="flex flex-col items-start gap-3">
                <div className="w-7 h-7 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[#1a1a1a]">Gets better over time</span>
              </div>
              <p className="text-[#666666] text-base leading-relaxed">
                The more you use HomeTruth, the more it understands your property. Your records grow, and so does the quality of your guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution Section */}
      {/* <section className="py-16 md:py-24 bg-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-black">
            Our Solution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <div
                key={`solution-${index}`}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-center mb-6">
                  <img
                    src={solution.icon}
                    alt={solution.title}
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-black mb-4 text-center">
                  {solution.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-center">
                  {solution.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* What Makes Us Unique Section */}
      {/* <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl text-black mb-4">
                  What Makes Us Unique
                </h2>
                <h3 className="text-xl text-gray-600 ">
                  Three Unique Ingredients
                </h3>
                <p className="text-xl text-gray-700 leading-relaxed">
                  HomeTruth carves out a unique space in the PropTech market by fusing three ingredients that our competitors do not combine
                </p>
              </div>

              <div className="space-y-6">
             
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 relative">
                   
                    <div className="absolute inset-0 w-12 h-12 bg-customActive rounded-full"></div>
                  
                    <div className="relative w-8 h-8 bg-customActiveText rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl text-black mb-2">
                      Behavioural coach
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      Our engine converts your home data into personalised financial actions, helping you squeeze extra equity, cheaper insurance, and faster mortgages from your home's evidence.
                    </p>
                  </div>
                </div>

             
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 relative">
                   
                    <div className="absolute inset-0 w-12 h-12 bg-customActive rounded-full"></div>
                  
                    <div className="relative w-8 h-8 bg-customActiveText rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl text-black mb-2">
                      Tamper-Evident Blockchain Ledger
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      We offer a cryptographically-sealed chain of custody for all works and events, ensuring immutable, verified provenance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

           
            <div className="relative">
              <img
                src="/assets/aboutUs.png"
                alt="What Makes Us Unique Visual"
                className="w-full h-auto rounded-lg shadow-lg"
              />
             
              <img
                src="/assets/orange.png"
                alt=""
                className="absolute -top-4 -left-4 w-8 h-8"
              />
           
              <img
                src="/assets/blue.png"
                alt=""
                className="absolute -bottom-4 -right-4 w-8 h-8"
              />
            </div>
          </div>
        </div>
      </section> */}

      {/* Why This Matters Section */}
      <section className="py-16 md:py-24 bg-white bg-[#f9fafb]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-medium text-[#1a1a1a] mb-16 text-left">
            Why This Matters
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <span className="text-[40px] md:text-[54px] font-bold text-[#fd6916] leading-none mb-4 block">63%</span>
              <p className="text-[#666666] text-xs md:text-sm leading-relaxed px-2">
                of first-time buyers regret their purchase
              </p>
            </div>
            <div className="text-center">
              <span className="text-[40px] md:text-[54px] font-bold text-[#00c0f9] leading-none mb-4 block">42%</span>
              <p className="text-[#666666] text-xs md:text-sm leading-relaxed px-2">
                say costs were higher than expected
              </p>
            </div>
            <div className="text-center">
              <span className="text-[40px] md:text-[54px] font-bold text-[#c084fc] leading-none mb-4 block">£40K</span>
              <p className="text-[#666666] text-xs md:text-sm leading-relaxed px-2">
                potential penalties landlords face for non-compliance
              </p>
            </div>
            <div className="text-center">
              <span className="text-[40px] md:text-[54px] font-bold text-[#22c55e] leading-none mb-4 block">37%</span>
              <p className="text-[#666666] text-xs md:text-sm leading-relaxed px-2">
                rise in maintenance costs since 2020
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New Gradient CTA Section */}
      <section className="w-full bg-gradient-to-r from-[#fd6916] via-[#e27687] to-[#c084fc] py-16 md:py-20 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 tracking-tight">
          Start Making Better Property Decisions
        </h2>
        <p className="text-white/90 text-lg mb-10">
          Free to start. No credit card required.
        </p>

        <button
          className="bg-white text-[#fd6916] rounded-lg py-3 px-8 text-base font-semibold flex items-center gap-2 cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-px hover:shadow-lg"
          onClick={() => window.location.href = '/register'}
        >
          Get Started Free
          <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </section>

      <Footer />
    </div>
  );
}
