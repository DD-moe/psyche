document.addEventListener('DOMContentLoaded', function() {
    // Obsługa przełącznika trybu ciemnego/jasnego
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    
    if (darkModeSwitch) {
        darkModeSwitch.addEventListener('change', function() {
            if (this.checked) {
                document.body.setAttribute('data-bs-theme', 'dark');
            } else {
                document.body.setAttribute('data-bs-theme', 'light');
            }
        });
    }

    // obsługa filtrowania treści
    const switches = document.querySelectorAll('.filter-switch');
    const contentItems = document.querySelectorAll('.content-item');  // basic / mnemonic / practical / advanced  

    function updateVisibility() {
        // Tworzymy listę aktywnych kategorii (tych, które są zaznaczone)
        const activeCategories = Array.from(switches)
            .filter(sw => sw.checked)
            .map(sw => sw.id);

        contentItems.forEach(item => {
            // Sprawdzamy, czy element ma przynajmniej jedną z zaznaczonych klas
            const itemClasses = Array.from(item.classList);
            const isVisible = activeCategories.some(cat => itemClasses.includes(cat));

            if (isVisible) {
                item.style.display = 'block'; // Pokaż
                // Opcjonalnie: dodaj animację Bootstrapa
                item.classList.add('fade', 'show');
            } else {
                item.style.display = 'none'; // Ukryj
            }
        });
    }

    // Dodanie zdarzenie 'change' do każdego przełącznika
    switches.forEach(sw => {
        sw.addEventListener('change', updateVisibility);
    });

    // uruchamiamy na stracie w trakcie konfiguracji lekcji
    updateVisibility();

    // logika dla fiszek
    const flipButtons = document.querySelectorAll('.flip-btn');

    flipButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Pobieramy identyfikatory obu stron z atrybutów przycisku
            const frontSelector = this.getAttribute('data-target-front');
            const backSelector = this.getAttribute('data-target-back');
            
            const frontEl = document.querySelector(frontSelector);
            const backEl = document.querySelector(backSelector);

            // Przełączamy widoczność (klasa d-none ukrywa element)
            if (frontEl.classList.contains('d-none')) {
                frontEl.classList.remove('d-none');
                backEl.classList.add('d-none');
            } else {
                frontEl.classList.add('d-none');
                backEl.classList.remove('d-none');
            }
        });
    }); 

    // #######
    // Obsługa przełącznika resetu wszystkich ustawień
    const resetSettings = document.getElementById('resetSettings');
    
    if (resetSettings) {
        resetSettings.addEventListener('click', function() {
            document.body.setAttribute('data-bs-theme', 'light');
            darkModeSwitch.checked = false;
            switches.forEach(sw => {
                sw.checked = true;
            })
            updateVisibility();
        });
    }

});