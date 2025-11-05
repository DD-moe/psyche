import { GoogleGenAI } from "https://esm.run/@google/genai";

  // zmiene globalne
  let activeRoot = null;

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
  function getActiveRoot() {
    const blocks = document.querySelectorAll('.presentation-block');
    for (const el of blocks) {
      if (getComputedStyle(el).display !== 'none') return el;
    }
    return blocks[0] || null;
  }


  function getElements() {
    const root = getActiveRoot();

    if (!root || !root.querySelector) {
      console.warn("Brak aktywnego bloku prezentacji.");
      return {};
    }

    const defsDiv = root.querySelector('.definitions');
    const playDiv = root.querySelector('.playground');
    const casePre = playDiv.querySelector('.case');
    const ansArea = playDiv.querySelector('.answer');
    const evalDiv = playDiv.querySelector('.evaluation');
    return { root, defsDiv, playDiv, casePre, ansArea, evalDiv };
  }

  function loadDefinitions(root, defsDiv) {
    const counts = root.count || {};
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
    const root = activeRoot || getActiveRoot();
    if (root) root.count = obj;
  }


  function pickLeastUsed(defs) {
    if (!defs || defs.length === 0) return null;
    const min = Math.min(...defs.map(d => d.count || 0));
    const pool = defs.filter(d => d.count === min);
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  }

  // --- generowanie przypadku ---
  async function generateCase() {
    const { root, defsDiv, playDiv, casePre, ansArea, evalDiv} = getElements();
    const defs = loadDefinitions(root, defsDiv);
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
    const { root, defsDiv, playDiv, casePre, ansArea, evalDiv } = getElements();
    const answer = ansArea.value.trim();
    if (!root._lastCase) return alert("Najpierw wygeneruj pytanie.");
    if (!answer) return alert("Wpisz odpowiedź.");

    evalDiv.textContent = "Oceniam odpowiedź...";
    evalDiv.classList.remove('hidden');

    const defs = loadDefinitions(root, defsDiv);

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

  const observer = new MutationObserver(() => {
    const visible = [...document.querySelectorAll('.presentation-block')]
      .find(el => getComputedStyle(el).display !== 'none');
    if (visible && visible !== activeRoot) {
      activeRoot = visible;
      console.log("Aktywny blok:", activeRoot);
    }
  });

  document.querySelectorAll('.presentation-block').forEach(block => {
    observer.observe(block, { attributes: true, attributeFilter: ['style'] });
  });

  window.addEventListener('DOMContentLoaded', () => {
    activeRoot = getActiveRoot();
  });


  // eksport funkcji do window
  window.generateCase = generateCase;
  window.checkAnswer = checkAnswer;
