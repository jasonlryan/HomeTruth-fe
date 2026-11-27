import { fireEvent, render, screen } from "@testing-library/react";
import { checkManufacturerManual, getHomeItem, getPropertyRecords, registerManufacturerManual } from "../../api/api";
import ManualAskAction from "./ManualAskAction";

jest.mock("react-router-dom", () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });

jest.mock("../../api/api", () => ({
  checkManufacturerManual: jest.fn(),
  getHomeItem: jest.fn(),
  getPropertyRecords: jest.fn(),
  keepVaultManual: jest.fn(),
  registerManufacturerManual: jest.fn(),
}));

const item = { id: 2, version: 4, record: { name: "Utility washer", identity: { brand: "Bosch", model: "WAN28201GB" } } };
const link = {
  brand: "Bosch", model: "WAN28201GB",
  sourceUrl: "https://www.bosch-home.co.uk/en/product/WAN28201GB",
  manualUrl: "https://media3.bsh-group.com/Documents/9001441974_A.pdf",
};

function renderAction() {
  render(<ManualAskAction scope={{ homeId: 8, itemId: 2 }} />);
}

beforeEach(() => {
  jest.resetAllMocks();
  getHomeItem.mockResolvedValue(item);
  getPropertyRecords.mockResolvedValue([{ property: { id: 8 }, relationship: { permissionLevel: "manage" } }]);
});

test("opens a Vault match before considering a manufacturer link", async () => {
  getHomeItem.mockResolvedValue({ ...item, vaultManual: { documentId: 7 }, manufacturerManualLink: link });
  renderAction();
  expect(await screen.findByRole("link", { name: "Open Vault copy" })).toHaveAttribute("href", "/documents?preview=7");
  expect(screen.queryByRole("button", { name: "Check Bosch for free" })).toBeNull();
  expect(checkManufacturerManual).not.toHaveBeenCalled();
});

test("checks Bosch on request and registers the reviewed URL only on a separate click", async () => {
  checkManufacturerManual.mockResolvedValue({ registered: false, link });
  registerManufacturerManual.mockResolvedValue({ registered: true, link });
  renderAction();
  const check = await screen.findByRole("button", { name: "Check Bosch for free" });
  expect(checkManufacturerManual).not.toHaveBeenCalled();

  fireEvent.click(check);
  expect(await screen.findByRole("link", { name: "Open manufacturer PDF" })).toHaveAttribute("href", link.manualUrl);
  expect(screen.getByRole("link", { name: "Open Bosch model page" })).toHaveAttribute("href", link.sourceUrl);
  expect(checkManufacturerManual).toHaveBeenCalledWith(8, 2);
  expect(registerManufacturerManual).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole("button", { name: "Register manual link" }));
  expect(await screen.findByText("Manufacturer link saved with this appliance.")).toBeVisible();
  expect(registerManufacturerManual).toHaveBeenCalledWith(8, 2, { confirmed: true, itemVersion: 4, manualUrl: link.manualUrl });
  expect(screen.queryByRole("button", { name: "Register manual link" })).toBeNull();
});

test("reopens a registered manufacturer link through the item record without checking Bosch again", async () => {
  getHomeItem.mockResolvedValue({ ...item, manufacturerManualLink: link });
  renderAction();
  expect(await screen.findByRole("link", { name: "Open manufacturer PDF" })).toHaveAttribute("href", link.manualUrl);
  expect(screen.queryByRole("button", { name: "Check Bosch for free" })).toBeNull();
  expect(checkManufacturerManual).not.toHaveBeenCalled();
  expect(registerManufacturerManual).not.toHaveBeenCalled();
});

test("hides an untrusted or mismatched manufacturer result", async () => {
  checkManufacturerManual.mockResolvedValue({ registered: false, link: { ...link, manualUrl: "https://example.com/manual.pdf" } });
  renderAction();
  fireEvent.click(await screen.findByRole("button", { name: "Check Bosch for free" }));
  expect(await screen.findByText("I couldn’t find an official Bosch manual link for this exact model.")).toBeVisible();
  expect(screen.queryByRole("link", { name: "Open manufacturer PDF" })).toBeNull();
});
