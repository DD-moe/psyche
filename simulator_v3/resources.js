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

  // Kolorowanie komentarzy
  html = html.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="cmt">$1</span>');

  // Kolorowanie tagów i ich wnętrza
  html = html.replace(
    /(&lt;\/?)([a-zA-Z0-9\-]+)([^&]*?)(&gt;)/g,
    (_, open, tag, attrs, close) => {
      // koloruj atrybuty wewnątrz tagu
      attrs = attrs
        .replace(/([a-zA-Z0-9\-:]+)(=)("[^"]*")/g,
          '<span class="attr">$1</span><span class="eq">$2</span><span class="val">$3</span>'
        )
        .replace(/([a-zA-Z0-9\-:]+)/g, '<span class="attr">$1</span>'); // pojedyncze atrybuty bez wartości

      return `<span class="tag">${open}${tag}</span>${attrs}<span class="tag">${close}</span>`;
    }
  );

  el.innerHTML = html;
}


});
