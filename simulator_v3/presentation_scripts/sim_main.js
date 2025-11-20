import { GoogleGenAI } from "https://esm.run/@google/genai";
import { speakText, stopAllSpeech, stopRecognition, startRecognition } from './voices.js';
let sim;


document.addEventListener("click", async (e) => {
  if (!e.target.matches(".tab-view button")) return;

  const action = e.target.dataset.simAction;
  if (!action) return;

  // ★ Znajduje najbliższy element data-sim-root
  const root = e.target.closest("[data-sim-src]");
  if (!root) {
    alert("Nie można znaleźć elementu data-sim-src.");
    return;
  }

  // ★ Tworzy sim_data jeśli nie istnieje
  if (!root.sim_data) {
    root.sim_data = {};
  }

  sim = root.sim_data; // referencja do zmiennej

  // -------------------------------------------------
  // 1) ZAŁADUJ SCENARIUSZ – wczytywanie z data-sim-src
  // -------------------------------------------------
  if (action === "load") {
    const src = root.dataset.simSrc;
    if (!src) {
      alert("Brak atrybutu data-sim-src.");
      return;
    }

    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error("Nie można pobrać pliku.");

      const json = await res.json();
      sim = json;

      alert("Scenariusz załadowany.");
    } catch (err) {
      alert("Błąd ładowania scenariusza: " + err.message);
    }
  }

  // -------------------------------------------------
  // 2) IMPORTUJ SCENARIUSZ – wybór pliku lokalnego
  // -------------------------------------------------
  if (action === "import") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const json = JSON.parse(text);
        sim = json;
        alert("Scenariusz zaimportowany.");
      } catch {
        alert("Plik nie jest poprawnym JSON.");
      }
    };

    input.click();
  }

  // -------------------------------------------------
  // 3) EKSPORTUJ SCENARIUSZ – zapis do pliku
  // -------------------------------------------------
  if (action === "export") {
    const blob = new Blob(
      [JSON.stringify(sim, null, 4)],
      { type: "application/json" }
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "scenariusz.json";
    a.click();
  }

  // -------------------------------------------------
  // 4) Wklej scenariusz ze schowka
  // -------------------------------------------------
  if (action === "paste") {
    try {
      const text = await navigator.clipboard.readText();
      const json = JSON.parse(text);
      Object.assign(sim, json);
      alert("Wklejono scenariusz.");
    } catch {
      alert("Schowek nie zawiera poprawnego JSON.");
    }
  }

  // -------------------------------------------------
  // 5) Skopiuj scenariusz do schowka
  // -------------------------------------------------
  if (action === "copy") {
    try {
      await navigator.clipboard.writeText(JSON.stringify(sim, null, 2));
      alert("Skopiowano scenariusz do schowka.");
    } catch {
      alert("Nie udało się skopiować do schowka.");
    }
  }

  // -------------------------------------------------
  // 6) OCEŃ SCENARIUSZ (pusta async funkcja)
  // -------------------------------------------------
  if (action === "evaluate") {
    await evaluateScenario(sim);
  }

  // -------------------------------------------------
  // 7) PRZYGOTUJ NASTĘPNY KROK (pusta async funkcja)
  // -------------------------------------------------
  if (action === "next") {
    await prepareNextStep(sim);
  }

  // -------------------------------------------------
  // 7) PRZYGOTUJ POPRZEDNI KROK (pusta async funkcja)
  // -------------------------------------------------
  if (action === "prev") {
    await preparePrevStep(sim);
  }  

});

// ------------------------------------
// Puste funkcje do uzupełnienia przez Ciebie
// ------------------------------------
async function evaluateScenario(sim) {
  console.log("evaluateScenario()", sim);
}

async function prepareNextStep(sim) {
  console.log("prepareNextStep()", sim);
}


// chat
function sendMessage(this) {
    const input = this.closest(".answer");
    const history = this.closest(".chat-history");
    const text = input.value.trim();
    if (!text) return;

    // wywołanie funkcji AI przez użytkownika
    if (typeof window.onAiReply === 'function') {
        window.AskGemini(promptText).then(reply => {
            // dodaj wiadomość użytkownika
            const userMsg = document.createElement('div');
            userMsg.className = 'msg-row sent';
            userMsg.innerHTML = `<div class="bubble sent">${text}</div>`;
            sim.wywiad.historia.push(userMsg);
            history.appendChild(userMsg);
            // bot dodaje wiadomość            
            const botMsg = document.createElement('div');
            botMsg.className = 'msg-row received';
            botMsg.innerHTML = `<div class="bubble received">${reply}</div>`;
            history.appendChild(botMsg);
            history.scrollTop = history.scrollHeight;
            speakText(botMsg);
        });
    }
}

window.sendMessage = sendMessage;