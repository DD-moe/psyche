/* check_settings.js — przypomnienie o konfiguracji lub aktualizacji */
document.addEventListener('DOMContentLoaded', () => {
  const REQUIRED_KEYS = {
    simV3_simulator: {
      name: '🤖 Symulator AI (ustawienia)',
      href: './simulator.html',
      desc: '— wykonaj dowolną zmianę, aby zapisać konfigurację.'
    },
    simV3_quizzes: {
      name: '📝 Quizy, testy i podręcznik (ustawienia)',
      href: './quizzes.html',
      desc: '— wykonaj zmianę, by zapisać ustawienia.'
    },
    simV3_Gemini_Token: {
      name: '🔗 Tworzenie nowych zasobów',
      href: './resources.html',
      desc: '— w sekcji <strong>Dane użytkownika</strong> podaj token Gemini.'
    }
  };

  const LAST_KEY = 'simV3_LastUsage';
  const now = new Date();

  // Odczytaj datę ostatniego przypomnienia
  let lastShown = null;
  try {
    const stored = localStorage.getItem(LAST_KEY);
    if (stored) lastShown = new Date(stored);
  } catch (e) {
    lastShown = null;
  }

  const diffDays = lastShown ? (now - lastShown) / (1000 * 60 * 60 * 24) : Infinity;

  // Sprawdź brakujące klucze
  const missingKeys = Object.keys(REQUIRED_KEYS).filter(k => !localStorage.getItem(k));

  // Warunki
  const weekPassed = diffDays > 7;
  const shouldShow = weekPassed || missingKeys.length > 0;
  if (!shouldShow) return;

  // Przygotuj treść modala
  let title = '🔧 Przypomnienie o konfiguracji';
  let body = '';

  if (missingKeys.length > 0) {
    title = '⚠️ Wymagana konfiguracja portalu';
    body = `<p>Wykryto brakujące dane konfiguracyjne. Aby w pełni korzystać z portalu, odwiedź poniższe sekcje i uzupełnij ustawienia:</p><ul class="features">`;

    missingKeys.forEach(k => {
      const item = REQUIRED_KEYS[k];
      body += `<li><a class="link" href="${item.href}">${item.name}</a> ${item.desc}</li>`;
    });

    body += `</ul><p class="muted small">Po uzupełnieniu brakujących danych to przypomnienie nie będzie się już pojawiać.</p>`;
  } else if (weekPassed) {
    title = '🔁 Przypomnienie o aktualizacji ustawień';
    body = `
      <p>Minął ponad tydzień od ostatniej konfiguracji. To przypomnienie pojawia się, by upewnić się, że Twoje ustawienia są aktualne.</p>
      <p class="muted small">W razie dodania nowych funkcji Twoja poprzednia konfiguracja może nie zawierać nowych opcji — odwiedź zakładki ustawień, aby je uzupełnić.</p>
    `;
  }

  // Utwórz modal
  const modal = document.createElement('div');
  modal.className = 'license-modal active';
  modal.innerHTML = `
    <div class="license-dialog no-select" role="dialog" aria-modal="true">
      <h3 class="license-title">${title}</h3>
      <div class="license-body">${body}</div>
      <div class="license-actions">
        <button id="acknowledge-setup" class="btn">Rozumiem</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Zamknięcie i zapis daty
  modal.querySelector('#acknowledge-setup').addEventListener('click', () => {
    modal.classList.remove('active');
    localStorage.setItem(LAST_KEY, now.toISOString());
  });

  // Zabezpieczenia jak w app.js
  modal.addEventListener('copy', e => {
    e.preventDefault();
    const selection = window.getSelection().toString();
    if (selection && selection.length > 0) {
      alert('Kopiowanie zablokowane.');
    }
  });

  modal.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      alert('Kopiowanie zablokowane.');
    }
  });
});
