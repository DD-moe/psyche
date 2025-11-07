/// kod tymczasowy:
// slides.js — moduł obsługujący tryb prezentacji

document.addEventListener('DOMContentLoaded', () => {
  const presentation = document.querySelector('.presentation');
  if (!presentation) return;

  const slides = Array.from(presentation.querySelectorAll('.slide'));
  if (slides.length === 0) return;

  let currentIndex = 0;
  let panelVisible = false;

  // === FUNKCJE ===
  function showSlide(index) {
    // --- wyświetlenie slajdu ---
    slides.forEach((slide, i) => {
      slide.style.display = i === index ? 'block' : 'none';
      slide.style.opacity = i === index ? '1' : '0';
      slide.style.transition = 'opacity 0.4s ease';
    });

    // --- sprawdź tokeny ---
    const TOKEN_KEY = 'simV3_Gemini_Token';
    const TOKEN_KEY1 = 'simV3_quizzes';
    const TOKEN_KEY2 = 'simV3_simulator';

    window.token = localStorage.getItem(TOKEN_KEY);
    window.token1 = localStorage.getItem(TOKEN_KEY1);
    window.token2 = localStorage.getItem(TOKEN_KEY2);

    // --- token główny ---
    if (!token) {
      token = prompt("Podaj klucz API (token) dla Gemini:");
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else {
        alert("Bez klucza nie można korzystać z Gemini.");
        return;
      }
    }

    // --- pozostałe ustawienia ---
    if (!token1 || !token2) {
      try {
        const settings = prompt("Podaj JSON z ustawieniami (quizzes + simulator):");
        const parsed = JSON.parse(settings);

        if (parsed.quizzes) localStorage.setItem(TOKEN_KEY1, JSON.stringify(parsed.quizzes));
        if (parsed.simulator) localStorage.setItem(TOKEN_KEY2, JSON.stringify(parsed.simulator));

        if (!parsed.quizzes || !parsed.simulator)
          alert("JSON nie zawiera pełnych danych (quizzes, simulator).");
      } catch (err) {
        alert("Błąd parsowania JSON: " + err.message);
      }
    }

    // ponowne załadowanie tokenów
    window.token = localStorage.getItem(TOKEN_KEY);
    window.token1 = JSON.parse(localStorage.getItem(TOKEN_KEY1));
    window.token2 = JSON.parse(localStorage.getItem(TOKEN_KEY2));

    import("./repetitor.js");
    import("./badges.js");
  }


  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  // === PANEL AKCJI ===
  const panel = document.createElement('div');
  panel.className = 'presentation-controls';
  panel.innerHTML = `
    <button class="ctrl-btn prev">⟨</button>
    <span class="ctrl-info"></span>
    <button class="ctrl-btn fullscreen">⛶</button>
    <button class="ctrl-btn exit">X</button>
    <button class="ctrl-btn next">⟩</button>
  `;
  document.body.appendChild(panel);

  const info = panel.querySelector('.ctrl-info');
  const updateInfo = () => {
    info.textContent = `${currentIndex + 1} / ${slides.length}`;
  };

  // === ZDARZENIA ===
  panel.querySelector('.prev').addEventListener('click', () => {
    prevSlide();
    updateInfo();
  });
  panel.querySelector('.next').addEventListener('click', () => {
    nextSlide();
    updateInfo();
  });
  panel.querySelector('.fullscreen').addEventListener('click', toggleFullscreen);
  panel.querySelector('.exit').addEventListener('click', () => {
    window.history.back();
  });

  // Pokazywanie panelu tylko przy aktywności myszy
  let hideTimeout;
  function showPanel() {
    if (!panelVisible) {
      panel.classList.add('visible');
      panelVisible = true;
    }
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      panel.classList.remove('visible');
      panelVisible = false;
    }, 2500);
  }

  document.addEventListener('mousemove', showPanel);

  // === STYLIZACJA PANELU ===
  const style = document.createElement('style');
  style.textContent = `
    .presentation-controls {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 10px;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 9999;
      pointer-events: none;
    }

    .presentation-controls.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .ctrl-btn {
      background: rgba(255,255,255,0.08);
      color: #e6eef6;
      border: 1px solid rgba(255,255,255,0.1);
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.2s;
    }

    /* 🔸 Pozycjonowanie skrajnych przycisków */
    .ctrl-btn.prev {
      margin-right: auto;
    }

    .ctrl-btn.next {
      margin-left: auto;
    }    

    .ctrl-btn:hover {
      background: rgba(255,255,255,0.18);
    }

    .ctrl-info {
      color: #9aa6b2;
      font-size: 0.95rem;
      font-family: Inter, sans-serif;
      min-width: 60px;
      text-align: center;
      user-select: none;
    }
  `;
  document.head.appendChild(style);

  // === INICJALIZACJA ===
  showSlide(currentIndex);
  updateInfo();
});