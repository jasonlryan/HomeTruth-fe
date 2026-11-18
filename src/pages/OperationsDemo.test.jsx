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
  mockUser = { email: "maya.demo@example.invalid" };
  process.env.REACT_APP_HOMEOWNER_DEMO = "true";
  sessionStorage.clear();
});
afterAll(() => {
  delete process.env.REACT_APP_HOMEOWNER_DEMO;
});
test("presentation workspace never renders for other users or disabled flag", () => {
  mockUser = { email: "other@example.invalid" };
  const { rerender } = render(<OperationsDemo />);
  expect(screen.getByText("Redirected to dashboard")).toBeVisible();
  mockUser = { email: "maya.demo@example.invalid" };
  process.env.REACT_APP_HOMEOWNER_DEMO = "false";
  rerender(<OperationsDemo />);
  expect(screen.getByText("Redirected to dashboard")).toBeVisible();
});
test("directory filters and opens the homeowner record without operational API access", () => {
  render(<OperationsDemo />);
  fireEvent.click(
    screen.getByRole("button", { name: "Home records", exact: true }),
  );
  fireEvent.change(screen.getByLabelText("Search home records"), {
    target: { value: "Maya" },
  });
  expect(screen.queryByText("Robin")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "View record" }));
  expect(
    screen.getByRole("link", { name: "Open home history" }),
  ).toHaveAttribute("href", "/property-profile");
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
