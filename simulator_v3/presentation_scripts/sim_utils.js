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

window.carouselPrev = carouselPrev;
window.carouselNext = carouselNext;