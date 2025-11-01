document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('categories');

  try {
    const response = await fetch('./resources.json');
    if (!response.ok) throw new Error('Nie udało się wczytać resources.json');

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

      const title = document.createElement('h3');
      title.className = 'category-title';
      title.textContent = category;

      const listWrapper = document.createElement('div');
      listWrapper.className = 'list-wrapper collapsed'; // domyślnie zwinięta

      const list = document.createElement('ul');
      list.className = 'resource-list';
      grouped[category].forEach(res => {
        const li = document.createElement('li');
        li.className = 'resource-item';
        const link = document.createElement('a');
        link.href = `./resources/${res.nazwa}`;
        link.target = '_blank';
        link.textContent = res.etykieta;
        li.appendChild(link);
        list.appendChild(li);
      });

      listWrapper.appendChild(list);
      section.appendChild(title);
      section.appendChild(listWrapper);
      container.appendChild(section);

      // Kliknięcie rozwija / zwija
      title.addEventListener('click', () => {
        const isCollapsed = listWrapper.classList.toggle('collapsed');
        if (!isCollapsed) {
          listWrapper.style.maxHeight = list.scrollHeight + 'px';
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
