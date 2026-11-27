import { fireEvent, render, screen } from "@testing-library/react";
import Documents from "./Documents";
import { getUserDocuments, getUserDocumentRecord } from "../api/api";
let mockParams;
let mockLocation;
const mockSetParams = jest.fn();
jest.mock(
  "react-router-dom",
  () => ({
    useSearchParams: () => [mockParams, mockSetParams],
    useLocation: () => mockLocation,
    Link: ({ to, children }) => <a href={to}>{children}</a>,
  }),
  { virtual: true },
);
jest.mock("../api/api", () => ({
  getUserDocuments: jest.fn(),
  getUserDocumentRecord: jest.fn(),
  deleteDocument: jest.fn(),
  uploadDocument: jest.fn(),
}));
jest.mock(
  "../components/DocumentWorkspace",
  () =>
    ({ document: doc, onClose }) => (
      <div role="dialog" aria-label={doc.name}>
        <button onClick={onClose}>Close</button>
      </div>
    ),
);
beforeEach(() => {
  jest.clearAllMocks();
  mockParams = new URLSearchParams("preview=99");
  mockLocation = { state: null };
  getUserDocuments.mockResolvedValue({
    data: { documents: [{ id: 21, name: "first-page.pdf" }] },
  });
});

test("keeps the return to next actions after closing a source document", async () => {
  mockLocation = { state: { sourcePropertyId: 42 } };
  getUserDocumentRecord.mockResolvedValue({ success: true, data: { id: 99, name: "survey.pdf" } });
  render(<Documents />);
  await screen.findByRole("dialog", { name: "survey.pdf" });
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(mockSetParams).toHaveBeenCalledWith(new URLSearchParams(), {
    replace: true,
    state: { sourcePropertyId: 42 },
  });
  expect(screen.getByRole("link", { name: "Back to home record" })).toHaveAttribute(
    "href", "/property-profile?propertyId=42#property-next-actions",
  );
});
test("deep link resolves an authorised document outside the current list page", async () => {
  getUserDocumentRecord.mockResolvedValue({
    success: true,
    data: { id: 99, name: "other-page.pdf" },
  });
  render(<Documents />);
  expect(
    await screen.findByRole("dialog", { name: "other-page.pdf" }),
  ).toBeInTheDocument();
  expect(getUserDocumentRecord).toHaveBeenCalledWith(
    "99",
    expect.any(AbortSignal),
  );
});
test("failed lookup never displays a document from a previous or unrelated record", async () => {
  getUserDocumentRecord.mockRejectedValue(new Error("Forbidden"));
  render(<Documents />);
  expect(
    await screen.findByText(/This document could not be opened/),
  ).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
