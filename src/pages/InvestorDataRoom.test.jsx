import { fireEvent, render, screen, within } from "@testing-library/react";
import { getInvestorPortfolio, getInvestorProperty } from "../api/api";
import InvestorDataRoom from "./InvestorDataRoom";

jest.mock("../api/api", () => ({
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
