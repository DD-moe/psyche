// badges.js — moduł zarządzający wyświetlaniem interaktywnych emoji-badge’y
import { stopAllSpeech, startRecognition, stopRecognition } from './voices.js';
// ======= KONFIGURACJA BADGES =======
// badges.js — interaktywne kontrolki dźwięku i mikrofonu

window.sound = false;
window.mic = false;

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
    left: '6rem',
    main: '🎙️',
    sub: '🚫',
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

async function toggleSound() {
  const synth = window.speechSynthesis;

  // jeśli brak wsparcia dla speechSynthesis
  if (!synth) {
    alert('⚠️ Przeglądarka nie obsługuje syntezy mowy.');
    window.sound = false;
    badgesData[0].sub = '🚫';
    updateBadges();
    return;
  }

  // czekaj aż głosy zostaną załadowane (max 1 sekunda)
  const voices = await waitForVoices(1500);
  const hasPolish = voices.some(v => v.lang.toLowerCase().startsWith('pl'));

  if (voices.length === 0 || !hasPolish) {
    alert('⚠️ Brak głosów dla języka polskiego.');
    window.sound = false;
    badgesData[0].sub = '🚫';
    updateBadges();
    return;
  }

  // wszystko działa — toggle
  window.sound = !window.sound;
  if (window.sound === false) {
    stopAllSpeech();
  }
  badgesData[0].sub = window.sound ? '✅' : '🚫';
  console.log(`🎧 Dźwięk ${window.sound ? 'włączony' : 'wyłączony'}`);
  updateBadges();
}

function toggleMic() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert('⚠️ Przeglądarka nie wspiera rozpoznawania mowy.');
    window.mic = false;
    badgesData[1].sub = '🚫';
    updateBadges();
    return;
  }

  // działa — toggle
  window.mic = !window.mic;
  if (window.mic === false) {
    stopRecognition();
  }
  badgesData[1].sub = window.mic ? '✅' : '🚫';
  console.log(`🎙️ Mikrofon ${window.mic ? 'włączony' : 'wyłączony'}`);
  updateBadges();
}

// ======= Pomocnicza funkcja: czekanie na głosy =======
function waitForVoices(timeout = 1000) {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    let voices = synth.getVoices();

    if (voices.length) {
      resolve(voices);
      return;
    }

    const handle = setInterval(() => {
      voices = synth.getVoices();
      if (voices.length) {
        clearInterval(handle);
        resolve(voices);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(handle);
      resolve(synth.getVoices());
    }, timeout);
  });
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

// ======= OBSŁUGA PISANIA GŁOSOWEGO =======

document.querySelectorAll('textarea').forEach((textarea) => {
  let isRecognizing = false;
  let tpr = '', tpo = '', rp = '';

  textarea.addEventListener('dblclick', () => {
    if (document.activeElement === textarea) {
      if (!isRecognizing) {
        isRecognizing = true;
        console.log('🎤 Rozpoczynam rozpoznawanie mowy dla tego textarea');

        // zapamiętaj tekst sprzed rozpoczęcia rozpoznawania
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        tpr = textarea.value.substring(0, start);
        tpo = textarea.value.substring(end);
        rp = '';

        startRecognition((text, isFinal) => {
          rp = text; // po prostu aktualizujemy bufor rozpoznanego tekstu
          textarea.value = tpr + rp + tpo;

          // przenosimy kursor za rozpoznany tekst
          const cursor = (tpr + rp).length;
          textarea.selectionStart = textarea.selectionEnd = cursor;
        });
      }
    } else {
      console.log('🛑 Textarea nieaktywna — zatrzymuję rozpoznawanie.');
      stopRecognition();
      isRecognizing = false;
    }
  });

  textarea.addEventListener('blur', () => {
    if (isRecognizing) {
      console.log('🛑 Utracono fokus — zatrzymuję rozpoznawanie.');
      stopRecognition();
      isRecognizing = false;
    }
  });
});

