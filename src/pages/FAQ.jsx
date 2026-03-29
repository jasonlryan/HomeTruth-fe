import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqItems = [
    {
      question: "What is HomeTruth?",
      answer: "HomeTruth is your personal property assistant designed to make homeownership easier and more efficient. We provide a comprehensive digital platform that serves as your 'single source of truth for your home,' offering guidance, document management, property insights, and much more."
    },
    {
      question: "How does HomeTruth help me manage my home?",
      answer: "HomeTruth helps you manage your home through multiple features: HomeTruth Assistant for instant property advice, Document Vault for secure storage of important documents, Personalized Insights & Alerts for proactive maintenance reminders, Property Value Tracking using market data, Smart Home Integration capabilities, Financial Management tools, and a Marketplace to connect with trusted service providers."
    },
    {
      question: "What makes HomeTruth different?",
      answer: "HomeTruth stands out through its hyper-personalised assistance that understands your motivations, fears, and preferences through attitudinal profiling. We offer comprehensive property management in one place, GDPR-compliant data handling, and proactive insights that help you make informed decisions about your home."
    },
    {
      question: "How does HomeTruth understand my needs?",
      answer: "HomeTruth uses attitudinal, motivational, and emotional profiling to understand your unique needs. Through conversations and your property data, it learns your preferences and provides personalised recommendations tailored specifically to your situation and goals."
    },
    {
      question: "Who is HomeTruth for?",
      answer: "HomeTruth is designed for all property stakeholders including homebuyers, homeowners, landlords, and investors. Whether you're a first-time buyer, experienced homeowner, or property investor, our platform adapts to your specific needs and provides relevant guidance and tools."
    },
    {
      question: "What are the subscription plans?",
      answer: "HomeTruth offers tiered subscription plans including Basic, Advanced, and Premium tiers with varying features and access levels. We also provide a free tier with basic chat features and limited note-saving capabilities. Premium features like full DocumentVault and document-aware chat are available with paid subscriptions."
    },
    {
      question: "How is my data kept secure?",
      answer: "Your data security is our top priority. All property and personal information is encrypted during transmission and storage. We are GDPR-compliant and follow strict data minimization principles, collecting only home-related data. Any data sharing with third parties is strictly opt-in and anonymized to protect your privacy."
    },
    {
      question: "What is the 'HomeTruth Report'?",
      answer: "The HomeTruth Report is a comprehensive analysis of your property that combines market data, your property details, and insights to provide you with actionable recommendations for maintenance, improvements, and financial opportunities. It helps you understand your property's current state and potential."
    },
    {
      question: "What is HomeTruth's long-term vision?",
      answer: "Our long-term vision is to become the essential digital companion for every property owner, creating a comprehensive ecosystem that simplifies homeownership. We aim to integrate with smart home technologies, expand our marketplace, and continuously improve our assistant to provide even more personalised and proactive property management solutions."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative py-20 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/assets/FAQ.png)' }}>
        <div className="absolute inset-0 bg-black/50 bg-opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Frequently Asked Questions (FAQ)
          </h1>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={`faq-${index}`} className="bg-white rounded-lg shadow-lg border border-gray-200">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-black">
                  {item.question}
                </span>
                {openItems[index] ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {openItems[index] && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="pt-4">
                    <p className="text-black leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Call-to-Action Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-xl font-bold text-black mb-3">
            Still have any questions?
          </h3>
          <p className="text-gray-600 mb-6">
            If you cannot find answer to your question in our FAQ, you can always
          </p>
          <a
            href="mailto:admin@hometruth.io"
            className="inline-block bg-customActiveText hover:bg-sky-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Contact us
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
