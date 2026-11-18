import { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DocumentWorkspace from "./DocumentWorkspace";
import {
  getDocumentChats,
  getDocumentPreviewFile,
  askDocumentAI,
} from "../api/api";
jest.mock("../api/api", () => ({
  getDocumentChats: jest.fn(),
  getDocumentPreviewFile: jest.fn(),
  askDocumentAI: jest.fn(),
}));
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));
jest.mock("remark-gfm", () => ({ __esModule: true, default: () => {} }));
beforeEach(() => {
  jest.clearAllMocks();
  URL.createObjectURL = jest.fn(() => "blob:preview");
  URL.revokeObjectURL = jest.fn();
  getDocumentPreviewFile.mockResolvedValue(
    new Blob(["pdf"], { type: "application/pdf" }),
  );
  getDocumentChats.mockResolvedValue({
    data: {
      chats: [
        {
          id: 1,
          user_message: "Existing question",
          assistant_reply: "Source-limited answer",
        },
      ],
    },
  });
  askDocumentAI.mockResolvedValue({
    success: true,
    data: { current_answer: "Payment is not recorded." },
  });
});
test("one workspace retains preview and questions across tab switches", async () => {
  render(
    <DocumentWorkspace
      document={{ id: 21, name: "survey.pdf" }}
      onClose={() => {}}
    />,
  );
  await screen.findByTitle("Preview of survey.pdf");
  fireEvent.click(screen.getByRole("tab", { name: "Chat with Document" }));
  expect(await screen.findByText("Existing question")).toBeVisible();
  fireEvent.change(screen.getByLabelText("Ask about survey.pdf"), {
    target: { value: "Was it paid?" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Ask" }));
  expect(await screen.findByText("Payment is not recorded.")).toBeVisible();
  fireEvent.click(screen.getByRole("tab", { name: "Preview" }));
  expect(screen.getByTitle("Preview of survey.pdf")).toHaveAttribute(
    "src",
    "blob:preview",
  );
  expect(getDocumentPreviewFile).toHaveBeenCalledTimes(1);
});
test("Escape closes, restores focus, and revokes authenticated preview", async () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Open source</button>
        {open && (
          <DocumentWorkspace
            document={{ id: 21, name: "survey.pdf" }}
            onClose={() => setOpen(false)}
          />
        )}
      </>
    );
  }
  render(<Harness />);
  const trigger = screen.getByRole("button", { name: "Open source" });
  trigger.focus();
  fireEvent.click(trigger);
  await screen.findByTitle("Preview of survey.pdf");
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
});
test("preview failure keeps document chat available and preserves failed question", async () => {
  getDocumentPreviewFile.mockRejectedValue(new Error("not available"));
  askDocumentAI.mockRejectedValue(new Error("offline"));
  render(
    <DocumentWorkspace
      document={{ id: 21, name: "survey.pdf" }}
      onClose={() => {}}
    />,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "file preview could not be loaded",
  );
  fireEvent.click(screen.getByRole("tab", { name: "Chat with Document" }));
  fireEvent.change(screen.getByLabelText("Ask about survey.pdf"), {
    target: { value: "Question retained" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Ask" }));
  await waitFor(() =>
    expect(screen.getByText(/Your question is still here/)).toBeVisible(),
  );
  expect(screen.getByLabelText("Ask about survey.pdf")).toHaveValue(
    "Question retained",
  );
});
test("renders the actual backend JSON text preview without a false file download", async () => {
  getDocumentPreviewFile.mockResolvedValue({
    type: "application/json",
    text: async () =>
      JSON.stringify({
        success: true,
        data: {
          preview_type: "text",
          preview_content: "Observed staining; cause not established.",
          has_full_content: true,
        },
      }),
  });
  render(
    <DocumentWorkspace
      document={{ id: 21, name: "survey.pdf" }}
      onClose={() => {}}
    />,
  );
  expect(
    await screen.findByText("Observed staining; cause not established."),
  ).toBeVisible();
  expect(
    screen.queryByText("Download source document"),
  ).not.toBeInTheDocument();
});
