import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'welcome',
        'account-responsibilities',
        'our-services',
        'subscription-plans',
        'content-privacy',
        'ai-guidance',
        'termination',
        'changes-terms',
        'governing-law'
      ];

      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(i + 1);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-8xl mx-auto pl-8 ">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 pt-8">
              <h2 className="text-2xl font-bold text-black mb-6">
                Table of Contents
              </h2>
              <nav className="space-y-2">
                <div className={`p-2 rounded-lg transition-colors ${activeSection === 1 ? "bg-customActiveText text-white" : "text-black text-sm hover:bg-gray-100"
                  }`}>
                  1. Your Account & Responsibilities
                </div>
                <div className={`p-2 rounded-lg transition-colors ${activeSection === 2 ? "bg-customActiveText text-white" : "text-black text-sm hover:bg-gray-100"
                  }`}>
                  2. Our Services
                </div>
                <div className={`p-2 rounded-lg transition-colors ${activeSection === 3 ? "bg-customActiveText text-white" : "text-black text-sm hover:bg-gray-100"
                  }`}>
                  3. Subscription Plans & Payments
                </div>
                <div className={`p-2 rounded-lg transition-colors ${activeSection === 4 ? "bg-customActiveText text-white" : "text-black text-sm hover:bg-gray-100"
                  }`}>
                  4. Your Content & Data Privacy
                </div>
                <div className={`p-2 rounded-lg transition-colors ${activeSection === 5 ? "bg-customActiveText text-white" : "text-black text-sm hover:bg-gray-100"
                  }`}>
                  5. Guidance & Third-Party Services Disclaimer
                </div>
                <div className={`p-2 rounded-lg transition-colors ${activeSection === 6 ? "bg-customActiveText text-white" : "text-black text-sm hover:bg-gray-100"
                  }`}>
                  6. Termination
                </div>
                <div className={`p-2 rounded-lg transition-colors ${activeSection === 7 ? "bg-customActiveText text-white" : "text-black text-sm hover:bg-gray-100"
                  }`}>
                  7. Changes to These Terms
                </div>
                <div className={`p-2 rounded-lg transition-colors ${activeSection === 8 ? "bg-customActiveText text-white" : "text-black text-sm hover:bg-gray-100"
                  }`}>
                  8. Governing Law
                </div>
              </nav>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-3 bg-neutral-100 p-8 rounded-lg">
            <h1 className="text-2xl font-bold text-black mb-8">
              Terms Of Service
            </h1>

            {/* Welcome Section */}
            <div id="welcome" className="mb-12">
              <h2 className="text-base font-bold text-customActiveText mb-4">
                Welcome to HomeTruth!
              </h2>
              <p className="text-gray-700 text-xl max-w-6xl leading-relaxed">
                HomeTruth is your Personal Property Assistant. Our mission is to make homeownership easier and more efficient for everyone. We provide a comprehensive digital platform designed to streamline every aspect of home management, serving as the "single source of truth for your home"          </p>
            </div>

            {/* Section 1: Your Account & Responsibilities */}
            {/* Section 1: Your Account & Responsibilities */}
            <div id="account-responsibilities" className="mb-12">
              <h2 className="text-base font-bold text-black mb-6">
                I. Your Account & Responsibilities
              </h2>

              <div className="space-y-3 text-sm leading-6 text-black">
                <p>
                  Account Creation <br></br>
                  You will create a secure account using your email and a password. You may select a role (e.g., homeowner, contractor) during initial setup.
                </p>

                <p>
                  User Verification <br></br>
                  We may ask you to verify your email or undergo other verification processes to ensure the authenticity of your account or services.
                </p>

                <p>
                  Your Information <br></br>
                  You are responsible for providing accurate and up-to-date property details and other information.
                </p>

                <p>
                  Security <br></br>
                  You are responsible for keeping your account login details secure. We offer multi-factor authentication (MFA) for added security.
                </p>

                <p>
                  Respectful Use <br></br>
                  You agree to use HomeTruth lawfully and respectfully. Contractors must comply with platform standards and homeowner expectations.
                </p>
              </div>
            </div>

            {/* Section 2: Our Services */}
            <div id="our-services" className="mb-12">
              <h2 className="text-base font-bold text-black mb-6">
                2. Our Services
              </h2>

              <p className="text-black text-sm leading-relaxed mb-6 max-w-4xl">
                HomeTruth offers tailored tools for homebuyers, homeowners, landlords, and investors, delivering proactive insights, task automation, and seamless access to essential documents and data.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-customActive rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-customActiveText text-sm font-bold">&gt;</span>
                  </div>
                  <div>
                    <p className="text-black text-sm leading-relaxed">
                      <span className="font-bold">HomeTruth Assistant:</span> Our assistant provides instant, authoritative answers to homeownership questions. It is designed to understand your motivations, fears, and preferences through attitudinal, motivational, and emotional profiling to offer hyper-personalised guidance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-customActive rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-customActiveText text-sm font-bold">&gt;</span>
                  </div>
                  <div>
                    <p className="text-black text-sm leading-relaxed">
                      <span className="font-bold">Document Vault:</span> You can securely store and manage important property documents like deeds, contracts, warranties, and manuals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-customActive rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-customActiveText text-sm font-bold">&gt;</span>
                  </div>
                  <div>
                    <p className="text-black text-sm leading-relaxed">
                      <span className="font-bold">Personalised Insights & Alerts:</span> HomeTruth generates "Insights" from your conversations and uploaded documents, providing proactive reminders for maintenance, compliance deadlines, and financial opportunities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-customActive rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-customActiveText text-sm font-bold">&gt;</span>
                  </div>
                  <div>
                    <p className="text-black text-sm leading-relaxed">
                      <span className="font-bold">Property Value Tracking:</span> Access tools and analytics to assess and track your property's value based on market data and trends.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-customActive rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-customActiveText text-sm font-bold">&gt;</span>
                  </div>
                  <div>
                    <p className="text-black text-sm leading-relaxed">
                      <span className="font-bold">Smart Home Integration:</span> You can integrate and manage various smart home technologies.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-customActive rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-customActiveText text-sm font-bold">&gt;</span>
                  </div>
                  <div>
                    <p className="text-black text-sm leading-relaxed">
                      <span className="font-bold">Financial Management:</span> Tools for budgeting, expense tracking, and managing property-related financial transactions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-customActive rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-customActiveText text-sm font-bold">&gt;</span>
                  </div>
                  <div>
                    <p className="text-black text-sm leading-relaxed">
                      <span className="font-bold">Marketplace:</span> An integrated marketplace to find, compare, and book trusted contractors and service providers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Subscription Plans & Payments */}
            <div id="subscription-plans" className="mb-12">
              <h2 className="text-base font-bold text-black mb-6">
                3. Subscription Plans & Payments
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-black mb-2">Tiers</h3>
                  <p className="text-black text-sm leading-relaxed">
                    HomeTruth offers tiered subscription plans (Basic, Advanced, Premium) with varying features and access levels.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-black mb-2">Free Access</h3>
                  <p className="text-black text-sm leading-relaxed">
                    A free tier allows access to basic chat features and the ability to save a limited number of responses.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-black mb-2">Upgrades</h3>
                  <p className="text-black text-sm leading-relaxed">
                    Certain features, like the full DocumentVault or document-aware chat, are available with a paid subscription (e.g., Pro features).
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-black mb-2">Marketplace Fees</h3>
                  <p className="text-black text-sm leading-relaxed">
                    We may earn fees from service providers through our marketplace, or from financial institutions for aggregated, anonymized data insights.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-black mb-2">Blockchain Fees</h3>
                  <p className="text-black text-sm leading-relaxed">
                    HomeTruth covers any minuscule blockchain network fees, so users never touch crypto tokens.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: Your Content & Data Privacy */}
            <div id="content-privacy" className="mb-12">
              <h2 className="text-base font-bold text-black mb-6">
                4. Your Content & Data Privacy
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-black mb-2">Your Content</h3>
                  <p className="text-black text-sm leading-relaxed">
                    You retain ownership of documents and data you upload. By using our services, you grant HomeTruth a license to use this data to provide and improve our services to you.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-black mb-2">Data Privacy</h3>
                  <p className="text-black text-sm leading-relaxed">
                    We are committed to protecting your privacy. Your property and personal information is encrypted during transmission and storage.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-black mb-2">GDPR Compliant</h3>
                  <p className="text-black text-sm leading-relaxed">
                    Our data handling practices are GDPR-compliant.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-black mb-2">Opt-In Data Sharing</h3>
                  <p className="text-black text-sm leading-relaxed">
                    Any sharing of your profiling data with third parties (e.g., mortgage lenders, insurers) is strictly opt-in and anonymized to ensure your trust. We offer privacy controls, allowing you to manage who views your information.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-black mb-2">Data Minimization</h3>
                  <p className="text-black text-sm leading-relaxed">
                    We collect only home-related data and avoid inferring sensitive traits unless explicitly shared.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-black mb-2">Transparency</h3>
                  <p className="text-black text-sm leading-relaxed">
                    We aim to be transparent about how your data shapes recommendations (e.g., a "Why This Match?" explanation feature).
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: Guidance & Third-Party Services Disclaimer */}
            <div id="ai-guidance" className="mb-12">
              <h2 className="text-base font-bold text-black mb-6">
                5. Guidance & Third-Party Services Disclaimer
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-black mb-2">HomeTruth as your Assistant</h3>
                  <p className="text-black text-sm leading-relaxed">
                    HomeTruth is designed to be a personal property assistant, coach, negotiator, and strategist. It provides personalised insights and recommendations to empower your decisions.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-black mb-2">Not Professional Advice</h3>
                  <p className="text-black text-sm leading-relaxed">
                    Our guidance is for informational purposes only and should not be considered professional legal, financial, or real estate advice. Always consult with qualified professionals for specific situations.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-black mb-2">Third-Party Services</h3>
                  <p className="text-black text-sm leading-relaxed">
                    Our marketplace connects you with pre-vetted service providers. While we implement verification processes and monitor service quality, HomeTruth is not responsible for the services provided by third-party contractors or financial institutions. Contractors may be required to post a bond, which may be forfeited if their work is flagged as bogus.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-black mb-2">Third-Party Links</h3>
                  <p className="text-black text-sm leading-relaxed">
                    Our platform may include links to third-party websites or services. We are not responsible for the content or privacy practices of these external sites.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 6: Termination */}
            <div id="termination" className="mb-12">
              <h2 className="text-base font-bold text-black mb-6">
                6. Termination
              </h2>
              <p className="text-black text-xl max-w-6xl leading-relaxed">
                You can delete your account at any time. Under GDPR, you have the right to access, correct, or delete your data.
                HomeTruth reserves the right to suspend or terminate your account if you violate these terms or engage in harmful activities.
              </p>
            </div>

            {/* Section 7: Changes to These Terms */}
            <div id="changes-terms" className="mb-12">
              <h2 className="text-base font-bold text-black mb-6">
                7. Changes to These Terms
              </h2>
              <p className="text-black text-sm leading-relaxed max-w-5xl">
                We may update these Terms of Service from time to time. We will notify you of significant changes. Your continued use of HomeTruth after changes means you accept the new terms.          </p>
            </div>

            {/* Section 8: Governing Law */}
            <div id="governing-law" className="mb-12">
              <h2 className="text-base font-bold text-black mb-6">
                8. Governing Law
              </h2>
              <p className="text-black text-sm leading-relaxed">
                These Terms of Service are governed by the laws of England and Wales.          </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
