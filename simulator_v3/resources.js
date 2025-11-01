// resources.js — logika przełączania zakładek

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deaktywuj wszystkie zakładki i przyciski
      buttons.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      // Aktywuj bieżącą
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.target);
      if (target) target.classList.add('active');
    });
  });
});

// === UZUPEŁNIENIE LOGIKI ===

// Globalne zmienne
window.GeminiToken = localStorage.getItem('simV3_Gemini_Token') || '';
window.ProjectDirectory = null;

document.addEventListener('DOMContentLoaded', () => {
  const tokenInput = document.getElementById('geminiToken');
  const folderBtn = document.getElementById('btn-folder');
  const folderStatus = document.getElementById('folder-status');
  const bodyPreview = document.getElementById('body-preview');
  const bodyCode = document.getElementById('body-code');

  // Jeśli token był zapisany — wstaw go do inputa (zamaskowany)
  if (window.GeminiToken) tokenInput.value = window.GeminiToken;

  // --- 1) Obsługa zapisu tokenu ---
  tokenInput.addEventListener('change', e => {
    window.GeminiToken = e.target.value.trim();
    if (window.GeminiToken) {
      localStorage.setItem('simV3_Gemini_Token', window.GeminiToken);
      console.log('Zapisano token Gemini');
    }
  });

  // --- 2) Wybór folderu projektu ---
  folderBtn.addEventListener('click', async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      window.ProjectDirectory = dirHandle;
      folderStatus.textContent = `📁 Wybrano: ${dirHandle.name}`;
      console.log('Folder projektu:', dirHandle);
      await loadProjectPreview(dirHandle);
    } catch (err) {
      console.warn('Nie wybrano folderu:', err);
    }
  });

  // --- 3) Wczytywanie podglądu index.html ---
  async function loadProjectPreview(dirHandle) {
    try {
      const fileHandle = await dirHandle.getFileHandle('index.html');
      const file = await fileHandle.getFile();
      const html = await file.text();

      // osadzamy kod w podglądzie (bez skryptów)
      bodyPreview.innerHTML = html;

      // Uzupełniamy ścieżki plików src (obrazki itp.)
      const elements = bodyPreview.querySelectorAll('[src]');
      for (const el of elements) {
        const src = el.getAttribute('src');
        if (!src.startsWith('http')) {
          try {
            const resHandle = await dirHandle.getFileHandle(src.replace('./', ''));
            const blob = await resHandle.getFile();
            el.src = URL.createObjectURL(blob);
          } catch {
            console.warn('Nie udało się wczytać:', src);
          }
        }
      }

      // Wstawienie kodu w zakładce 3
      const codeBox = bodyCode.querySelector('pre code');
      codeBox.textContent = html;
      applySyntaxHighlight(codeBox);

      // Wypisanie listy plików w folderze
      const fileList = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') fileList.push(entry.name);
      }
      fileList.sort();

      const listEl = document.createElement('ul');
      listEl.className = 'file-list';
      fileList.forEach(f => {
        const li = document.createElement('li');
        li.textContent = f;
        listEl.appendChild(li);
      });
      bodyCode.appendChild(listEl);
    } catch (err) {
      console.error('Błąd wczytywania projektu:', err);
    }
  }

  // --- 4) Proste kolorowanie składni HTML ---
    function applySyntaxHighlight(el) {
    let html = el.textContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Komentarze
    html = html.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="cmt">$1</span>');

    // Tagi z atrybutami
    html = html.replace(
        /(&lt;\/?)([a-zA-Z0-9\-]+)((?:\s+[a-zA-Z0-9\-:]+(?:="[^"]*")?)*)\s*(&gt;)/g,
        (_, open, tag, attrs, close) => {
        if (attrs) {
            attrs = attrs.replace(
            /([a-zA-Z0-9\-:]+)(=("[^"]*"))/g,
            '<span class="attr">$1</span><span class="eq">=</span><span class="val">$3</span>'
            );
        }
        return `<span class="tag">${open}${tag}</span>${attrs || ''}<span class="tag">${close}</span>`;
        }
    );

    el.innerHTML = html;
    }

    // === AI Editor: Wczytywanie promptów i obsługa przycisku ===
    document.addEventListener('DOMContentLoaded', async () => {
    const select = document.getElementById('promptSelect');
    const genBtn = document.getElementById('aiGenerateBtn');
    const resultBox = document.getElementById('aiResult');

    // Wczytaj prompts.json
    try {
        const res = await fetch('./prompts.json');
        const prompts = await res.json();

        // Grupowanie po kategorii
        const grouped = {};
        prompts.forEach(p => {
        if (!grouped[p.kategoria]) grouped[p.kategoria] = [];
        grouped[p.kategoria].push(p);
        });

        // Tworzenie optgroup
        select.innerHTML = '';
        Object.keys(grouped).forEach(cat => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = cat;
        grouped[cat].forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.funkcja;
            opt.textContent = p.nazwa;
            optgroup.appendChild(opt);
        });
        select.appendChild(optgroup);
        });
    } catch (err) {
        console.error('Nie udało się wczytać prompts.json:', err);
        select.innerHTML = '<option>Błąd ładowania promptów</option>';
    }

    // Obsługa przycisku Generuj
    genBtn.addEventListener('click', async () => {
        const selected = select.value;
        if (!selected) return alert('Wybierz prompt.');

        resultBox.value = '⏳ Generowanie...';

        try {
        // Wywołaj asynchronicznie wskazaną funkcję promptu (np. prompt_demo())
        if (typeof window[selected] === 'function') {
            const code = document.getElementById('aiCodeInput').value;
            const notes = document.getElementById('aiNotes').value;
            const files = document.getElementById('aiFiles').files;
            const result = await window[selected](code, notes, files);
            resultBox.value = result || 'Brak wyniku.';
        } else {
            resultBox.value = `Nie znaleziono funkcji: ${selected}`;
        }
        } catch (e) {
        console.error(e);
        resultBox.value = '❌ Błąd podczas generowania: ' + e.message;
        }
    });
    });


/// testowe prompty
async function prompt_refactor(code, notes, files) {
  return `Zrefaktoryzowany kod:\n${code}\n\nUwagi: ${notes || 'brak'}`;
}

async function prompt_explain(code) {
  return `Ten kod robi to:\n${code.slice(0, 80)}...`;
}

async function prompt_summarize(code, notes) {
  return `Podsumowanie:\nKod ma ${code.split('\n').length} linii.\n${notes ? 'Uwagi: ' + notes : ''}`;
}



});
