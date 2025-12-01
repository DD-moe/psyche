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
      updateObservationData(root);
      renderDiagnosticsList(root);
      renderDiagnosticsHistory(root);
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
        updateObservationData(root);
        renderDiagnosticsList(root);
        renderDiagnosticsHistory(root);
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
      updateObservationData(root);
      renderDiagnosticsList(root);
      renderDiagnosticsHistory(root);
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

  onSvgButtonClick(name, info, g);
});

function onSvgButtonClick(name, info, g) {
    if (!g) return;

    const root = g.closest("[data-sim-src]");
    if (!root) return;

    const wynik = sim.badanie_przedmiotowe.konfiguracja[info];
    const historia = sim.badanie_przedmiotowe.historia;

    // Jest wynik do wyświetlenia?
    if (wynik !== undefined && wynik !== null) {

        // Dodaj wpis
        historia[info] = `${name}: ${wynik}`;
        updatePhysicalData(root);

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

// obserwacja
function updateObservationData(root) {
    const box = root.querySelector(".observation-results");
    if (!box) return;

    // wyczyść
    box.innerHTML = "";

    // każdy wpis obserwacji
    sim.obserwacje.forEach(obs => {
        if (!obs) return;

        const entry = document.createElement("div");
        entry.className = "physical-entry";
        entry.textContent = obs;

        box.appendChild(entry);
    });

    // auto scroll
    box.scrollTop = box.scrollHeight;
}

// diagnostyka
function renderDiagnosticsList(root) {
    const config = sim.diagnostyka.konfiguracja;
    const superTab = root.querySelector(`.tab-view[data-tab="diagonstyka"]`);

    // Dodajemy badania
    Object.keys(config).forEach(key => {
        const item = config[key];
        const category = item.kategoria;

        if (!category) return;

        // Znajdź odpowiednią zakładkę
        const tab = superTab.querySelector(`.tab-view[data-tab="${category}"]`);
        if (!tab) return;

        // Stwórz element
        const entry = document.createElement("div");
        entry.className = "diagnostic-entry";

        const nameEl = document.createElement("div");
        nameEl.className = "diagnostic-name";
        nameEl.textContent = key;

        const infoEl = document.createElement("div");
        infoEl.className = "diagnostic-info";
        infoEl.innerHTML =
            `Czas min: ${item.czas_min}<br>
             Czas max: ${item.czas_max}<br>
             Cena: ${item.cena.toFixed(2)} zł`;

        const button = document.createElement("button");
        button.className = "diagnostic-order-btn";
        button.textContent = "Zleć";

        button.addEventListener("click", () => {
            orderDiagnostic(key, item, root);
        });

        entry.appendChild(nameEl);
        entry.appendChild(infoEl);
        entry.appendChild(button);

        tab.appendChild(entry);
    });
}


function orderDiagnostic(name, item, root) {
    const history = sim.diagnostyka.historia;

    // nie duplikujemy
    if (history[name]) return;

    const losowyCzas = randomTimeBetween(item.czas_min, item.czas_max);

    history[name] = {
        data: losowyCzas,
        cena: item.cena,
        wynik: item.wynik
    };

    // przelicz sumę i czas
    recalcDiagnosticsSummary();

    // odśwież box z wynikami
    renderDiagnosticsHistory(root);
}

function randomTimeBetween(minStr, maxStr) {
    const t1 = parseTime(minStr);
    const t2 = parseTime(maxStr);

    const min = t1.total;
    const max = t2.total;

    const rand = Math.floor(Math.random() * (max - min + 1)) + min;
    return formatTime(rand);
}

function parseTime(str) {
    const [d, h, m, s] = str.split(":").map(Number);
    const total = (((d * 24 + h) * 60 + m) * 60 + s);
    return { d, h, m, s, total };
}

function formatTime(totalSeconds) {
    let s = totalSeconds;
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const m = Math.floor(s / 60); s %= 60;

    return `${d}:${h}:${m}:${s}`;
}

function recalcDiagnosticsSummary() {
    const history = sim.diagnostyka.historia;

    let totalCena = 0;
    let maxCzas = 0;

    Object.keys(history).forEach(key => {
        const item = history[key];
        totalCena += item.cena;

        const t = parseTime(item.data).total;
        if (t > maxCzas) maxCzas = t;
    });

    sim.diagnostyka.cena = totalCena;
    sim.diagnostyka.czas = maxCzas;
}

function renderDiagnosticsHistory(root) {
    const box = root.querySelector(".additional-results");
    if (!box) return;

    box.innerHTML = "";

    const history = sim.diagnostyka.historia;

    Object.keys(history).forEach(key => {
        const item = history[key];

        const entry = document.createElement("div");
        entry.className = "diagnostic-result-entry";

        entry.innerHTML =
            `<strong>${key}</strong><br>
             Wynik: ${item.wynik}`;

        box.appendChild(entry);
    });

    box.scrollTop = box.scrollHeight;
}

// postępowanie
function setupClipboardControls(root) {
    if (!root) return;

    // textarea z historią
    const textarea = root.querySelector("textarea.chat-history[data-action]");
    if (!textarea) return;

    // przyciski w nagłówku zakładek
    const buttons = root.querySelectorAll(".tabs-header .tab-btn[data-action]");
    if (!buttons.length) return;

    buttons.forEach(btn => {
        const action = btn.getAttribute("data-action");

        if (action === "copy") {
            btn.addEventListener("click", () => {
                navigator.clipboard.writeText(textarea.value)
                    .then(() => console.log("Skopiowano do schowka"))
                    .catch(err => console.error("Błąd kopiowania:", err));
            });
        }

        if (action === "paste") {
            btn.addEventListener("click", () => {
                navigator.clipboard.readText()
                    .then(text => {
                        textarea.value = text;
                        console.log("Wklejono ze schowka");
                    })
                    .catch(err => console.error("Błąd wklejania:", err));
            });
        }
    });
}


window.sendMessage = sendMessage;