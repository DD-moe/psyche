async function initGemini() {
  const { GoogleGenAI } = await import("https://esm.run/@google/genai");
  window.GoogleGenAI = GoogleGenAI; // zapis globalny
  console.log("Gemini załadowany");
}

initGemini();

// gotowe obiekty styli
// ===== GLOBALNE KLASY DLA STYLIZACJI TREŚCI =====
window.TEXT_STYLE_CLASSES = {
  emphasis: {
    yellow: "Podkreślenie ostrzegawcze / zwracające uwagę",
    orange: "Uwaga / ważny punkt pośredni",
    red: "Bardzo ważne / krytyczne elementy",
    lightblue: "Informacja pomocnicza lub ciekawostka",
    magenta: "Akcent emocjonalny / wyjątkowe pojęcia",
  },
  formatting: {
    bold: "Pogrubienie tekstu",
    italic: "Kursywa",
    s_underline: "Silne (mocne) podkreślenie",
    l_underline: "Lekkie (delikatne) podkreślenie",
  },
  semantic: {
    quotation: "Cytat lub wypowiedź",
    t_link: "Link tekstowy (odnośnik słowny)",
    e_link: "Link emoji (symboliczny odnośnik)",
  },
};

// ===== GLOBALNE KLASY DLA TABEL =====
window.TABLE_STYLE_CLASSES = {
  background: {
    darkBlue: "Tło nagłówków lub ważnych sekcji tabeli",
    darkGray: "Tło dla grup danych lub sum",
    darkGreen: "Tło pozytywnych wyników / statusów",
    darkRed: "Tło błędów lub ostrzeżeń w tabeli",
  },
  border: {
    lightGray: "Jasne obramowanie komórek",
    lightBlue: "Delikatne obramowanie sekcji informacyjnych",
    white: "Minimalistyczne, subtelne obramowanie",
  },
};




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


/**
 * Tworzy listę numerowaną z użyciem klas stylizujących.
 *
 * @param {string} notes - polecenie użytkownika dotyczące listy
 * @param {string} code - dotychczasowy kod listy (jeśli istnieje)
 * @returns {Promise<string>} - fragment HTML zawierający <ol>...</ol>
 */
async function Create_Numbered_List(code, notes, files) {
  const apiKey = localStorage.getItem('simV3_Gemini_Token');
  if (!apiKey) return "[Błąd: Brak klucza API Gemini]";

  const ai = new window.GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: `
        Poniżej masz istniejący kod listy (jeśli jest):
        ${code || "[Brak listy]"}

        Instrukcje użytkownika: ${notes}

        Twoim zadaniem jest stworzenie lub zmodyfikowanie listy numerowanej (<ol>),
        zgodnie z poleceniem. Każdy element listy powinien być w <li>.

        Możesz używać następujących klas CSS (podaj tylko ich nazwy, bez stylów):
        ${Object.keys(window.TEXT_STYLE_CLASSES.emphasis).join(", ")},
        ${Object.keys(window.TEXT_STYLE_CLASSES.formatting).join(", ")},
        ${Object.keys(window.TEXT_STYLE_CLASSES.semantic).join(", ")}.

        Jeśli użytkownik wspomina o wyróżnieniu, zastosuj odpowiednią klasę.
        Nie dodawaj pełnego kodu HTML strony, tylko sam fragment listy, np.:

        <ol>
          <li class="yellow">Najważniejszy punkt</li>
          <li class="lightblue italic">Ciekawostka</li>
        </ol>
      `.trim(),
    });

    let text = response?.text || "[Brak odpowiedzi]";
    text = text
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/```$/i, '')
      .replace(/^'''[a-z]*\n?/i, '')
      .replace(/'''$/i, '')
      .trim();

    return text;
  } catch (err) {
    console.error("Błąd podczas tworzenia listy:", err);
    return `[Błąd: ${err.message || "Nieznany błąd"}]`;
  }
}

/**
 * Tworzy lub modyfikuje tabelę HTML z użyciem klas stylizujących.
 *
 * @param {string} code - aktualny kod tabeli (jeśli istnieje)
 * @param {string} notes - instrukcje użytkownika dotyczące zawartości tabeli
 * @returns {Promise<string>} - fragment HTML zawierający <table>...</table>
 */
async function Create_Table(code, notes, files) {
  const apiKey = localStorage.getItem('simV3_Gemini_Token');
  if (!apiKey) return "[Błąd: Brak klucza API Gemini]";

  const ai = new window.GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: `
        Oto dotychczasowy kod tabeli (jeśli istnieje):
        ${code || "[Brak tabeli]"}

        Instrukcje użytkownika: ${notes}

        Twoim zadaniem jest stworzenie lub zmodyfikowanie fragmentu HTML zawierającego tabelę (<table>),
        z odpowiednimi wierszami i kolumnami według wskazówek użytkownika.

        Stosuj klasy dla kolorów tła i obramowań:
        Tła: ${Object.keys(window.TABLE_STYLE_CLASSES.background).join(", ")}.
        Obramowania: ${Object.keys(window.TABLE_STYLE_CLASSES.border).join(", ")}.

        Przykładowa struktura:
        <table class="lightGray">
          <thead class="darkBlue">
            <tr><th>Nagłówek 1</th><th>Nagłówek 2</th></tr>
          </thead>
          <tbody>
            <tr class="darkGray"><td>Dane 1</td><td>Dane 2</td></tr>
          </tbody>
        </table>

        Zwróć tylko fragment kodu tabeli (bez otoczki strony).
      `.trim(),
    });

    let text = response?.text || "[Brak odpowiedzi]";
    text = text
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/```$/i, '')
      .replace(/^'''[a-z]*\n?/i, '')
      .replace(/'''$/i, '')
      .trim();

    return text;
  } catch (err) {
    console.error("Błąd podczas generowania tabeli:", err);
    return `[Błąd: ${err.message || "Nieznany błąd"}]`;
  }
}


