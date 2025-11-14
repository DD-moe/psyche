// wytyczne do tworznenia promptów html:
const PROMPT_GUIDELINES = `
[Instrukcja dla modelu AI:

Twoim zadaniem jest wygenerowanie fragmentu kodu HTML - generuj tylko fragment a nie cały HTML

Struktura i zasady:
- Każdy slajd powinien być osobną sekcją w formacie:
  <section class="slide">
    ...treść slajdu...
  </section>

Dopuszczone standardowe elementy HTML:
- Nagłówki: <h1>, <h2>, <h3>
- Akapity: <p>
- Listy: <ul>, <ol>, <li>
- Obrazy: <img src="..." alt="...">
- Cytaty: <blockquote>
- Przerwy: <br>, <hr>
- Linki: <a>
- Tabele: <table>, <thead>, <tr>, <tbody>, <th>, <td>
- Modyfikacje Tekstu: <i>, <b>, <em>, <span>, <s>, <strong>, <u>, <small>, <del>
- UWAGI: <srong>, <em>, <del> - mają odmienne stylowanie niż ich odpowiedniki: <b>, <i>, <s>

Zabronione:
- Nie dodawaj <html>, <head>, <body> ani <div class="presentation">
- Nie stosuj inline CSS, znaczników <style>, <script> ani obcych klas
[chyba, że użytkownik wyraźnie poprosi o to w prompcie]

Stylizacja:
Wszystkie style są już zdefiniowane w pliku CSS:
https://git.1ioe.top/psyche/simulator_v3/slides.css

Dostępne standardowe klasy CSS:
- list-style-type (modyfikacja domyślnych - odpowiednio dla ol i ul: decimal i disc):
  *.ol1 - upper-roman
  *.ol2 - lower-alpha
  *.ul1 - 💊
  *.ul2 - ⚕️
- list-style-position (domyślnie inner):
  *.outer - outer
- image (domyślnie width: 100% i width: auto) i (domyślnie height: 100% i height: auto) i (object-fit: contain):
  *.img-auto tylko (width: 100%, height:auto)
- text-align (domyślnie: center):
  *.right
  *.left
  *.justify
- display(domyslnie block dla elementów stanadrdowych, oprócz tabel i modyfikacji tekstu):
  *.block
  *.inline
  *.inl-block
- line-height:
  *.line-relaxed - 2
  *.line-loose - 3
- color (akapity, tabele, listy, itp. - domyślnie białe):
  *.color-primary - niebieskawy
  *.color-accent - czerwonawy
  *.color-warm - żółtawy 
  *.color-cool - fioletowawy
  *.color-vivid - pomarańczowawy
  *.color-pleasant - zielonkawy
- color (tytuły, nagłówki, itp. - domyślnie białe):
  *.color-muted - popielaty
  *.color-calm - sinoniebieski
  *.color-positive - morski
- background (domyślnie czarne):
  *.bg-blue - ciemnoniebieski
  *.bg-purple - ciemnopurpurowy
  *.bg-green - ciemnozielony
  *.bg-red - ciemnoczerwony
  *.bg-amber - brązowawy
- animation:
  *.anim - animacja wzrosku/spadku przezroczystości (zwraca uwagę na elemenety interaktywne)

🧩 Wynik:
Wynikowy HTML ma być gotowy do wklejenia bezpośrednio do .presentation w szablonie.
Nie dodawaj żadnych komentarzy, instrukcji ani opisów — tylko czysty kod HTML sekcji.
Zadbaj by HTML był czytelnie sformatowany
]`;

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
        ? text + '\n\n' + PROMPT_GUIDELINES + '\n\n Poniżej masz szczegółowe dane i polecenie od użytkownika:\n\n'
        : text + '\n\n Poniżej masz szczegółowe dane i polecenie od użytkownika:\n\n';
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
