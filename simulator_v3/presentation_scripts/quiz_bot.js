async function generate_story(parentDiv) {
  const defs = JSON.parse(parentDiv.dataset.definitions);
  const btn = parentDiv.querySelector("button"); // pierwszy przycisk
  const cb = parentDiv.querySelector("input[type='checkbox']");
  const pre = parentDiv.querySelector("pre");

  // Historia użyć w obiekcie przycisku
  if (!btn.usedCounts) btn.usedCounts = {};

  let selected;
  if (cb.checked) {
    // Równomierne losowanie
    const counts = defs.map(d => btn.usedCounts[d.name] || 0);
    const minCount = Math.min(...counts);
    const candidates = defs.filter((_, i) => counts[i] === minCount);
    selected = candidates[Math.floor(Math.random() * candidates.length)];
  } else {
    // Dowolne losowanie
    selected = defs[Math.floor(Math.random() * defs.length)];
  }

  // Aktualizacja statystyk
  btn.usedCounts[selected.name] = (btn.usedCounts[selected.name] || 0) + 1;

  // Generowanie opisu przypadku przez AI
  const ai = new GoogleGenAI({ apiKey: localStorage.getItem("simV3_Gemini_Token") });
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-lite",
    contents: `Napisz krótki opis przypadku klinicznego pacjenta, u którego można rozpoznać:
      ${selected.name}.
      Nie podawaj diagnozy wprost.
      Jeżeli pytanie nie dotyczy choroby lecz definicji przedstaw ją w postacji rótkiej historyjki pacjenta.
      możesz się posłużyć definicją:
      ${selected.definition}.`,
  });

  pre.textContent = response.text.replace(/```/g, "").trim();
}

async function assess_response(parentDiv) {
  const defs = JSON.parse(parentDiv.dataset.definitions);
  const pre = parentDiv.querySelector("pre");
  const input = parentDiv.querySelector("textarea");

  const ai = new GoogleGenAI({ apiKey: localStorage.getItem("simV3_Gemini_Token") });
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-lite",
    contents: `Oceń odpowiedź użytkownika na podstawie przypadku klinicznego.
    Przypadek: ${pre.textContent}
    Odpowiedź użytkownika: ${input.value}
    Lista definicji: ${JSON.stringify(defs)}
    Powiedz, czy odpowiedź jest poprawna, częściowo poprawna, czy błędna, i dodaj krótkie uzasadnienie.`,
  });

  alert(response.text.replace(/```/g, "").trim());
}
