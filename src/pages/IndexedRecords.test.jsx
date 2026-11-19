import { fireEvent, render, screen } from "@testing-library/react";
import IndexedRecords from "./IndexedRecords";
import { getIndexedRecords } from "../api/api";

jest.mock("../api/api", () => ({ getIndexedRecords: jest.fn() }));

test("reads indexed chunks, follows the returned cursor and retries a failed read", async () => {
  getIndexedRecords.mockResolvedValueOnce({
    records: [{ id: "chunk-1", title: "Roof manual", chunkIndex: 0 }],
    nextCursor: 0,
  }).mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce({ records: [], nextCursor: null });
  render(<IndexedRecords />);
  expect(await screen.findByText("Roof manual")).toBeVisible();
  expect(screen.getByText(/Chunk index 0/)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Next records" }));
  expect(await screen.findByRole("alert")).toBeVisible();
  expect(screen.queryByText("Roof manual")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(await screen.findByText("No indexed chunks on this page.")).toBeVisible();
  expect(getIndexedRecords.mock.calls).toEqual([[null], [0], [0]]);
  expect(screen.queryByRole("button", { name: "Next records" })).toBeNull();
});
