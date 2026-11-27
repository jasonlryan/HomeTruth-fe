import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { downloadInvestorLedger, downloadInvestorPortfolio, getInvestorPortfolio, getInvestorProperty } from "../api/api";
import InvestorDataRoom from "./InvestorDataRoom";

jest.mock("../api/api", () => ({
  downloadInvestorLedger: jest.fn(),
  downloadInvestorPortfolio: jest.fn(),
  getInvestorPortfolio: jest.fn(),
  getInvestorProperty: jest.fn()
}));

const totals = { all: 1000, free: 557, pro: 443 };
const john = { id: "1", ownerName: "John Doe", address: "Brighton", propertyType: "Terraced", plan: "pro", listedDocumentCount: 1 };
const entries = Array.from({ length: 13 }, (_, index) => ({
  date: "2023-10-12", category: "Maintenance", description: `Work item ${index + 1}`, vendor: "Demo Vendor", amount: 185.4, status: "Cleared"
}));

beforeEach(() => {
  jest.resetAllMocks();
  getInvestorPortfolio.mockImplementation(async ({ plan, q, page, limit }) => ({
    totals, total: q ? 1 : totals[plan], page, limit, records: plan === "free" ? [] : [john]
  }));
  getInvestorProperty.mockResolvedValue({ ...john, listedDocuments: ["Survey.pdf"], ledgerEntries: entries });
});

test("filters the server portfolio, searches for John Doe and opens his thirteen ledger entries", async () => {
  render(<InvestorDataRoom />);
  expect(await screen.findByText("1,000 homes", { exact: true })).toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: "Free 557" }));
  expect(await screen.findByText("557 homes", { exact: true })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Pro 443" }));
  expect(await screen.findByText("443 homes", { exact: true })).toBeVisible();

  fireEvent.change(screen.getByRole("searchbox", { name: /search by owner/i }), { target: { value: "John Doe" } });
  fireEvent.click(screen.getByRole("button", { name: "Search", exact: true }));
  expect(await screen.findByText("1 home matching “John Doe”")).toBeVisible();
  expect(getInvestorPortfolio).toHaveBeenLastCalledWith({ plan: "pro", q: "John Doe", page: 1, limit: 25 }, expect.any(AbortSignal));

  const owner = screen.getByRole("button", { name: "John Doe" });
  fireEvent.click(owner);
  expect(await screen.findByText("13 entries")).toBeVisible();
  expect(within(screen.getByRole("region", { name: "John Doe ledger" })).getAllByRole("row")).toHaveLength(14);
  fireEvent.click(screen.getByRole("button", { name: "Close record" }));
  expect(owner).toHaveFocus();
});

test("shows a retry affordance instead of displaying fabricated counts when the API fails", async () => {
  getInvestorPortfolio.mockRejectedValueOnce(new Error("Unavailable"));
  render(<InvestorDataRoom />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Couldn’t load");
  expect(screen.queryByRole("button", { name: "All homes 1,000" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(await screen.findByText("1,000 homes", { exact: true })).toBeVisible();
});


test("downloads the original authorised payloads and keeps the portfolio export independent of the list filter", async () => {
  const csv = new Blob(["id,dataset_id,demo_only\n1,brighton-demo,true"], { type: "text/csv" });
  const json = new Blob(['[{"id":1,"dataset_id":"brighton-demo","demo_only":true}]'], { type: "application/json" });
  const ledger = new Blob(["date,dataset_id,demo_only\n2023-10-12,brighton-demo,true"], { type: "text/csv" });
  downloadInvestorPortfolio.mockResolvedValueOnce(csv).mockResolvedValueOnce(json);
  downloadInvestorLedger.mockResolvedValue(ledger);
  const savedCreate = URL.createObjectURL;
  const savedRevoke = URL.revokeObjectURL;
  URL.createObjectURL = jest.fn(() => "blob:export");
  URL.revokeObjectURL = jest.fn();
  const names = [];
  const click = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function () {
    names.push(this.download);
  });
  try {
    render(<InvestorDataRoom />);
    fireEvent.click(await screen.findByRole("button", { name: "Pro 443" }));
    await screen.findByText("443 homes");
    fireEvent.click(screen.getByRole("button", { name: "Portfolio CSV" }));
    await waitFor(() => expect(names).toContain("brighton-addresses.csv"));
    fireEvent.click(screen.getByRole("button", { name: "Portfolio JSON" }));
    await waitFor(() => expect(names).toContain("brighton-addresses.json"));
    fireEvent.click(screen.getByRole("button", { name: "John Doe" }));
    fireEvent.click(await screen.findByRole("button", { name: "Ledger CSV" }));
    await waitFor(() => expect(names).toContain("john-doe-ledger.csv"));
    expect(downloadInvestorPortfolio.mock.calls).toEqual([["csv"], ["json"]]);
    expect(downloadInvestorLedger).toHaveBeenCalledWith("1");
    expect(URL.createObjectURL.mock.calls).toEqual([[csv], [json], [ledger]]);
  } finally {
    click.mockRestore();
    URL.createObjectURL = savedCreate;
    URL.revokeObjectURL = savedRevoke;
  }
});

test("keeps the Data Room usable when the backend export route is not available", async () => {
  downloadInvestorPortfolio.mockRejectedValue({ response: { status: 404 } });
  render(<InvestorDataRoom />);
  await screen.findByText("1,000 homes", { exact: true });
  fireEvent.click(screen.getByRole("button", { name: "Portfolio CSV" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("The demo API hasn’t enabled this download.");
  expect(screen.getByText("1,000 homes", { exact: true })).toBeVisible();
});
