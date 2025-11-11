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
      panel.classList.add("hidden");
      icon.classList.remove("hidden");
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

  // zachowaj oryginalny content (tylko raz)
  if (!el.dataset.original) {
    el.dataset.original = el.innerHTML;
  }
  const original = el.dataset.original;

  // wczytaj explanations (bezpiecznie obrobić błąd parsowania)
  let explanations;
  try {
    explanations = JSON.parse(el.dataset.explanations || "[]");
    if (!Array.isArray(explanations)) explanations = [];
  } catch (err) {
    console.error("Błąd parsowania data-explanations:", err);
    return;
  }

  // indeks następnego wyjaśnienia do pokazania (0..len-1), jeśli brak -> 0
  let idx = el.dataset.index ? parseInt(el.dataset.index, 10) : 0;

  if (idx < explanations.length) {
    // pokaż wyjaśnienie o indeksie idx
    // explanations powinny zawierać HTML (np. "<b>...</b>")
    el.innerHTML = explanations[idx];
    // zapisz kolejny indeks
    el.dataset.index = idx + 1;
  } else {
    // jeśli już wszystkie wyjaśnienia pokazane — przywróć oryginał i resetuj indeks
    el.innerHTML = original;
    el.dataset.index = 0;
  }
}


window.widgetClick = widgetClick;
window.termClick = termClick;