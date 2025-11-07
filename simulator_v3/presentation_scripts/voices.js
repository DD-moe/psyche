// voices.js — moduł do syntezy i rozpoznawania mowy

let recognition = null;
let activeUtterance = null;

// ================== SYNTEZA MOWY ==================

/**
 * Inicjalizuje i wybiera polski głos z największym indeksem.
 * Następnie czyta przekazany tekst na głos.
 * @param {string} text - tekst do przeczytania
 */
export async function speakText(text) {

  if (window.sound === false) {
    return
  }

  const synth = window.speechSynthesis;
  if (!synth) {
    alert('⚠️ Twoja przeglądarka nie obsługuje syntezy mowy.');
    return;
  }

  const voices = await waitForVoices(1000);
  const polishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('pl'));

  if (polishVoices.length === 0) {
    alert('⚠️ Brak głosów dla języka polskiego.');
    return;
  }

  const chosenVoice = polishVoices[polishVoices.length - 1];
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = chosenVoice;
  utterance.lang = chosenVoice.lang;
  utterance.rate = 1;
  utterance.pitch = 1;

  activeUtterance = utterance;
  synth.speak(utterance);
}

/**
 * Zatrzymuje wszystkie trwające i zaplanowane odczyty mowy.
 */
export function stopAllSpeech() {
  const synth = window.speechSynthesis;
  if (synth && synth.speaking) {
    synth.cancel();
    console.log('🛑 Zatrzymano wszystkie syntezy mowy.');
  }
}

/**
 * Pomocnicza funkcja: czeka na załadowanie głosów.
 */
function waitForVoices(timeout = 1000) {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    let voices = synth.getVoices();

    if (voices.length) {
      resolve(voices);
      return;
    }

    const interval = setInterval(() => {
      voices = synth.getVoices();
      if (voices.length) {
        clearInterval(interval);
        resolve(voices);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      resolve(synth.getVoices());
    }, timeout);
  });
}

// ================== ROZPOZNAWANIE MOWY ==================

/**
 * Rozpoczyna rozpoznawanie mowy i zwraca callbacki z wynikami.
 * @param {(text: string, isFinal: boolean) => void} onResult - callback otrzymujący fragment tekstu
 */
export function startRecognition(onResult) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (window.mic === false) {
    return
  }

  if (!SpeechRecognition) {
    alert('⚠️ Twoja przeglądarka nie obsługuje rozpoznawania mowy.');
    return;
  }

  // zatrzymaj poprzednie instancje
  stopRecognition();

  recognition = new SpeechRecognition();
  recognition.lang = 'pl-PL';
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript.trim();
      if (event.results[i].isFinal) finalTranscript += transcript + ' ';
      else interimTranscript += transcript + ' ';
    }

    if (onResult) {
      if (finalTranscript) onResult(finalTranscript, true);
      else if (interimTranscript) onResult(interimTranscript, false);
    }
  };

  recognition.onerror = (e) => console.warn('🎙️ Błąd rozpoznawania mowy:', e.error);
  recognition.onend = () => console.log('🎙️ Rozpoznawanie mowy zakończone.');

  recognition.start();
  console.log('🎙️ Rozpoznawanie mowy rozpoczęte.');
}

/**
 * Kończy wszystkie aktywne sesje rozpoznawania mowy.
 */
export function stopRecognition() {
  if (recognition) {
    try {
      recognition.stop();
      recognition.abort();
      console.log('🛑 Rozpoznawanie mowy zatrzymane.');
    } catch (e) {
      console.warn('⚠️ Błąd zatrzymania rozpoznawania:', e);
    } finally {
      recognition = null;
    }
  }
}
