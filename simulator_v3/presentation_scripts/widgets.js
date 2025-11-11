async function widgetClick(el) {
  const widget = el.closest(".widget");
  if (!widget) return;

  const panel = widget.querySelector(".panel");
  const icon = widget.querySelector(".widget-icon");
  const controls = panel.querySelector(".controls");
  const btnMin = controls.children[0];
  const btnMax = controls.children[1];
  const btnNorm = controls.children[2];

  const action = el.dataset.action || ""; // może być "", "min", "max", "norm"

  switch (action) {
    case "min": {
      if (document.fullscreenElement) await document.exitFullscreen();
      panel.classList.add("hidden");
      icon.classList.remove("hidden");
      btnNorm.classList.add("hidden");
      btnMax.classList.remove("hidden");
      break;
    }

    case "max": {
      if (panel.requestFullscreen) await panel.requestFullscreen();
      btnMax.classList.add("hidden");
      btnNorm.classList.remove("hidden");
      break;
    }

    case "norm": {
      if (document.fullscreenElement) await document.exitFullscreen();
      btnNorm.classList.add("hidden");
      btnMax.classList.remove("hidden");
      break;
    }

    default: {
      // kliknięcie na ikonę — pokaż panel
      icon.classList.add("hidden");
      panel.classList.remove("hidden");
    }
  }
}

function termClick(el) {
  if (!el) return;

  if (!el.dataset.original) {
    el.dataset.original = el.childNodes[0].textContent.trim(); // tylko tekst, bez skryptu
  }
  const original = el.dataset.original;

  // znajdź wewnętrzny <script class="defs">
  const script = el.querySelector('script.defs');
  if (!script) return;

  let explanations = [];
  try {
    explanations = JSON.parse(script.textContent.trim());
  } catch (err) {
    console.error("Błąd parsowania JSON w <script>:", err);
  }

  let idx = el.dataset.index ? parseInt(el.dataset.index, 10) : 0;
  if (idx < explanations.length) {
    el.innerHTML = explanations[idx] + script.outerHTML; // zachowaj <script> w elemencie
    el.dataset.index = idx + 1;
  } else {
    el.innerHTML = original + script.outerHTML;
    el.dataset.index = 0;
  }
}

// globalizacja funkcji
window.widgetClick = widgetClick;
window.termClick = termClick;