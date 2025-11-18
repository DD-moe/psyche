function getTrack(btn) {
  return btn.closest(".carousel").querySelector(".carousel-track");
}

function carouselNext(btn) {
  const track = getTrack(btn);
  const imgs = track.querySelectorAll("img");
  let idx = [...imgs].findIndex(i => i.classList.contains("active"));

  imgs[idx].classList.remove("active");
  idx = (idx + 1) % imgs.length;
  imgs[idx].classList.add("active");
}

function carouselPrev(btn) {
  const track = getTrack(btn);
  const imgs = track.querySelectorAll("img");
  let idx = [...imgs].findIndex(i => i.classList.contains("active"));

  imgs[idx].classList.remove("active");
  idx = (idx - 1 + imgs.length) % imgs.length;
  imgs[idx].classList.add("active");
}

function openTab(btn) {
  const tabs = btn.closest(".tabs");                   // kontener tego panelu
  const views = tabs.querySelector(".tabs-views");     // zbiór widoków
  const name = btn.dataset.tab;                        // nazwa zakładki

  // przełącz przyciski
  tabs.querySelectorAll(".tab-btn")
      .forEach(b => b.classList.toggle("active", b === btn));

  // przełącz widoki
  views.querySelectorAll(".tab-view")
      .forEach(v => v.classList.toggle("active", v.dataset.tab === name));
}

window.carouselPrev = carouselPrev;
window.carouselNext = carouselNext;
window.openTab = openTab;