/**
 * Tworzy fragment HTML zawierający interaktywny blok diagnostyczny.
 * Model AI generuje tablicę definicji w formacie JSON,
 * która trafia do atrybutu data-definitions głównego diva.
 *
 * @param {string} code  - aktualny kod (np. poprzednia tabela / stan)
 * @param {string} notes - instrukcje użytkownika dotyczące zawartości
 * @param {any} files    - ewentualne załączniki (obecnie nieużywane)
 * @returns {Promise<string>} - fragment HTML z gotowym divem diagnostycznym
 */
async function Create_Diagnostic_Block(code, notes, files) {
  const apiKey = localStorage.getItem('simV3_Gemini_Token');
  if (!apiKey) return "[Błąd: Brak klucza API Gemini]";

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Generowanie JSON-a definicji
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: `
        Użytkownik tworzy interaktywny blok diagnostyczny do nauki psychiatrii.

        Instrukcje użytkownika: ${notes || "[Brak instrukcji]"}

        Utwórz tablicę JSON z definicjami podanymi przez użytkownika.
        Każdy element powinien mieć pola:
        - "name": nazwa definicji,
        - "definition": treść definicji (skondensowana, jeśli jest zbyt długa)
      `.trim(),
    });

    let json = response?.text || "[Brak odpowiedzi]";

    // 🧹 czyszczenie znaczników kodu
    json = json
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/```$/i, '')
      .replace(/^'''[a-z]*\n?/i, '')
      .replace(/'''$/i, '')
      .trim();

    if (json !== '[Brak odpowiedzi]') {
      // Generowanie HTML jako string z data-definitions
      return `
<div class='diagnostic' data-definitions='${json}'>
  <button onclick='generate_story(this.parentElement)'>Stwórz nowy przypadek</button>
  <label>
    Nie powtarzaj przypadków
    <input type="checkbox">
  </label>
  <pre>Przypadek pojawi się tutaj...</pre>
  <textarea placeholder="Wpisz swoją odpowiedź..."></textarea>
  <button onclick='assess_response(this.parentElement)'>Wyślij odpowiedź</button>
</div>
      `.trim();
    } else {
      return `[Brak odpowiedzi: ${json}]`;
    }

  } catch (err) {
    console.error("Błąd podczas tworzenia bloku diagnostycznego:", err);
    return `[Błąd: ${err.message || "Nieznany błąd"}]`;
  }
}

