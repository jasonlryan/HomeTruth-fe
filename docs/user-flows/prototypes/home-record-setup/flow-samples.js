export const samples = {
  buy: {
    question: "What should I ask after a survey flags a problem?",
    answer: "Ask the surveyor which finding needs a follow-up before you commit. Find out what they observed, what they couldn’t inspect, and whether they recommend a specialist assessment.",
    relationshipHint: "Choose Buyer if you’re considering buying this property.",
  },
  improve: {
    question: "What should I check before accepting a quote for home improvements?",
    answer: "Ask the contractor to list what the quote includes and excludes. Check materials, access, waste removal and how changes will be priced before you agree to the work.",
    relationshipHint: "",
  },
  sell: {
    question: "Which records should I gather for work done on my home?",
    answer: "Start with dated invoices, warranties and any relevant certificates. Keep the documents together by job so you can show a buyer what was done and when.",
    relationshipHint: "",
  },
};

export function getSample(route) {
  return Object.hasOwn(samples, route) ? samples[route] : samples.buy;
}
