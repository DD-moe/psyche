// wytyczne do tworznenia promptów html:
const PROMPT_GUIDELINES = `
[Instrukcja dla modelu AI: generowanie slajdów prezentacji w HTML]

Twoim zadaniem jest wygenerowanie fragmentu kodu HTML przeznaczonego do wklejenia do elementu <div class="presentation"> w gotowym szablonie prezentacji.

⚙️ Struktura i zasady:
- Każdy slajd powinien być osobną sekcją w formacie:
  <section class="slide">
    ...treść slajdu...
  </section>

- Możesz także użyć:
  <section class="slide title-slide"> — dla slajdu tytułowego (zawiera h1 i ewentualnie .subtitle)

🎨 Dopuszczone elementy HTML:
- Nagłówki: <h1>, <h2>, <h3>
- Akapity: <p>
- Listy: <ul>, <ol>, <li>
- Obrazy: <img src="..." alt="...">
- Cytaty: <blockquote>
- Ewentualnie krótkie <strong> i <em> do podkreślenia znaczenia

🚫 Zabronione:
- Nie dodawaj <html>, <head>, <body> ani <div class="presentation">
- Nie stosuj inline CSS, znaczników <style>, <script> ani obcych klas
- Nie dodawaj linków zewnętrznych, ramek, formularzy, tabel ani przycisków
- Nie stosuj JS, atrybutów onClick itp.

🎨 Stylizacja:
Wszystkie style są już zdefiniowane w pliku CSS:
https://git.1ioe.top/psyche/simulator_v3/slides.css

Dostępne klasy CSS:
- .presentation — główny kontener (nie używaj bezpośrednio)
- .slide — pojedynczy slajd
- .title-slide — slajd tytułowy
- .content-slide — zwykły slajd z treścią
- .subtitle — podtytuł na slajdzie tytułowym

📏 Formatowanie:
- Zachowuj umiar — 1–3 akapity lub lista na slajd
- Wykorzystuj elementy semantyczne HTML
- Dbaj o czytelność i strukturę
- Nie używaj zbyt długich zdań — tekst ma być przejrzysty jak w prezentacji

🧩 Wynik:
Wynikowy HTML ma być gotowy do wklejenia bezpośrednio do .presentation w szablonie.
Nie dodawaj żadnych komentarzy, instrukcji ani opisów — tylko czysty kod HTML sekcji.
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
