import { GoogleGenAI } from "https://esm.run/@google/genai";
import { speakText, stopAllSpeech, stopRecognition, startRecognition } from './voices.js';

  // zmienne globalne
  const attitude = [
    "przychylne, motywujące, doceniające, niekiedy przymykajće oko, zauważa raczej mocne niż słabe strony",
    "przychylne, doceniające sukcesy, ale obiektywne i niekrytykujace w przypadku błędu",
    "neutralne, unika zarówno dużych pochwał jak i ostrej krytyki, skupia się na merytoryce",
    "nieprzychylne, krytyczne, ale merytoryczne, nie czepia sie innej niż merytoryczna słabości odpowiedzi, unika pochwał",
    "nieprzychylne, krytyczne, czepia się szczegółów i pozamerytorycznych aspektów odpowiedzi, niekiedy zgryźliwe uwagi",
  ];

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

  function getActiveRoot() {
    const slides = document.querySelectorAll('.slide');
    for (const slide of slides) {
      if (getComputedStyle(slide).display !== 'none') {
        return slide.querySelector('.presentation-block');
      }
    }
    return null;
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
    const def_prompt = root.querySelector('.prompt').textContent;
    const aim = root.querySelector('.aim').textContent;
    return { root, defsDiv, playDiv, casePre, ansArea, evalDiv, def_prompt, aim };
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
    const root = getActiveRoot();
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
    const { root, defsDiv, playDiv, casePre, ansArea, evalDiv, def_prompt, aim} = getElements();
    const defs = loadDefinitions(root, defsDiv);
    const selected = pickLeastUsed(defs);
    if (!selected) return alert("Brak definicji.");

    selected.count++;
    saveCounts(defs);
    casePre.textContent = "Generuję przypadek...";

    const prompt = `
Tu masz definicję:
${selected.text} - "${selected.name}"

${def_prompt}

Poziom trudności pytania to: ${window.token1.difficulty.value}
`;

    try {
      const res = await AskGemini(prompt);
      const text = res.text;
      casePre.textContent = text;
      evalDiv.classList.add('hidden');
      root._lastCase = text;
      root._lastDefs = defs;
      speakText(text);
    } catch (e) {
      casePre.textContent = "Błąd: " + e.message;
    }
  }

  // --- sprawdzanie odpowiedzi ---
  async function checkAnswer() {
    const { root, defsDiv, playDiv, casePre, ansArea, evalDiv, def_prompt, aim } = getElements();
    const answer = ansArea.value.trim();
    if (!root._lastCase) return alert("Najpierw wygeneruj pytanie.");
    if (!answer) return alert("Wpisz odpowiedź.");

    evalDiv.textContent = "Oceniam odpowiedź...";
    evalDiv.classList.remove('hidden');

    const defs = loadDefinitions(root, defsDiv);

    const defsText = defs.map(d => `- ${d.name}: ${d.text}`).join("\n");

    const prompt = `
Oceń odpowiedź użytkownika.

Użytkownik, który przedstawił się jako: ${window.token1.name.value==="" ? "student" : window.token1.name.value} otrzymał pytanie:
${root._lastCase}

Odpowiedział:
${answer}

${aim}:
${defsText}

Oceniając przybież nastawienie do odpowiadajacego: ${attitude[parseInt(window.token1.attitude.value) - 1]}

Odpowiedz w formacie JSON:
{"score":0-5,"feedback":"krótkie uzasadnienie"}
`;

    try {
      const res = await AskGemini(prompt);
      const txt = res.text;
      const cleanedTxt = txt.replace(/^\s*```json\s*|^\s*```\s*|^\s*|```\s*$|\s*$/g, '');
      const parsed = JSON.parse(cleanedTxt);
      evalDiv.innerHTML = `<strong>Ocena:</strong> ${parsed.score}/5<br>${parsed.feedback}`;
      speakText(parsed.feedback);
    } catch (e) {
      evalDiv.textContent = "Błąd oceny: " + e.message;
    }
  }

  // eksport funkcji do window
  window.generateCase = generateCase;
  window.checkAnswer = checkAnswer;
  window.AskGemini = AskGemini;
