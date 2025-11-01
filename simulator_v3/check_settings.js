/* check_settings.js — przypomnienie o konieczności konfiguracji */
document.addEventListener('DOMContentLoaded', () => {
  const REQUIRED_KEYS = ['simV3_simulator', 'simV3_quizzes', 'simV3_Gemini_Token'];
  const LAST_KEY = 'simV3_LastUsage';
  const now = new Date();

  // Pobierz ostatnie użycie
  let lastShown = null;
  try {
    lastShown = new Date(localStorage.getItem(LAST_KEY));
  } catch (e) {
    lastShown = null;
  }

  const diffDays = lastShown ? (now - lastShown) / (1000 * 60 * 60 * 24) : Infinity;
  const needsReminder = diffDays > 7 || REQUIRED_KEYS.some(k => !localStorage.getItem(k));

  if (!needsReminder) return;

  // Utwórz modal
  const modal = document.createElement('div');
  modal.className = 'license-modal active'; // użyj istniejącego stylu
  modal.innerHTML = `
    <div class="license-dialog no-select" role="dialog" aria-modal="true">
      <h3 class="license-title">🔧 Wymagana konfiguracja portalu</h3>
      <div class="license-body">
        <p>Aby korzystać w pełni z funkcji portalu, należy odwiedzić poniższe sekcje i uzupełnić wymagane dane:</p>
        <ul class="features">
          <li><a class="link" href="./simulator.html">🤖 Symulator AI (ustawienia)</a> — wykonaj dowolną zmianę, aby zapisać konfigurację.</li>
          <li><a class="link" href="./quizzes.html">📝 Quizy, testy i podręcznik (ustawienia)</a> — wykonaj zmianę, by zapisać ustawienia.</li>
          <li><a class="link" href="./resources.html">🔗 Tworzenie nowych zasobów</a> — w sekcji <strong>Dane użytkownika</strong> podaj token Gemini.</li>
        </ul>
        <p class="muted small">To przypomnienie pojawia się nie częściej niż raz na tydzień.</p>
      </div>
      <div class="license-actions">
        <button id="acknowledge-setup" class="btn">Rozumiem</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Obsługa zamknięcia
  modal.querySelector('#acknowledge-setup').addEventListener('click', () => {
    modal.classList.remove('active');
    localStorage.setItem(LAST_KEY, now.toISOString());
  });

  // Blokowanie kopiowania treści (tak jak w app.js)
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
