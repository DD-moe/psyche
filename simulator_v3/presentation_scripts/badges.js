// badges.js — moduł zarządzający wyświetlaniem interaktywnych emoji-badge’y

// ======= KONFIGURACJA BADGES =======
// badges.js — interaktywne kontrolki dźwięku i mikrofonu

window.sound = true;
window.mic = true;

const badgesData = [
  {
    top: '1rem',
    left: '1rem',
    main: '🔊',
    sub: '🚫',
    action: toggleSound,
  },
  {
    top: '1rem',
    left: '5rem',
    main: '🎙️',
    sub: '🔇',
    action: toggleMic,
  },
];

let badges = [];
let hideTimeout;

// ======= CSS dynamiczny =======
const style = document.createElement('style');
style.textContent = `
  .emoji-badge {
    position: fixed;
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0.625rem rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(0.375rem);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 2rem;
    transition: opacity 0.5s ease, transform 0.3s ease;
    opacity: 0;
    transform: scale(0.8);
    z-index: 9999;
  }
  .emoji-badge.show {
    opacity: 1;
    transform: scale(1);
  }
  .emoji-badge .sub-emoji {
    position: absolute;
    top: 0.375rem;
    left: 0.5rem;
    font-size: 1rem;
    opacity: 0.85;
  }
  .fade-out {
    opacity: 0 !important;
    transform: scale(0.9);
  }
`;
document.head.appendChild(style);

// ======= GŁÓWNE FUNKCJE =======
function createBadges() {
  removeBadges();

  badges = badgesData.map((data) => {
    const el = document.createElement('div');
    el.className = 'emoji-badge';
    el.style.top = data.top;
    el.style.left = data.left;
    el.innerHTML = `
      <span class="main-emoji">${data.main}</span>
      <span class="sub-emoji">${data.sub}</span>
    `;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      data.action?.();
      updateBadges(); // aktualizuj widok po akcji
    });
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    return el;
  });

  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => fadeOutBadges(), 1500);
}

function updateBadges() {
  // odśwież emoji po zmianach
  badges.forEach((el, i) => {
    el.innerHTML = `
      <span class="main-emoji">${badgesData[i].main}</span>
      <span class="sub-emoji">${badgesData[i].sub}</span>
    `;
  });
}

function fadeOutBadges() {
  badges.forEach((b) => b.classList.add('fade-out'));
  setTimeout(removeBadges, 500);
}

function removeBadges() {
  badges.forEach((b) => b.remove());
  badges = [];
}

// ======= AKCJE BADGES =======
function toggleSound() {
  // sprawdzenie, czy działa synteza mowy (SpeechSynthesis)
  const synth = window.speechSynthesis;
  const voices = synth?.getVoices?.() || [];
  const hasPolish = voices.some(v => v.lang.toLowerCase().startsWith('pl'));

  if (!synth || voices.length === 0 || !hasPolish) {
    alert('⚠️ Przeglądarka nie obsługuje syntezy mowy lub brak głosów PL.');
    window.sound = false;
    badgesData[0].sub = '🚫';
    console.warn('🚫 Brak obsługi mowy.');
    updateBadges();
    return;
  }

  // jeśli wszystko działa — przełącz dźwięk
  window.sound = !window.sound;
  badgesData[0].sub = window.sound ? '🚫' : '✅';
  console.log(`🎧 Dźwięk ${window.sound ? 'włączony' : 'wyłączony'}`);
  updateBadges();
}

function toggleMic() {
  // sprawdzenie, czy działa rozpoznawanie mowy (SpeechRecognition)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert('⚠️ Przeglądarka nie wspiera rozpoznawania mowy.');
    window.mic = false;
    badgesData[1].sub = '🚫';
    console.warn('🚫 Brak obsługi SpeechRecognition.');
    updateBadges();
    return;
  }

  // jeśli działa — przełącz mikrofon
  window.mic = !window.mic;
  badgesData[1].sub = window.mic ? '🚫' : '✅';
  console.log(`🎙️ Mikrofon ${window.mic ? 'włączony' : 'wyłączony'}`);
  updateBadges();
}


// ======= NASŁUCHIWANIE DWUKLIKU =======
document.addEventListener('dblclick', () => {
    if (window.token1.overlays.value === true) {
        createBadges();
    }
    else{
        removeBadges();
    }
});

// ======= EKSPORT MODUŁU (opcjonalnie) =======
//export { createBadges, removeBadges, badgesData };
