import { PublicFooter, PublicHeader } from "../components/homepage/Journey";
import HowItWorks from "../components/HowItWorks";
import WhoWeHelp from "../components/WhoWeHelp";
import TrustSecurity from "../components/TrustSecurity";

const assetBase = process.env.PUBLIC_URL + "/assets/homepage/";

export default function HowHomeTruthWorks() {
  return (
    <>
      <div className="ht-ui ht-journey"><PublicHeader assetBase={assetBase} homeHref="/" loginHref="/login" /></div>
      <main>
        <HowItWorks />
        <WhoWeHelp />
        <TrustSecurity />
      </main>
      <div className="ht-ui ht-journey"><PublicFooter assetBase={assetBase} homeHref="/" /></div>
    </>
  );
}
