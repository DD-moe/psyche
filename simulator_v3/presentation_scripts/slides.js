/// kod tymczasowy:
// slides.js — moduł obsługujący tryb prezentacji
import "./repetitor.js";

document.addEventListener('DOMContentLoaded', () => {
  const presentation = document.querySelector('.presentation');
  if (!presentation) return;

  const slides = Array.from(presentation.querySelectorAll('.slide'));
  if (slides.length === 0) return;

  let currentIndex = 0;
  let panelVisible = false;

  // === FUNKCJE ===
  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.style.display = i === index ? 'block' : 'none';
      slide.style.opacity = i === index ? '1' : '0';
      slide.style.transition = 'opacity 0.4s ease';
    });
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
    <button class="ctrl-btn next">⟩</button>
    <button class="ctrl-btn fullscreen">⛶</button>
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

  // Klawiatura
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') {
      nextSlide();
      updateInfo();
    }
    if (e.key === 'ArrowLeft') {
      prevSlide();
      updateInfo();
    }
    if (e.key.toLowerCase() === 'f') {
      toggleFullscreen();
    }
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
