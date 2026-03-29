import Navbar from "../components/Navbar";
import AiAssistant from "../components/Aiassistant";
import HowItWorks from "../components/HowItWorks";
import WhoWeHelp from "../components/WhoWeHelp";
import TrustSecurity from "../components/TrustSecurity";
import CallToAction from "../components/CallToAction";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";
export default function Landing() {

  return (
    <>
      {/* Navbar at the top */}
      <Navbar />

      {/* Hero Section (keep your edit) */}
      <section className="flex items-center justify-center mt-5  bg-white">
        <div className="relative w-[95%] max-w-9xl h-[40vh] min-h-[380px] overflow-hidden shadow-2xl rounded-lg">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/ht.png')" }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
            <h1 className="text-3xl md:text-4xl font-medium mb-4">
              Your Property Intelligence Platform
            </h1>
            <p className="text-base md:text-xl max-w-xl">
              Real answers for your property decisions.

            </p>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden py-5  bg-[#F3F7FD]">
        <div className=" w-full relative mx-auto max-w-xl px-6 my-5 text-center">
          {/* Orange corner (top-left) */}
          {/* <img
            src="/assets/orange.png"
            alt=""
            aria-hidden="true"
            className="absolute -top-3 -left-2 md:-top-5 md:-left-10 w-8 h-8"
          /> */}

          <h2 className="w-full text-[24px] md:text-[24px] font-medium tracking-tight text-black">
            Ask HomeTruth
          </h2>

          <p className="w-fit  whitespace-nowrap mt-5 text-base md:text-xl text-gray-600">
            Your property assistant for buying, owning, and managing your home.

          </p>

          {/* Blue corner (bottom-right) */}
          {/* <img
            src="/assets/blue.png"
            alt=""
            aria-hidden="true"
            className="absolute -bottom-4 -right-2 md:-bottom-8 md:-right-10 w-8 h-8"
          /> */}
        </div>
        <div>
          <AiAssistant />
        </div>
        <CallToAction />

      </section>
      <WhoWeHelp />
      <HowItWorks />
      <TrustSecurity />
      {/* <CallToAction /> */}
      <FinalCTA />
      <Footer />
    </>
  );
}
