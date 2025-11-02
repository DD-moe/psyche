async function initGemini() {
  const { GoogleGenAI } = await import("https://esm.run/@google/genai");
  window.GoogleGenAI = GoogleGenAI; // zapis globalny
  console.log("Gemini załadowany");
}

initGemini();


/**
 * Tworzy lub modyfikuje strukturę prezentacji w HTML na podstawie istniejącego kodu i notatek użytkownika.
 * 
 * @param {string} code  - aktualny kod HTML prezentacji
 * @param {string} notes - nowe polecenie użytkownika (instrukcje)
 * @param {any} files    - ewentualne załączniki (obecnie nieużywane)
 * @returns {Promise<string>} - nowy lub zmodyfikowany kod HTML
 */
async function Create_Presentation_Structure(code, notes, files) {
  // pobranie aktualnego tokena
  const apiKey = localStorage.getItem('simV3_Gemini_Token');

  if (!apiKey) {
    console.warn("Brak klucza API w localStorage (simV3_Gemini_Token).");
    return "[Błąd: Brak klucza API Gemini]";
  }

  // inicjalizacja klienta AI
  const ai = new window.GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: `
        Poniżej masz dotychczasowy kod HTML:  
        ${code || "[Brak kodu]"}

        Tu kolei masz bieżące polecenie użytkownika:  
        ${notes || "[Brak polecenia]"}

        Twoim zadaniem jest zmodyfikowanie dotychczasowego kodu, 
        a jeśli jest pusty - napisanie nowego według wskazówek użytkownika.
        Cel kodu to uporządkowanie prezentacji w formie HTML z podziałem na rozdziały, 
        a każdy rozdział na wątki.
        Wątek należy traktować jako część rozdziału odpowiadającą wielkościowo 
        jednemu slajdowi lub stronie dokumentu.
        Poniżej masz przykład struktury HTML:

        <div class="presentation">
            <h1>Tytuł prezentacji</h1>
            <div class="chapter">
                <h2>Tytuł rozdziału</h2>
                <div class="plot">
                    <h3>Tytuł wątku</h3>
                </div>
            </div>
        </div>

        UWAGA: nie pisz pełnego kodu HTML tylko jego fragment - tj. zawartość <div class="presentation">
        Nie pisz też zawartości poszczególnych div innej niż tytuły pokazane w przykłądzie (1 tytuł na div)
      `.trim(),
    });

    let text = response?.text || "[Brak odpowiedzi]";

    // 🧹 czyszczenie znaczników kodu
    text = text
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/```$/i, '')
      .replace(/^'''[a-z]*\n?/i, '')
      .replace(/'''$/i, '')
      .trim();

    return text;
  } catch (err) {
    console.error("Błąd podczas generowania prezentacji:", err);
    return `[Błąd: ${err.message || "Nieznany błąd"}]`;
  }
}

// przykładowe uruchomienie
//await Create_Presentation_Structure("<div></div>", "Dodaj rozdział o neurobiologii", null);
