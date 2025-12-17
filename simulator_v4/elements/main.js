function getStyleSheet(uniqueTitle) {
  for (const sheet of document.styleSheets) {
    if (sheet.title === uniqueTitle) {
      return sheet;
    }
  }
  return null;
}

function setupVisibility() {
  const sheet = getStyleSheet("kategorie");
  if (!sheet) return;

  const visibilities = {
    cat1: document.getElementById("cat1").checked,
    cat2: document.getElementById("cat2").checked,
    cat3: document.getElementById("cat3").checked,
    cat4: document.getElementById("cat4").checked
  };

  // Najpierw usuń wszystkie istniejące reguły
  while(sheet.cssRules.length > 0){
    sheet.deleteRule(0);
  }

  // Dodaj nowe reguły
  for (const [cat, visible] of Object.entries(visibilities)) {
    if (!visible) {
      sheet.insertRule(`.${cat} { display: none; }`, sheet.cssRules.length);
    }
  }
}

function openDialog(id, iframeSrc) {
  const dialog = document.getElementById(id);
  if (!dialog) return;

  const iframe = dialog.querySelector('iframe');

  // funkcja finalnego otwarcia
  const show = () => {
    dialog.showModal();
    dialog.scrollTop = 0;
  };

  // jeśli nie używamy iframe
  if (!iframe || !iframeSrc) {
    show();
    return;
  }

  iframe.addEventListener('load', function handler() {
    iframe.hidden = false;
    dialog.showModal();
    
    // usuwamy listener po pierwszym wywołaniu
    iframe.removeEventListener('load', handler);
    dialog.scrollTop = 0;
  });

  // ustawienie SRC uruchamia ładowanie
  if (iframe.src === iframeSrc) {
    dialog.showModal();
  }
  else{
    iframe.src = iframeSrc;
  }
}

function closeDialog(button){
    button.closest('dialog').close();
}

function expandDefinition(trigger) {
  if (!trigger) return;

  const target = document.getElementById(trigger.dataset.contentid);
  const template = document.getElementById(trigger.dataset.templateid);

  if (target && template) {
    target.innerHTML = '';
    target.appendChild(template.content.cloneNode(true));
  }
}

window.getStyleSheet = getStyleSheet;
window.setupVisibility = setupVisibility;
window.openDialog = openDialog;
window.closeDialog = closeDialog;
window.expandDefinition = expandDefinition;
