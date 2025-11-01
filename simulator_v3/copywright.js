/* app.js — dodaje stopkę autora i modal licencyjny */

document.addEventListener('DOMContentLoaded',function(){
  // przygotuj kontener stopki
  const footer = document.createElement('div');
  footer.className = 'meta-footer card small no-select';

  const year = new Date().getFullYear();
  footer.innerHTML = `
  <div class="container">
    <div class="row">
      <div class="col">
        <strong>Autor:</strong> Damian Bezara<br>
        <span class="muted">Rok:</span> <span id="meta-year">${year}</span>
      </div>
      <div class="col" style="text-align:right">
        <button id="show-license" class="btn">🔒 Zobacz licencję</button>
      </div>
    </div>
  </div>
  `;

  document.body.appendChild(footer);

  // modal licencyjny — treść własnej licencji freeware z ograniczeniami
  const modal = document.createElement('div');
  modal.className = 'license-modal';
  modal.innerHTML = `
    <div class="license-dialog no-select" role="dialog" aria-modal="true">
      <h3 class="license-title">Licencja: Freeware — zakaz użycia komercyjnego</h3>
      <div class="license-body" id="license-text">
        <p>Wersja: 1.0 — (c) Damian Bezara</p>
        <p>Na mocy tej licencji udziela się prawa do używania niniejszego oprogramowania wyłącznie w celach edukacyjnych, badawczych oraz niekomercyjnych.</p>
        <ol>
          <li>Dozwolone: korzystanie, uruchamianie i udostępnianie kopii w celach niekomercyjnych, przy zachowaniu oryginalnego autora i informacji o licencji.</li>
          <li>Zakazane bez WYRAŹNEJ, PISEMNEJ zgody autora: użycie komercyjne, tworzenie produktów komercyjnych zawierających kod, kopiowanie fragmentów w celu ich edycji/inkorporacji do projektów o charakterze komercyjnym.</li>
          <li>Zakazana jest modyfikacja i publikacja zmodyfikowanej wersji bez formalnej zgody autora. Wnioski o zgodę należy kierować osobiście do autora.</li>
          <li>Autor nie ponosi odpowiedzialności za skutki użycia oprogramowania.</li>
        </ol>
      </div>
      <div class="license-actions">
        <button id="close-license" class="btn">Zamknij</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Otwarcie i zamknięcie
  const showBtn = document.getElementById('show-license');
  const closeBtn = modal.querySelector('#close-license');
  showBtn.addEventListener('click',()=>{
    modal.classList.add('active');
  });
  closeBtn.addEventListener('click',()=>{
    modal.classList.remove('active');
  });

  // Blokowanie kopiowania wewnątrz modal
  modal.addEventListener('copy',(e)=>{
    e.preventDefault();
    const selection = window.getSelection().toString();
    if(selection && selection.length>0){
      alert('Kopiowanie zablokowane. Aby uzyskać zgodę na użycie, skontaktuj się z autorem.');
    }
  });

  // Dodatkowa bariera — wyłącz zaznaczanie klawiszami w modalu
  modal.addEventListener('keydown',(e)=>{
    if((e.ctrlKey||e.metaKey) && (e.key === 'c' || e.key === 'C')){
      e.preventDefault();
      alert('Kopiowanie zablokowane. Aby uzyskać zgodę na użycie, skontaktuj się z autorem.');
    }
  });

});
