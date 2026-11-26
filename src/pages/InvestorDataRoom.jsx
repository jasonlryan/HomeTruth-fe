import { useEffect, useRef, useState } from "react";
import { getInvestorPortfolio, getInvestorProperty } from "../api/api";
import HTGlyph from "../components/HTGlyph";
import { Badge, Button, Field, Panel } from "../components/homepage/HomeTruth";
import "./investor-data-room.css";

const plans = [["all", "All homes"], ["free", "Free"], ["pro", "Pro"]];
const pageSize = 25;
const count = new Intl.NumberFormat("en-GB");
const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });
const planLabel = plan => plans.find(([id]) => id === plan)?.[1];

function LoadError({ onRetry, children }) {
  return <p role="alert">{children} <Button variant="secondary" onClick={onRetry}>Retry</Button></p>;
}

function PropertyLedger({ record, onClose }) {
  const [result, setResult] = useState(null);
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getInvestorProperty(record.id, controller.signal).then(property => {
      if (!Array.isArray(property?.ledgerEntries)) throw Error("Invalid property response");
      if (!controller.signal.aborted) setResult({ property });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ failed: true });
    });
    return () => controller.abort();
  }, [record.id, attempt]);

  const property = result?.property;
  return <Panel className="ht-panel ht-investor-ledger">
    <header>
      <div>
        <h2 tabIndex={-1} ref={heading}>{record.ownerName}</h2>
        <p>{record.address} · {planLabel(record.plan)}</p>
      </div>
      <Button variant="secondary" onClick={onClose}>Close record</Button>
    </header>
    {!result && <p role="status">Loading property record…</p>}
    {result?.failed && <LoadError onRetry={() => { setResult(null); setAttempt(n => n + 1); }}>Couldn’t load this demo record.</LoadError>}
    {property && <>
      <h3>Ledger <Badge>{count.format(property.ledgerEntries.length)} entries</Badge></h3>
      {property.ledgerEntries.length === 0 ? <p>No ledger entries for this home.</p> :
        <div className="ht-investor-table" tabIndex={0} role="region" aria-label={`${record.ownerName} ledger`}>
          <table>
            <thead><tr><th scope="col">Date</th><th scope="col">Category</th><th scope="col">Work</th><th scope="col">Vendor</th><th scope="col">Amount</th><th scope="col">Payment</th></tr></thead>
            <tbody>{property.ledgerEntries.map((entry, index) =>
              <tr key={entry.id ?? index}>
                <td>{entry.date ? date.format(new Date(entry.date)) : "—"}</td><td>{entry.category}</td><td>{entry.description}</td>
                <td>{entry.vendor}</td><td>{typeof entry.amount === "number" ? money.format(entry.amount) : "—"}</td><td>{entry.status}</td>
              </tr>)}</tbody>
          </table>
        </div>}
      <h3>Listed documents</h3>
      {property.listedDocuments?.length ? <ul>{property.listedDocuments.map((name, index) => <li key={index}>{name}</li>)}</ul> : <p>No documents listed for this home.</p>}
    </>}
  </Panel>;
}

export default function InvestorDataRoom() {
  const [filters, setFilters] = useState({ plan: "all", q: "", page: 1 });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const openedFrom = useRef(null);
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getInvestorPortfolio({ ...filters, limit: pageSize }, controller.signal).then(page => {
      if (!Array.isArray(page?.records) || !page.totals || !Number.isInteger(page.total)) throw Error("Invalid portfolio response");
      if (!controller.signal.aborted) setResult({ page });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ failed: true });
    });
    return () => controller.abort();
  }, [filters, attempt]);

  const page = result?.page;
  const [totals, setTotals] = useState(null);
  useEffect(() => {
    if (page) setTotals(page.totals);
  }, [page]);

  function changeFilters(next) {
    setSelected(null);
    setResult(null);
    setFilters(current => ({ ...current, page: 1, ...next }));
  }

  return <section className="ht-ui ht-admin-overview ht-investor-room">
    <header>
      <div>
        <h1>Investor Data Room</h1>
        <p>Brighton demo portfolio <Badge>Synthetic data</Badge></p>
      </div>
    </header>

    <Panel className="ht-panel">
      <fieldset className="ht-investor-filters">
        <legend>Filter by plan</legend>
        {plans.map(([plan, label]) => <Button key={plan} variant="secondary" aria-pressed={filters.plan === plan}
          onClick={() => { if (filters.plan !== plan) changeFilters({ plan }); }}>
          {label}{(page?.totals || totals) && ` ${count.format((page?.totals || totals)[plan])}`}
        </Button>)}
      </fieldset>

      <form className="ht-investor-search" onSubmit={event => {
        event.preventDefault();
        const q = search.trim();
        if (q !== filters.q || filters.page !== 1) changeFilters({ q });
      }}>
        <Field id="investor-search" label="Search by owner, address or postcode" type="search" value={search} onChange={event => setSearch(event.target.value)} maxLength={100} />
        <Button type="submit" variant="secondary"><HTGlyph name="search" size={18} /> Search</Button>
      </form>

      {result?.failed ? <LoadError onRetry={() => { setResult(null); setAttempt(n => n + 1); }}>Couldn’t load the Brighton demo portfolio.</LoadError> :
        !page ? <p role="status">Loading homes…</p> : <>
          <p role="status">{count.format(page.total)} {page.total === 1 ? "home" : "homes"}{filters.q && ` matching “${filters.q}”`}</p>
          {page.records.length > 0 && <div className="ht-investor-table" tabIndex={0} role="region" aria-label="Portfolio records">
            <table>
              <thead><tr><th scope="col">Owner</th><th scope="col">Address</th><th scope="col">Property type</th><th scope="col">Plan</th><th scope="col">Listed documents</th></tr></thead>
              <tbody>{page.records.map(record => <tr key={record.id}>
                <th scope="row"><button type="button" className="ht-investor-owner" onClick={event => {
                  openedFrom.current = event.currentTarget;
                  setSelected(record);
                }}>{record.ownerName}</button></th>
                <td>{record.address}</td><td>{record.propertyType}</td><td>{planLabel(record.plan)}</td><td>{record.listedDocumentCount}</td>
              </tr>)}</tbody>
            </table>
          </div>}
          {page.total > pageSize && <div className="ht-investor-pages">
            <Button variant="secondary" disabled={filters.page === 1} onClick={() => changeFilters({ page: filters.page - 1 })}>Previous</Button>
            <span>Page {filters.page} of {Math.ceil(page.total / pageSize)}</span>
            <Button variant="secondary" disabled={filters.page * pageSize >= page.total} onClick={() => changeFilters({ page: filters.page + 1 })}>Next</Button>
          </div>}
        </>}
    </Panel>

    {selected && <PropertyLedger key={selected.id} record={selected} onClose={() => { setSelected(null); openedFrom.current?.focus(); }} />}
  </section>;
}
