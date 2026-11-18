import { Link } from "react-router-dom";
import { HTIcon, Panel } from "../components/homepage/HomeTruth";

const iconBase = process.env.PUBLIC_URL + "/assets/brand/";

export default function Tools() {
  return (
    <div className="ht-ui mx-auto max-w-[1120px] p-4 sm:p-8">
      <h1 className="mb-6 text-[32px]">Tools</h1>
      <Panel className="ht-panel max-w-lg" aria-labelledby="budget-tool-title">
        <h2 id="budget-tool-title" className="inline-grid grid-flow-col items-baseline gap-2 text-xl">
          <HTIcon name="budget" size={24} assetBase={iconBase} /> Budget Calculator
        </h2>
        <p className="mt-2 mb-4">Estimate costs and save your calculation to come back to.</p>
        <Link to="/budget-chat" className="ht-button" data-variant="secondary">Open Budget Calculator</Link>
      </Panel>
    </div>
  );
}
