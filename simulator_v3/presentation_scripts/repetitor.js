import { GoogleGenAI } from "https://esm.run/@google/genai";

  // --- podstawowa funkcja komunikacji ---
  async function AskGemini(promptText) {
    const ai = new GoogleGenAI({
      apiKey: window.token,
    });
    const response = await ai.models.generateContent({
      model: window.token1.model.value, // nazwa tokenu . nazwa zmiennej . value
      contents: promptText,
    });
    return response;
  }

  // --- pomocnicze ---
  const root = document.querySelector('.presentation-block');
  const defsDiv = root.querySelector('.definitions');
  const playDiv = root.querySelector('.playground');
  const casePre = playDiv.querySelector('.case');
  const ansArea = playDiv.querySelector('.answer');
  const evalDiv = playDiv.querySelector('.evaluation');

  function loadDefinitions() {

    let counts = {};
    
    try {
        counts = root.count;
    } catch {
        counts = {};
    }

    return Array.from(defsDiv.querySelectorAll('pre')).map(pre => ({
      name: pre.getAttribute('name'),
      text: pre.textContent.trim(),
      count: counts[pre.getAttribute('name')] || 0,
      dom: pre,
    }));
  }

  function saveCounts(defs) {
    const obj = {};
    defs.forEach(d => obj[d.name] = d.count || 0);
    root.count = obj;
  }

function pickLeastUsed(defs) {
  if (!defs || defs.length === 0) return null;
  const min = Math.min(...defs.map(d => d.count || 0));
  const pool = defs.filter(d => d.count === min);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

  // --- generowanie przypadku ---
  async function generateCase() {
    const defs = loadDefinitions();
    const selected = pickLeastUsed(defs);
    if (!selected) return alert("Brak definicji.");

    selected.count++;
    saveCounts(defs);
    casePre.textContent = "Generuję przypadek...";

    const prompt = `
Masz zestaw definicji:
${selected.text}

Na podstawie definicji "${selected.name}" ułóż krótki przypadek kliniczny (3–6 zdań).
Opisz pacjenta, objawy i kontekst, bez podawania rozpoznania.
Na końcu dodaj pytanie kliniczne (np. "Jakie jest rozpoznanie?").
`;

    try {
      const res = await AskGemini(prompt);
      const text = res.text;
      casePre.textContent = text;
      evalDiv.classList.add('hidden');
      root._lastCase = text;
      root._lastDefs = defs;
    } catch (e) {
      casePre.textContent = "Błąd: " + e.message;
    }
  }

  // --- sprawdzanie odpowiedzi ---
  async function checkAnswer() {
    const answer = ansArea.value.trim();
    if (!root._lastCase) return alert("Najpierw wygeneruj pytanie.");
    if (!answer) return alert("Wpisz odpowiedź.");

    evalDiv.textContent = "Oceniam odpowiedź...";
    evalDiv.classList.remove('hidden');

    const defs = root._lastDefs || loadDefinitions();
    const defsText = defs.map(d => `- ${d.name}: ${d.text}`).join("\n");

    const prompt = `
Oceń odpowiedź studenta.

Student otrzymał pytanie:
${root._lastCase}

Odpowiedział:
${answer}

Celem pytania było przećwiczenie różnicowania jednostkek chorobowych spośród poniżej wymienionych:
${defsText}

Odpowiedz w formacie JSON:
{"score":0-5,"feedback":"krótkie uzasadnienie"}
`;

    try {
      const res = await AskGemini(prompt);
      const txt = res.text;
      const cleanedTxt = txt.replace(/^\s*```json\s*|^\s*```\s*|^\s*|```\s*$|\s*$/g, '');
      const parsed = JSON.parse(cleanedTxt);
      evalDiv.innerHTML = `<strong>Ocena:</strong> ${parsed.score}/5<br>${parsed.feedback}`;
    } catch (e) {
      evalDiv.textContent = "Błąd oceny: " + e.message;
    }
  }

  // eksport funkcji do window
  window.generateCase = generateCase;
  window.checkAnswer = checkAnswer;
