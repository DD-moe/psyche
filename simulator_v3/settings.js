// settings.js — obsługa zapisu i odczytu ustawień z localStorage

document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.necessary-data');
  const storageKey = window.location.pathname.includes('quizzes')
    ? 'simV3_quizzes'
    : 'simV3_simulator';

  // Wczytaj istniejące dane
  let data = {};
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) data = JSON.parse(stored);
  } catch (e) {
    console.warn('Błąd odczytu localStorage:', e);
  }

  // Ustaw wartości elementów
  elements.forEach(el => {
    const id = el.id;
    if (!id || !data[id]) return;
    const saved = data[id];
    switch (saved.type) {
      case 'checkbox':
        el.checked = !!saved.value;
        break;
      default:
        el.value = saved.value ?? '';
    }
  });

  // Funkcja zapisująca aktualny stan
  function saveAll() {
    const obj = {};
    elements.forEach(el => {
      if (!el.id) return;
      obj[el.id] = {
        type: el.type || el.tagName.toLowerCase(),
        value: el.type === 'checkbox' ? el.checked : el.value
      };
    });
    localStorage.setItem(storageKey, JSON.stringify(obj));
  }

  // Reaguj na zmiany
  elements.forEach(el => {
    el.addEventListener('change', saveAll);
    el.addEventListener('input', saveAll);
  });

});

function exportGeminiSettings() {
  const TOKEN_KEY1 = 'simV3_quizzes';
  const TOKEN_KEY2 = 'simV3_simulator';

  const quizzes = localStorage.getItem(TOKEN_KEY1);
  const simulator = localStorage.getItem(TOKEN_KEY2);

  let alertMsg = "";

  if (!quizzes || quizzes.trim() === "") {
    alertMsg += '⚠️ Uzupełnij: "📝 Quizy, testy i podręcznik (ustawienia) 🔧"\n';
  }
  if (!simulator || simulator.trim() === "") {
    alertMsg += '⚠️ Uzupełnij: "🤖 Symulator AI (ustawienia) 🔧"\n';
  }

  if (alertMsg !== "") {
    alert(alertMsg);
    return;
  }

  let settings;
  try {
    settings = {
      quizzes: JSON.parse(quizzes),
      simulator: JSON.parse(simulator)
    };
  } catch (err) {
    alert("❌ Błąd: dane w localStorage nie są poprawnym JSON-em.\n" + err.message);
    return;
  }

  const json = JSON.stringify(settings, null, 2);

  navigator.clipboard.writeText(json)
    .then(() => {
      alert("✅ Skopiowano ustawienia (JSON) do schowka!");
    })
    .catch(err => {
      console.error("❌ Błąd kopiowania:", err);
      alert("Nie udało się skopiować JSON do schowka. Sprawdź konsolę (F12).");
    });

  console.log("Eksport Gemini settings:", json);
  return json;
}

