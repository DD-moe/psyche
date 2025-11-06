document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('categories');

  try {
    const response = await fetch('./presentation.json');
    if (!response.ok) throw new Error('Nie udało się wczytać presentation.json');

    const data = await response.json();

    // Grupowanie wg kategorii
    const grouped = {};
    data.forEach(item => {
      if (!grouped[item.kategoria]) grouped[item.kategoria] = [];
      grouped[item.kategoria].push(item);
    });

    // Tworzenie struktury HTML
    Object.keys(grouped).forEach(category => {
      const section = document.createElement('div');
      section.className = 'category';

      // Nagłówek kategorii (nazwa + strzałka)
      const header = document.createElement('div');
      header.className = 'category-header row';

      const title = document.createElement('h3');
      title.className = 'category-title col';
      title.textContent = category;

      const arrow = document.createElement('span');
      arrow.className = 'arrow collapsed';
      arrow.textContent = '▶'; // początkowo "prawo"

      header.appendChild(title);
      header.appendChild(arrow);

      // Wrapper listy
      const listWrapper = document.createElement('div');
      listWrapper.className = 'list-wrapper collapsed';

      const list = document.createElement('ul');
      list.className = 'resource-list';

      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
              window.navigator.standalone === true; // dla iOS

      grouped[category].forEach(res => {
        const li = document.createElement('li');
        li.className = 'resource-item';
        const link = document.createElement('a');
        link.href = `./presentations/${res.nazwa}`;
        link.target = isPWA ? '_self' : '_blank';
        link.textContent = res.etykieta;
        li.appendChild(link);
        list.appendChild(li);
      });

      listWrapper.appendChild(list);
      section.appendChild(header);
      section.appendChild(listWrapper);
      container.appendChild(section);

      // Kliknięcie nagłówka rozwija / zwija
      header.addEventListener('click', () => {
        const isCollapsed = listWrapper.classList.toggle('collapsed');
        arrow.classList.toggle('rotated', !isCollapsed);

        if (!isCollapsed) {
          listWrapper.style.maxHeight = (list.scrollHeight + 25) + 'px';
        } else {
          listWrapper.style.maxHeight = '0';
        }
      });
    });
  } catch (err) {
    container.innerHTML = `<p class="muted small">Błąd wczytywania danych: ${err.message}</p>`;
    console.error(err);
  }
});
