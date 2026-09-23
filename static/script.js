const API_URL = "/api/generate";

const rawInput = document.getElementById("rawInput");
const runBtn = document.getElementById("runBtn");
const runBtnLabel = document.getElementById("runBtnLabel");
const errorMsg = document.getElementById("errorMsg");

const stages = [
  { el: document.getElementById("stage-1"), key: "edited_text" },
  { el: document.getElementById("stage-2"), key: "script_text" },
  { el: document.getElementById("stage-3"), key: "final_output" },
];

function resetStages() {
  stages.forEach((s) => {
    s.el.dataset.state = "idle";
    s.el.querySelector(".stage-output").textContent = "";
  });
  errorMsg.textContent = "";
}

function setBusy(isBusy) {
  runBtn.disabled = isBusy;
  runBtnLabel.textContent = isBusy ? "Running..." : "Run pipeline";
}

// Since the backend runs all 3 stages before responding, we fake a step-through
// reveal on the frontend so the pipeline feels like it's actually flowing.
async function revealStagesInOrder(result) {
  for (const stage of stages) {
    stage.el.dataset.state = "active";
    await new Promise((r) => setTimeout(r, 350));
    stage.el.querySelector(".stage-output").textContent = result[stage.key];
    stage.el.dataset.state = "done";
  }
}

async function run() {
  const text = rawInput.value.trim();
  if (!text) {
    errorMsg.textContent = "Pehle kuch text likho.";
    return;
  }

  resetStages();
  setBusy(true);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_input: text }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);

    await revealStagesInOrder(data);
  } catch (err) {
    errorMsg.textContent = `Error: ${err.message}`;
  } finally {
    setBusy(false);
  }
}

runBtn.addEventListener("click", run);
