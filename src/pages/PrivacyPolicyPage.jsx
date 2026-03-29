// src/pages/PrivacyPolicyPage.jsx
import ArrowBullet from "../components/ArrowBullet";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex-1">
        <div className="max-w-[1344px] mx-auto px-6 sm:px-12 lg:px-16 xl:px-20 2xl:px-24 py-12 text-gray-800">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

      {/* I. Introduction */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          I. Introduction & Our Commitment to Your Privacy
        </h2>
        <p>
          At{" "}
          <a href="/" className="font-semibold text-customActiveText hover:underline">
            HomeTruth
          </a>
          , we are committed to being your trusted Personal Property Assistant,
          guiding you through every stage of homeownership with clarity and
          confidence.To deliver this hyper-personalised experience, we collect
          and analsze data about your property and, more importantly, about you
          – your motivations, attitudes, and emotions related to your homeYour
          privacy is paramount, and we build trust by prioritising transparency,
          ethical data practices, and robust security measures.
        </p>
      </section>

      {/* II. What Information We Collect */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          II. What Information We Collect
        </h2>
        <p className="text-xl mb-2 font-semibold">
          We collect information to create your unique “3D Human Blueprint”,
          which includes:
        </p>
        <ArrowBullet>
          Personal and Property Data: Information you provide during account
          creation (e.g., email), details about your property (location, size,
          age), and documents you upload (deeds, mortgage agreements, surveys,
          EPCs, appliance manuals, insurance policies). This forms your home’s
          “digital twin” or “service log”.
        </ArrowBullet>
        <ArrowBullet>
          Financial Information: Data related to your property finances, such as
          budgeting, expenses, utility bills, mortgage terms, property taxes,
          and insurance. This may extend to financial anxieties or investment
          goals.
        </ArrowBullet>
        <ArrowBullet>
          Interaction Data: How you interact with our platform. This helps us
          understand your preferences and needs.
        </ArrowBullet>
        <ArrowBullet>
          Service History: Records of maintenance tasks, service schedules, and
          interactions with contractors through the platform.{" "}
        </ArrowBullet>
      </section>

      {/* III. How We Use Your Information */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          III. How We Use Your Information
        </h2>
        <p className="text-xl mb-2 font-semibold">We use your data to:</p>
        <ArrowBullet>
          Provide Personalised Guidance: To offer hyper-personalised property
          recommendations, tailored advice, dynamic checklists, custom learning
          paths, and adaptive content based on your unique profile.{" "}
        </ArrowBullet>
        <ArrowBullet>
          Offer Proactive Support: To anticipate your needs and provide timely
          alerts for maintenance, compliance, deadlines, and financial
          opportunities (e.g., refinancing or investment upgrades).{" "}
        </ArrowBullet>
        <ArrowBullet>
          Match You with Services: To connect you with pre-vetted service
          providers (contractors), mortgage deals, and insurance products that
          align with your risk profile, lifestyle, and financial priorities.{" "}
        </ArrowBullet>
        <ArrowBullet>
          Enhance Property Value: To help you track and potentially increase
          your property’s worth, plan improvements, and optimize your finances.
        </ArrowBullet>
        <ArrowBullet>
          Improve Our Services: To continuously refine our services and
          platform features based on user interactions and feedback.
        </ArrowBullet>
        <ArrowBullet>
          Ensure Security & Compliance: To protect your data, detect fraudulent
          activities, and maintain compliance with legal and regulatory
          standards.
        </ArrowBullet>
      </section>

      {/* IV. Sharing Your Information */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          IV. How We Share Your Information
        </h2>
        <ArrowBullet>
          Aggregated and Anonymised Insights: We may license aggregated and
          anonymised psychographic trends and insights to third parties, such as
          mortgage lenders, insurers, property developers, and marketers. This
          data helps them tailor products and services to deeply understood
          consumer segments.
        </ArrowBullet>
        <ArrowBullet>
          Strict Opt-In Consent: All data-sharing with third parties is strictly
          opt-in and anonymised to ensure your trust and compliance with GDPR.
          We are committed to never selling individual user data.
        </ArrowBullet>
        <ArrowBullet>
          Service Provider Matching: Limited relevant profile data may be shared
          with pre-vetted service providers you choose to engage with, to
          facilitate better matches. You will have controls to manage what
          information is shared.
        </ArrowBullet>
      </section>

      {/* V. Your Rights & Controls */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          V. Your Rights & Controls
        </h2>
        <p className="text-xl mb-2 font-semibold">
          You have full control over your data:{" "}
        </p>
        <ArrowBullet>
          Transparency: We provide clear explanations of how your data shapes
          recommendations (“Why this match?“).
        </ArrowBullet>
        <ArrowBullet>
          Consent Management: You can manage your privacy settings and
          granularly opt-out of data sharing categories.
        </ArrowBullet>
        <ArrowBullet>
          Access, Correction, & Deletion: You can easily access, correct, or
          delete your personal data and even reset your inferred profile data.
        </ArrowBullet>
        <ArrowBullet>
          Exportable Data: You can download your interaction history and
          documents.
        </ArrowBullet>
      </section>

      {/* VI. How We Protect Your Information */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          VI. How We Protect Your Information
        </h2>
        <p className="text-xl mb-2 font-semibold">
          We implement robust security measures:
        </p>
        <ArrowBullet>
          Encryption: All sensitive information is encrypted at rest and in
          transit (using industry standards like AES and TLS 1.3).
        </ArrowBullet>
        <ArrowBullet>
          Access Controls: We use role-based access control (RBAC) and
          multi-factor authentication (MFA) to secure your account and manage
          data access.{" "}
        </ArrowBullet>
        <ArrowBullet>
          Data Minimisation: We only collect home-centric data relevant to
          providing our service, avoiding u nnecessary personal or overly
          sensitive information.{" "}
        </ArrowBullet>
        <ArrowBullet>
          Security Audits: We conduct regular security audits and maintain a
          clear data breach response plan.
        </ArrowBullet>
      </section>

      {/* VII. Regulatory Compliance */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          VII. Regulatory Compliance
        </h2>
        <p>
          <a href="/" className="font-semibold text-customActiveText hover:underline">
            HomeTruth
          </a>{" "}
          is fully committed to complying with all relevant data protection
          regulations, including GDPR and CCPA. We also adhere to real estate
          and licensing laws relevant to our operations. For features involving
          financial data, we will utilise secure Open Banking authentication
          while ensuring no sensitive data is stored unnecessarily.
        </p>
      </section>

      {/* VIII. Changes to This Policy */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          VIII. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes
          in our practices or legal requirements. We will notify you of any
          significant changes.
        </p>
      </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
