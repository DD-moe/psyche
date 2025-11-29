import { GoogleGenAI } from "https://esm.run/@google/genai";
import { speakText, stopAllSpeech, stopRecognition, startRecognition } from './voices.js';
let sim;

  // --- podstawowa funkcja komunikacji ---
  async function AskGemini(promptText) {
    const ai = new GoogleGenAI({
      apiKey: window.token,
    });
    const response = await ai.models.generateContent({
      model: window.token2.model.value, // nazwa tokenu . nazwa zmiennej . value
      contents: promptText,
    });
    return response;
  }


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

  sim = root.sim_data;

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
      Object.assign(sim, json); // ← to samo
      // wykonaj funkcje "po załadowaniu"
      renderChatFromHistory(root);
      updatePhysicalData(root);
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
        Object.assign(sim, json);
        // wykonaj funkcje "po załadowaniu"
        renderChatFromHistory(root);
        updatePhysicalData(root);
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
      // wykonaj funkcje "po załadowaniu"
      renderChatFromHistory(root);
      updatePhysicalData(root);
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
  // 8) WCZYTAJ POPRZEDNI KROK (pusta async funkcja)
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
async function sendMessage(btn) {
    const container = btn.closest("[data-tab='wywiad']");
    const input = container.querySelector(".answer");
    const history = container.querySelector(".chat-history");

    const text = input.value.trim();
    if (!text) return;

    input.value = "";

    const prompt = 
    `Twoim zadaniem jest nasladowanie pacjenta podczas wywiadu jaki prowadzisz z użytkownikiem, który przedstawił się jako:
    ${window.token2.name.value==="" ? "Student" : window.token2.name.value}
    Dane pacjenta którego masz naśladować dostępne są poniżej:
    ${sim.wywiad.konfiguracja} 
    ${sim.wywiad.modyfikator}

    Symulując miej na względzie obecny stan pacjenta podany poniżej:
    ${sim.wywiad.stan}

    dla lepszego kontekstu masz tu 5 ostatnich elementów czatu:
    ${sim.wywiad.historia.slice(-5).join("\n")} 

    Odpowiedź zwróć jako JSON w formacie:
    {
    odpowiedź:"" - tutaj czysta odpowiedź pacjenta bez prefiksu "Pacjent:"
    stan":"" - tu modyfikujesz stan pacjenta który otrzymałeś w prompcie, ale UWAGA tylko wtedy gdy uznasz, że stan pacjenta powienien się zmienić w trakcie wywiadu z nim.
    jeśli uznasz, że stan pacjenta się nie zmienił to zostaw pusty string: ""
    }

    ${window.token2.name.value==="" ? "Student" : window.token2.name.value} zadał pytanie do Ciebie:
    ${text}`;

    // odpowiedź AI
    try {
        const reply = await AskGemini(prompt);
        if (reply === undefined || reply===null) {
            return;
        }
        const replyObj = JSON.parse(reply.text.replace(/^\s*```json\s*|^\s*```\s*|^\s*|```\s*$|\s*$/g, ''));
        if (replyObj === undefined || replyObj === null || replyObj.odpowiedź === undefined || replyObj.stan === undefined) {
            return;
        }        

        // dodaj wiadomość użytkownika
        const userMsg = document.createElement("div");
        userMsg.className = "msg-row sent";
        userMsg.innerHTML = `<div class="bubble sent">${window.token2.name.value==="" ? "Student" : window.token2.name.value}: ${text}</div>`;
        history.appendChild(userMsg);
        // odpowiedź AI - cz. dalsza
        const botMsg = document.createElement("div");
        botMsg.className = "msg-row received";
        const bubble = document.createElement("div");
        bubble.className = "bubble received";
        bubble.textContent = `Pacjent: ${replyObj.odpowiedź}`;
        botMsg.appendChild(bubble);

        history.appendChild(botMsg);
        sim.wywiad.historia.push(`${window.token2.name.value==="" ? "Student" : window.token2.name.value}: ${text}`);
        sim.wywiad.historia.push(`Pacjent: ${replyObj.odpowiedź}`);
        if (replyObj.stan && replyObj.stan.trim() !== "") {
            sim.wywiad.stan = replyObj.stan;
        }
        history.scrollTop = history.scrollHeight;

        speakText(replyObj.odpowiedź);

    } catch (error) {
        console.error();        
    }    
}

function renderChatFromHistory(container) { //root
    // container = element zawierający dane-tab="wywiad"
    const historyDiv = container.querySelector(".chat-history");
    if (!historyDiv) return;

    // 1. Wyczyść obecny chat
    historyDiv.innerHTML = "";

    // 2. Iteruj po historii
    sim.wywiad.historia.forEach(msg => {

        const isUser = msg.startsWith((window.token2.name.value==="" ? "Student" : window.token2.name.value) + ":");
        const isBot = msg.startsWith("Pacjent:");

        const msgRow = document.createElement("div");
        msgRow.className = "msg-row " + (isUser ? "sent" : "received");

        const bubble = document.createElement("div");
        bubble.className = "bubble " + (isUser ? "sent" : "received");

        // treść wiadomości bez prefiksu
        let text = msg;
        if (isUser) {
            text = msg.replace((window.token2.name.value==="" ? "Student" : window.token2.name.value) + ":", "").trim();
            bubble.textContent = `${window.token2.name.value==="" ? "Student" : window.token2.name.value}: ${text}`;
        } else if (isBot) {
            text = msg.replace("Pacjent:", "").trim();
            bubble.textContent = `Pacjent: ${text}`;
        } else {
            // fallback (gdyby jakieś stare wiadomości miały niestandardowy format)
            bubble.textContent = msg;
        }

        msgRow.appendChild(bubble);
        historyDiv.appendChild(msgRow);
    });

    // 3. Auto scroll
    historyDiv.scrollTop = historyDiv.scrollHeight;
}


// fizykalne
document.addEventListener("click", function (e) {
  const g = e.target.closest(".svg-button-group");
  if (!g) return;

  const name = g.getAttribute("data-name") || "";
  const info = g.getAttribute("data-info") || "";

  onSvgButtonClick(name, info);
});

function onSvgButtonClick(name, info, g) {
    if (!g) return;

    const root = g.closest("[data-sim-src]");
    if (!root) return;

    const wynik = sim.badanie_przedmiotowe.konfiguracja[info];
    const historia = sim.badanie_przedmiotowe.historia;

    // Jest wynik do wyświetlenia?
    if (wynik !== undefined && wynik !== null) {

        // Dodaj tylko, jeśli jeszcze nie ma wpisu
        if (!historia[info]) {
            historia[info] = `${name}: ${wynik}`;
            updatePhysicalData(root);
        }
    }
}

function updatePhysicalData(root) {
    const box = root.querySelector(".physical-results");
    if (!box) return;

    const historia = sim.badanie_przedmiotowe.historia;

    // wyczyść
    box.innerHTML = "";

    // każdy wpis
    Object.keys(historia).forEach(key => {
        const value = historia[key];
        if (!value) return;

        const entry = document.createElement("div");
        entry.className = "physical-entry";
        entry.textContent = value;

        box.appendChild(entry);
    });

    // auto scroll – jeśli jest overflow
    box.scrollTop = box.scrollHeight;
}


window.sendMessage = sendMessage;