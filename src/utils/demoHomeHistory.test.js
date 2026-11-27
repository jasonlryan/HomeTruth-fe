import { getDemoHomeHistory } from "./demoHomeHistory";
import { getNoteExcerpt } from "./noteExcerpt";
const record = {
  currentAddress: { addressLine1: "18 Alder Walk", townCity: "Exampleton" },
  linkedDocuments: [{ document: { name: "survey.pdf", id: 21 } }],
};
test("history never appears for a different owner, home, or disabled flag", () => {
  expect(getDemoHomeHistory(record, "other@example.invalid", true)).toEqual([]);
  expect(
    getDemoHomeHistory(record, "maya.demo@example.invalid", false),
  ).toEqual([]);
  expect(
    getDemoHomeHistory(
      { ...record, currentAddress: { addressLine1: "Other home" } },
      "maya.demo@example.invalid",
      true,
    ),
  ).toEqual([]);
});
test("history only links actual documents belonging to selected property", () => {
  const entries = getDemoHomeHistory(record, "maya.demo@example.invalid", true);
  expect(entries).toHaveLength(3);
  expect(entries[0].documentId).toBe(21);
  expect(entries[1].documentId).toBeNull();
  expect(entries[2].limit).toMatch(/Payment status is not recorded/);
});
test("note excerpt is plain bounded text while leaving source value unchanged", () => {
  const source =
    "## Summary\n**Invoice** [source](https://example.invalid) " +
    "a".repeat(250);
  expect(getNoteExcerpt(source)).not.toMatch(/##|\*\*|https:/);
  expect(getNoteExcerpt(source)).toHaveLength(191);
  expect(source).toContain("## Summary");
  expect(getNoteExcerpt("")).toMatch(/Open this note/);
});
