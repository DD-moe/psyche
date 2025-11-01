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
