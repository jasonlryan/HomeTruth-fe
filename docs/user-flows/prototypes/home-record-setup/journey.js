import { getSample } from "./flow-samples.js";

const byId = id => document.getElementById(id);
const form = byId("guest-question-form");
const stages = ["question", "first-answer", "account", "welcome"];
let accountChoice = "login";

function currentRoute() {
  return new FormData(form).get("route");
}

function renderSample() {
  const sample = getSample(currentRoute());
  byId("sample-question").textContent = sample.question;
  byId("asked-question").textContent = sample.question;
  byId("first-reply").textContent = sample.answer;
}

function renderStage(moveFocus = false) {
  const hash = location.hash.slice(1);
  const stage = stages.includes(hash) ? hash : "question";
  for (const name of stages) {
    byId(name).hidden = name !== stage;
  }

  const currentProgress = stage === "welcome" ? "account" : stage;
  for (const progress of document.querySelectorAll("[data-progress]")) {
    if (progress.dataset.progress === currentProgress) progress.setAttribute("aria-current", "step");
    else progress.removeAttribute("aria-current");
  }

  const register = accountChoice === "register";
  byId("account-title").textContent = register ? "Create an account" : "Log in to HomeTruth";
  byId("account-description").textContent = register
    ? "New users finish the welcome step before setting up a property. Continue here with a demo account."
    : "In the app, login takes you to the property profile. Continue here with a demo account.";
  byId("open-existing").hidden = register;
  byId("open-setup").hidden = register;
  byId("demo-registration").hidden = !register;
  const setup = new URL("index.html", location.href);
  setup.searchParams.set("journey", currentRoute());
  byId("open-setup").href = setup.href;
  byId("finish-welcome").href = setup.href;
  setup.searchParams.set("scenario", "existing");
  byId("open-existing").href = setup.href;

  if (moveFocus && stages.includes(hash)) byId(stage + "-title").focus();
}

form.addEventListener("change", renderSample);
form.addEventListener("submit", event => {
  event.preventDefault();
  byId("record-handoff").hidden = true;
  byId("show-account-options").setAttribute("aria-expanded", "false");
  location.hash = "first-answer";
});

byId("show-account-options").addEventListener("click", event => {
  byId("record-handoff").hidden = false;
  event.currentTarget.setAttribute("aria-expanded", "true");
  byId("handoff-title").focus();
});

for (const link of document.querySelectorAll("[data-account-choice]")) {
  link.addEventListener("click", () => { accountChoice = link.dataset.accountChoice; });
}

window.addEventListener("hashchange", () => renderStage(true));
renderSample();
renderStage();
