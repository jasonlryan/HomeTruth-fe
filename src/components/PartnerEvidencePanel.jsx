import { useEffect, useRef, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { exportPartnerEvidence, getPartnerEvidence, getPartnerEvidenceDefinitions } from "../api/api";

export const lastCompleteMonth = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)).toISOString().slice(0, 7);
};
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] px-4 py-2 text-sm disabled:opacity-50";
const input = "min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-3 text-sm";

export default function PartnerEvidencePanel({ entry }) {
  const canView = entry.capabilities?.includes("report:view");
  const canExport = entry.capabilities?.includes("report:export");
  const [month, setMonth] = useState(lastCompleteMonth);
  const [campaignId, setCampaignId] = useState("");
  const [report, setReport] = useState(null);
  const [definitions, setDefinitions] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const request = useRef(0);
  const filters = () => ({ month, ...(campaignId ? { campaignId } : {}) });

  useEffect(() => {
    let cancelled = false;
    getPartnerEvidenceDefinitions(entry.programme.id).then((data) => { if (!cancelled) setDefinitions(data); }).catch(() => { if (!cancelled) setError("Metric definitions could not be loaded."); });
    return () => { cancelled = true; request.current += 1; };
  }, [entry.programme.id]);

  const clear = () => { request.current += 1; setLoading(false); setReport(null); setError(""); setNotice(""); };
  const load = async () => {
    const current = ++request.current;
    setLoading(true); setReport(null); setError(""); setNotice("");
    try {
      const data = await getPartnerEvidence(entry.programme.id, filters());
      if (request.current !== current) return;
      setReport(data);
      if (!campaignId && data.partitions) setCampaigns(data.partitions.map((partition) => partition.campaign));
    } catch (failure) {
      if (request.current === current) setError(failure.response?.data?.message || "Evidence could not be loaded. Check your programme access and try again.");
    } finally { if (request.current === current) setLoading(false); }
  };
  const download = async () => {
    const current = request.current;
    setExporting(true); setError(""); setNotice("");
    try {
      const data = await exportPartnerEvidence(entry.programme.id, filters());
      if (request.current !== current) return;
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a"); link.href = url; link.download = `programme-evidence-${month}.json`; link.click(); URL.revokeObjectURL(url);
      setNotice("Aggregate review pack downloaded. It contains current, consent-filtered evidence and definitions.");
    } catch (failure) {
      if (request.current === current) { setReport(null); setError(failure.response?.data?.message || "The review pack could not be exported."); }
    } finally { setExporting(false); }
  };
  return (
    <section className="mt-5 border-t border-[var(--color-border-default)] pt-5" aria-label="Programme evidence">
      <h3 className="text-lg font-bold text-[var(--color-text-default)]">Programme evidence</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">Review engagement by complete UTC calendar month and campaign. Small groups and small metric cells are protected. Individual records and programme-total rollups are excluded.</p>
      {canView && <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm">Calendar month<input className={input} type="month" value={month} max={lastCompleteMonth()} onChange={(event) => { clear(); setMonth(event.target.value); }} /></label>
        <label className="grid gap-1 text-sm">Campaign<select className={input} value={campaignId} onChange={(event) => { clear(); setCampaignId(event.target.value); }}><option value="">All campaign partitions</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select></label>
        <button type="button" className={button} onClick={load} disabled={loading || !month}><RefreshCw size={16} />{loading ? "Loading evidence…" : "Load evidence"}</button>
        {canExport && report?.state === "available" && <button type="button" className={button} onClick={download} disabled={exporting || loading}><Download size={16} />{exporting ? "Exporting…" : "Download review pack"}</button>}
      </div>}
      {error && <p role="alert" className="mt-4 text-sm text-[var(--color-text-default)]">{error}</p>}
      {notice && <p role="status" className="mt-4 text-sm">{notice}</p>}
      {report?.state === "approval_required" && <p role="status" className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4 text-sm">Programme reporting awaits product and privacy approval. No participant evidence is available.</p>}
      {report?.state === "available" && <div className="mt-5 grid gap-4">
        <p className="text-sm text-[var(--color-text-muted)]">Month: {report.month} · Generated {new Date(report.generatedAt).toLocaleString("en-GB")}</p>
        {!report.partitions?.length && <p className="text-sm">No reporting campaigns are configured for this programme.</p>}
        {report.partitions?.map((partition) => <section key={partition.campaign.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4">
          <h4 className="font-bold">{partition.campaign.name}</h4>
          {partition.state !== "available" ? <p className="mt-2 text-sm text-[var(--color-text-muted)]">{partition.state === "no_data" ? "No eligible, consented participants for this month." : "Evidence is suppressed because this group is below the minimum reporting threshold."}</p> : <>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{partition.eligibleParticipants} eligible participants · Each rate uses this denominator.</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{partition.metrics.map((metric) => <div key={metric.key} className="rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-accent)_6%,var(--color-surface-default))] p-3"><dt className="text-sm text-[var(--color-text-muted)]">{definitions?.metrics?.find((definition) => definition.key === metric.key)?.label || metric.key}</dt><dd className="mt-2 text-xl font-bold">{metric.state === "suppressed" ? "Protected" : `${metric.count} · ${metric.rate}%`}</dd><p className="mt-1 text-xs text-[var(--color-text-muted)]">{metric.state === "suppressed" ? "Small numerator or complement" : "Recorded participation"}</p></div>)}</dl>
          </>}
        </section>)}
      </div>}
      {definitions && <details className="mt-5 text-sm"><summary className="min-h-11 cursor-pointer py-3 font-bold">Metric definitions and coverage</summary><p className="mt-2 leading-6">{definitions.denominator}</p><p className="mt-2 leading-6">{definitions.interpretation}</p><p className="mt-2 leading-6">Minimum group: {definitions.minimumParticipants}. Non-zero metric cells and complements below {definitions.minimumCell} are protected.</p><dl className="mt-4 grid gap-3">{definitions.metrics.map((metric) => <div key={metric.key}><dt className="font-bold">{metric.label} · {metric.coverage}</dt><dd className="mt-1 leading-6 text-[var(--color-text-muted)]">{metric.definition} Source: {metric.sources.join(", ")}. Unit: {metric.unit}.</dd></div>)}</dl></details>}
      {!canView && <p className="mt-3 text-sm text-[var(--color-text-muted)]">Your privacy-audit role can review definitions. Participant metrics and exports require a reporting role.</p>}
    </section>
  );
}
