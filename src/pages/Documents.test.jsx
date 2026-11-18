import { render, screen } from "@testing-library/react";
import Documents from "./Documents";
import { getUserDocuments, getUserDocumentRecord } from "../api/api";
let mockParams;
const mockSetParams = jest.fn();
jest.mock(
  "react-router-dom",
  () => ({ useSearchParams: () => [mockParams, mockSetParams] }),
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
  getUserDocuments.mockResolvedValue({
    data: { documents: [{ id: 21, name: "first-page.pdf" }] },
  });
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
