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

window.widgetClick = widgetClick;