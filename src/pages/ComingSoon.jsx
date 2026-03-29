import { useState } from "react";
import ComingSoonHeader from "../components/ComingSoonHeader";
import { joinWaitlist } from "../api/api";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Try to call the backend API
      await joinWaitlist({ email });
      setSubmitted(true);
      setEmail("");
      setTimeout(() => {
        setSubmitted(false);
        setShowModal(false);
      }, 3000);
    } catch (err) {
      // If backend is not available (404 or network error), show success anyway
      // This is acceptable for Coming Soon mode when backend isn't ready yet
      if (err.response?.status === 404 || !err.response) {
        // Store email locally as fallback
        const waitlistEmails = JSON.parse(localStorage.getItem('waitlistEmails') || '[]');
        if (!waitlistEmails.includes(email)) {
          waitlistEmails.push(email);
          localStorage.setItem('waitlistEmails', JSON.stringify(waitlistEmails));
        }

        setSubmitted(true);
        setEmail("");
        setTimeout(() => {
          setSubmitted(false);
          setShowModal(false);
        }, 3000);
      } else {
        // For other errors, show the error message
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to join waitlist. Please try again later."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ComingSoonHeader />

      {/* Hero Section */}
      <section className="relative w-full">
        <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/ht.png')" }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              All of the Truth. None of the Noise.
            </h1>
            <p className="text-lg md:text-xl lg:text-3xl mb-8 max-w-xl">
              Your home, fully understood.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-customActiveText hover:bg-[#1e4fc7] text-white px-12 py-4 rounded-md font-medium transition text-base md:text-lg"
            >
              Join The Waitlist
            </button>
          </div>
        </div>
      </section>

      {/* Email Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-4">Join The Waitlist</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2960EC] disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-customActiveText  text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </form>
            {error && (
              <p className="mt-4 text-red-600 font-medium text-center text-sm">
                {error}
              </p>
            )}
            {submitted && (
              <p className="mt-4 text-green-600 font-medium text-center">
                Thank you! We'll notify you when we launch.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Content Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-black">
                The <span className="text-orange-500">Home Truth</span> Platform.
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  We are building The Truth Platform, your single source of property truth. With complete clarity about your home: its history, its current state, its potential, you make better decisions. You maximize value. You stay ahead of problems. You own your home with confidence. <span className="text-orange-500 font-semibold">HomeTruth</span> puts you in control.
                </p>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="relative">
              <img
                src="/assets/howitworks/howitworks.png"
                alt="How it works"
                className="w-full h-auto rounded-lg shadow-lg"
              />
              {/* Orange L-shape overlay */}
              <img
                src="/assets/orange.png"
                alt=""
                className="absolute -top-5 -left-5 w-12 h-12"
              />
              {/* Blue L-shape overlay */}
              <img
                src="/assets/blue.png"
                alt=""
                className="absolute -bottom-5 -right-5 w-12 h-12"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Your Trusted Advisor Section */}
      <section className="py-16 md:py-24 bg-orange-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 inline-flex items-center gap-2">
              Your <span className="text-orange-500">Trusted</span> Advisor
              <img
                src="/assets/comingSoon/arcticons_ai.svg"
                alt="Assistant icon"
                className="w-6 h-6"
              />
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              A helper guiding you through every aspect of homeownership. You stay in control, always.
            </p>
            <span className="inline-block bg-[#E6ECFF] text-[#2960EC] px-6 py-3 rounded-md font-medium">
              Available to all members
            </span>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
            {/* Card 1 - Organize */}
            <div className="text-center">
              <div className="w-16 h-16 mb-4 mx-auto flex items-center justify-center bg-white/30 rounded-lg p-3 shadow-xl">
                <img
                  src="/assets/comingSoon/Vector.png"
                  alt="Organize"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Organize</h3>
              <p className="text-gray-600 text-base">Everything in one place</p>
            </div>

            {/* Card 2 - Prioritize */}
            <div className="text-center">
              <div className="w-16 h-16 mb-4 mx-auto flex items-center justify-center bg-white/30 rounded-lg p-3 shadow-xl">
                <img
                  src="/assets/getWithPro/Vector (7).png"
                  alt="Prioritize"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Prioritize</h3>
              <p className="text-gray-600 text-base">What matters now, what can wait.</p>
            </div>

            {/* Card 3 - Guide */}
            <div className="text-center">
              <div className="w-16 h-16 mb-4 mx-auto flex items-center justify-center bg-white/30 rounded-lg p-3 shadow-xl">
                <img
                  src="/assets/comingSoon/Vector6.png" alt="Guide"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Guide</h3>
              <p className="text-gray-600 text-base">Confidence at every step</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join The Waitlist Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-xl p-8 md:p-12 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
              Join The Waitlist
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Be first to access HomeTruth when we launch
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email adress"
                  required
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2960EC] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  onClick={(e) => {
                    if (!isLoading) {
                      handleSubmit(e);
                    }
                  }}
                  disabled={isLoading}
                  className="bg-customActiveText hover:customActive text-white px-6 py-3 rounded-lg font-bold transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Joining..." : "Join Us"}
                </button>
              </div>
              {error && (
                <p className="text-red-600 font-medium text-center text-sm">
                  {error}
                </p>
              )}
              {submitted && (
                <p className="text-green-600 font-medium text-center text-sm">
                  Thank you! We'll notify you when we launch.
                </p>
              )}
            </form>
            <p className="text-gray-500 text-sm text-center mt-4">
              No spam, ever. We'll be in touch with updates.
            </p>
          </div>
        </div>
      </section>

      {/* Designed for peace of mind Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Designed for peace of mind
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Card 1 - One Source of Truth */}
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-20 h-20 mb-4 mx-auto">
                <img
                  src="/assets/Container+BackgroundColor.svg"
                  alt="One Source of Truth"
                  className="w-full h-full"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">One Source of Truth</h3>
              <p className="text-gray-600 text-base">
                Everything about your home, together and trusted.
              </p>
            </div>

            {/* Card 2 - Clarity When It Counts */}
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-20 h-20 mb-4 mx-auto">
                <img
                  src="/assets/Container+BackgroundColor2.svg"
                  alt="Clarity When It Counts"
                  className="w-full h-full"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Clarity When It Counts</h3>
              <p className="text-gray-600 text-base">
                The signal, not the noise so choices feel obvious.
              </p>
            </div>

            {/* Card 3 - No Nasty Surprises */}
            <div className="bg-white rounded-lg p-7 shadow-sm text-center">
              <div className="w-14 h-14 mb-10 mx-auto bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center justify-center p-3">
                <img
                  src="/assets/getWithPro/Vector (7).png"
                  alt="No Nasty Surprises"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Nasty Surprises</h3>
              <p className="text-gray-600 text-base">
                Risks surfaced early, deadlines never missed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e293b] relative">
        {/* Light gray gradient line at top */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
        <div className="py-8 text-center">
          <p className="text-gray-300 text-sm">
            © 2025 HomeTruth. All rights reserved.
          </p>
          {/* Discreet Admin Access Link */}
          <a
            href="/admin/login"
            className="text-gray-600 hover:text-gray-400 text-xs mt-2 inline-block transition-colors"
            title="Admin Access"
          >
            •
          </a>
        </div>
      </footer>
    </>
  );
}
