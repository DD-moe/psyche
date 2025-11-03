// wytyczne do tworznenia promptów html:
const PROMPT_GUIDELINES = `
[Wytyczne: wygeneruj treść HTML zgodną ze strukturą pliku "template.html".
Każda sekcja prezentacji powinna być umieszczona w <section class="slide">.
W treści stosuj nagłówki (h2–h3), akapity (<p>), listy (<ul><li>), obrazy (<img>) i cytaty.
Nie dodawaj znaczników <html>, <head> ani <body>. Wynik ma być gotowy do wklejenia do .presentation.]
`;

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.target)?.classList.add('active');
    });
  });

  // --- TOKEN GEMINI ---
  const tokenInput = document.getElementById('geminiToken');
  window.GeminiToken = localStorage.getItem('simV3_Gemini_Token') || '';

  if (window.GeminiToken) tokenInput.value = window.GeminiToken;

  tokenInput.addEventListener('change', e => {
    const val = e.target.value.trim();
    if (val) {
      window.GeminiToken = val;
      localStorage.setItem('simV3_Gemini_Token', val);
      console.log('Zapisano token Gemini');
    }
  });

  // --- WYBÓR API ---
  const apiSelect = document.querySelector('.select-api');
  const savedApi = localStorage.getItem('simV3_Choosed_API') || 'gemini';
  apiSelect.value = savedApi;
  apiSelect.addEventListener('change', () => {
    const choice = apiSelect.value;
    localStorage.setItem('simV3_Choosed_API', choice);
    console.log('Wybrano API:', choice);
  });

  // --- PROMPTY ---
  const customPromptsContainer = document.querySelector('.custom-prompts');
  const exportBtn = document.querySelector('.btn-export');
  const importBtn = document.querySelector('.btn-import');

  // Tworzenie 16 pustych promptów
  for (let i = 0; i < 16; i++) {
    const box = document.createElement('div');
    box.className = 'promptbox';
    box.innerHTML = `
      <input type="text" class="prompt-name" placeholder="Nazwa promptu">
      <textarea class="prompt-text" rows="3" placeholder="Treść promptu..."></textarea>
      <div class="row">
        <label><input type="checkbox" class="prompt-include"> Dołącz instrukcje HTML</label>
        <button class="btn btn-copy">Kopiuj</button>
      </div>
    `;
    customPromptsContainer.appendChild(box);
  }

  // Obsługa kopiowania
  document.body.addEventListener('click', e => {
    if (e.target.classList.contains('btn-copy')) {
      const box = e.target.closest('.promptbox');
      const text = box.querySelector('.prompt-text').value;
      const include = box.querySelector('.prompt-include').checked;
      const toCopy = include
        ? text + '\n\n' + PROMPT_GUIDELINES
        : text;
      navigator.clipboard.writeText(toCopy);
      e.target.textContent = 'Skopiowano!';
      setTimeout(() => (e.target.textContent = 'Kopiuj'), 1500);
    }
  });

  // Eksport własnych promptów
  exportBtn.addEventListener('click', () => {
    const data = [];
    customPromptsContainer.querySelectorAll('.promptbox').forEach(box => {
      data.push({
        name: box.querySelector('.prompt-name').value,
        text: box.querySelector('.prompt-text').value,
        include: box.querySelector('.prompt-include').checked,
      });
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_prompts.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import własnych promptów
  importBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const arr = JSON.parse(ev.target.result);
          const boxes = customPromptsContainer.querySelectorAll('.promptbox');
          arr.forEach((p, i) => {
            if (boxes[i]) {
              boxes[i].querySelector('.prompt-name').value = p.name || '';
              boxes[i].querySelector('.prompt-text').value = p.text || '';
              boxes[i].querySelector('.prompt-include').checked = !!p.include;
            }
          });
          console.log('Zaimportowano prompty');
        } catch (err) {
          alert('Błąd podczas importu pliku.');
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });
});
