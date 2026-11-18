const byId = id => document.getElementById(id);
const scenario = byId("scenario");
const form = byId("setup-form");
const address = byId("address");
const relationship = byId("relationship");
const save = byId("save");
let saved = false;
let didFail = false;
let saving = false;

function setError(field, show) {
  byId(field.id + "-error").hidden = !show;
  if (show) field.setAttribute("aria-invalid", "true");
  else field.removeAttribute("aria-invalid");
}

function showRecord(details, justSaved) {
  saved = true;
  form.hidden = true;
  byId("saved-record").hidden = false;
  byId("saved-status").hidden = !justSaved;
  byId("property-title").textContent = "Your home record";
  byId("property-description").textContent = "Documents, work history and next steps for this property.";
  byId("saved-address").textContent = details.address;
  byId("saved-postcode").textContent = details.postcode;
  byId("saved-relationship").textContent = details.relationship;
}

function showScenario() {
  saved = false;
  didFail = false;
  form.hidden = false;
  byId("saved-record").hidden = true;
  byId("save-error").hidden = true;
  byId("property-title").textContent = "Start your home record";
  byId("property-description").textContent = "Add an address and tell us how you’re connected to the property.";
  const answerAvailable = scenario.value !== "answer-unavailable";
  byId("continue-question").hidden = !answerAvailable;
  byId("thread-question").hidden = !answerAvailable;
  byId("thread-reply").hidden = !answerAvailable;
  byId("empty-thread").hidden = answerAvailable;
  byId("answer-notice").hidden = answerAvailable;
  byId("question-card-title").lastChild.textContent = answerAvailable ? "Your homepage question" : "Homepage question";
  document.querySelector(".question-copy").hidden = !answerAvailable;

  if (scenario.value === "existing") {
    showRecord({ address: "12 Example Road", postcode: "BS1 1AA", relationship: "Buyer" }, false);
  }
  if (location.hash === "#answer") location.hash = "property";
  renderRoute();
}

function renderRoute(moveFocus = false) {
  const isAnswer = location.hash === "#answer";
  byId("property").hidden = isAnswer;
  byId("answer").hidden = !isAnswer;
  byId("nav-property").setAttribute("aria-current", isAnswer ? "false" : "page");
  byId("nav-answer").setAttribute("aria-current", isAnswer ? "page" : "false");
  if (moveFocus && ["#property", "#answer"].includes(location.hash)) {
    byId(isAnswer ? "answer-title" : saved ? "saved-address" : "property-title").focus();
  }
}

address.addEventListener("input", () => setError(address, false));
relationship.addEventListener("change", () => setError(relationship, false));
scenario.addEventListener("change", showScenario);
window.addEventListener("hashchange", () => renderRoute(true));
renderRoute();

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (saving) return;

  const needsAddress = !address.value.trim();
  const needsRelationship = !relationship.value;
  setError(address, needsAddress);
  setError(relationship, needsRelationship);
  if (needsAddress || needsRelationship) {
    (needsAddress ? address : relationship).focus();
    return;
  }

  saving = true;
  save.disabled = true;
  scenario.disabled = true;
  form.setAttribute("aria-busy", "true");
  save.textContent = "Saving…";
  byId("save-error").hidden = true;
  await new Promise(resolve => setTimeout(resolve, 350));

  if (scenario.value === "save-error" && !didFail) {
    didFail = true;
    byId("save-error").hidden = false;
  } else {
    showRecord({
      address: address.value.trim(),
      postcode: byId("postcode").value.trim().toUpperCase(),
      relationship: relationship.selectedOptions[0].textContent,
    }, true);
    if (!byId("property").hidden) byId("saved-address").focus();
  }

  saving = false;
  save.disabled = false;
  scenario.disabled = false;
  form.removeAttribute("aria-busy");
  save.textContent = "Save home record";
});
