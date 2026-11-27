const entries = [
  {
    date: "2026-04-14",
    kind: "Survey observation",
    title: "Staining noted below the rear gutter",
    file: "survey.pdf",
    body: "The survey recorded staining on the rear brickwork below the gutter joint above the kitchen window.",
    limit:
      "Cause not established. No moisture readings or internal opening-up; this is not a diagnosis of internal damp.",
  },
  {
    date: "2026-05-08",
    kind: "Proposed work",
    title: "Gutter inspection and repair quotation",
    file: "quote.pdf",
    body: "Alder Property Maintenance proposed clearing the rear outlet, resealing one joint and water-testing the joint and downpipe. Quoted total: £360.",
    limit:
      "A quotation records proposed work. Interior finishes and concealed damp investigation were excluded; the historical quote was valid for 30 days.",
  },
  {
    date: "2026-05-21",
    kind: "Contractor work record",
    title: "Gutter work and water test recorded",
    file: "repair-invoice.pdf",
    body: "The invoice dated 22 May records work on 21 May: outlet cleared, joint resealed and water-tested. The contractor reported no leak at the joint during that test. Invoice total: £360.",
    limit:
      "Payment status is not recorded. Internal damp was not assessed; the test does not establish the original cause or guarantee a permanent repair.",
  },
];
export function getDemoHomeHistory(record, email, enabled) {
  if (
    !enabled ||
    email !== "maya.demo@example.invalid" ||
    record?.currentAddress?.addressLine1 !== "18 Alder Walk" ||
    record?.currentAddress?.townCity !== "Exampleton"
  )
    return [];
  return entries.map((entry) => {
    const link = record.linkedDocuments?.find(
      (item) => (item.document?.name || item.name) === entry.file,
    );
    return {
      ...entry,
      documentId: link?.userDocumentId || link?.document?.id || null,
    };
  });
}

export const isDemoWorkspaceUser = (email) =>
  process.env.REACT_APP_HOMEOWNER_DEMO === "true" &&
  email === "maya.demo@example.invalid";
