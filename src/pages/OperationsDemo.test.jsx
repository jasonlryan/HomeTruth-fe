import { render, screen, fireEvent } from "@testing-library/react";
import OperationsDemo from "./OperationsDemo";
let mockUser;
jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: mockUser }),
}));
jest.mock(
  "react-router-dom",
  () => ({
    Link: ({ to, children, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    Navigate: () => <p>Redirected to dashboard</p>,
  }),
  { virtual: true },
);
beforeEach(() => {
  mockUser = { email: "operator@example.invalid", role: "admin" };
  sessionStorage.clear();
});
test("Operations is visible only to administrators, including on direct entry", () => {
  mockUser = { email: "maya.demo@example.invalid", role: "user" };
  const { rerender } = render(<OperationsDemo />);
  expect(screen.getByText("Redirected to dashboard")).toBeVisible();
  mockUser = { email: "operator@example.invalid", role: "admin" };
  rerender(<OperationsDemo />);
  expect(screen.getByRole("heading", { name: "Operations" })).toBeVisible();
});
test("directory filters and shows sample records within the admin workspace", () => {
  render(<OperationsDemo />);
  fireEvent.click(
    screen.getByRole("button", { name: "Home records", exact: true }),
  );
  fireEvent.change(screen.getByLabelText("Search home records"), {
    target: { value: "Maya" },
  });
  expect(screen.queryByText("Robin")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "View record" }));
  expect(screen.getByRole("heading", { name: /Maya ·/ })).toBeVisible();
  expect(screen.queryByRole("link", { name: "Open home history" })).not.toBeInTheDocument();
});
test("programme preview and sharing preference actions produce local results", () => {
  render(<OperationsDemo />);
  fireEvent.click(screen.getByRole("button", { name: "Programmes" }));
  fireEvent.change(screen.getByLabelText("Programme name"), {
    target: { value: "Home handover" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Preview invitation" }));
  expect(screen.getByRole("status")).toHaveTextContent("Home handover");
  fireEvent.click(screen.getByRole("button", { name: "Connections" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Selected documents" }));
  fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
  expect(
    JSON.parse(sessionStorage.getItem("ht-presentation-sharing")).documents,
  ).toBe(true);
});

test("RAG ingestion records and editorial resources have separate destinations", () => {
  render(<OperationsDemo />);
  expect(screen.getByRole("link", { name: "RAG" })).toHaveAttribute("href", "/admin/knowledge-base");
  expect(screen.getByRole("link", { name: "Resources" })).toHaveAttribute("href", "/admin/resources");
});
