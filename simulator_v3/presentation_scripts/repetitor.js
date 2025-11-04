import { GoogleGenAI } from "@google/genai";

  const TOKEN_KEY = 'simV3_Gemini_Token';
  const COUNT_KEY = 'defUsageCounts';

  // --- sprawdź token ---
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = prompt("Podaj klucz API (token) dla Gemini:");
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else alert("Bez klucza nie można korzystać z Gemini.");
  }

  // --- podstawowa funkcja komunikacji ---
  async function AskGemini(promptText) {
    const ai = new GoogleGenAI({
      apiKey: token,
    });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
    const counts = JSON.parse(localStorage.getItem(COUNT_KEY) || '{}');
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
    localStorage.setItem(COUNT_KEY, JSON.stringify(obj));
  }

  function pickLeastUsed(defs) {
    const min = Math.min(...defs.map(d => d.count || 0));
    const pool = defs.filter(d => d.count === min);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // --- generowanie przypadku ---
  async function generateCase() {
    const defs = loadDefinitions();
    const selected = pickLeastUsed(defs);
    if (!selected) return alert("Brak definicji.");

    selected.count++;
    saveCounts(defs);

    casePre.textContent = "Generuję przypadek...";

    const defsText = defs.map(d => `• ${d.name}: ${d.text}`).join("\n");
    const prompt = `
Masz zestaw definicji:
${defsText}

Na podstawie definicji "${selected.name}" ułóż krótki przypadek kliniczny (3–6 zdań).
Opisz pacjenta, objawy i kontekst, bez podawania rozpoznania.
Na końcu dodaj pytanie kliniczne (np. "Jakie jest rozpoznanie?").
`;

    try {
      const res = await AskGemini(prompt);
      const text = res.response.text();
      casePre.textContent = text;
      evalDiv.classList.add('hidden');
      window._lastCase = text;
      window._lastDefs = defs;
    } catch (e) {
      casePre.textContent = "Błąd: " + e.message;
    }
  }

  // --- sprawdzanie odpowiedzi ---
  async function checkAnswer() {
    const answer = ansArea.value.trim();
    if (!window._lastCase) return alert("Najpierw wygeneruj pytanie.");
    if (!answer) return alert("Wpisz odpowiedź.");

    evalDiv.textContent = "Oceniam odpowiedź...";
    evalDiv.classList.remove('hidden');

    const defs = window._lastDefs || loadDefinitions();
    const defsText = defs.map(d => `- ${d.name}: ${d.text}`).join("\n");

    const prompt = `
Oceń odpowiedź studenta.
Zadanie:
${window._lastCase}

Odpowiedź:
${answer}

Definicje:
${defsText}

Odpowiedz w formacie JSON:
{"score":0-5,"feedback":"krótkie uzasadnienie"}
`;

    try {
      const res = await AskGemini(prompt);
      const txt = res.response.text();
      const parsed = JSON.parse(txt);
      evalDiv.innerHTML = `<strong>Ocena:</strong> ${parsed.score}/5<br>${parsed.feedback}`;
    } catch (e) {
      evalDiv.textContent = "Błąd oceny: " + e.message;
    }
  }

  // eksport funkcji do window
  window.generateCase = generateCase;
  window.checkAnswer = checkAnswer;
