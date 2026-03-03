    const wrapper = document.getElementById('questions-wrapper');

    // 2. Funkcja renderująca pytania
    function initQuiz() {
        quizData.forEach((data, qIndex) => {
            const qBlock = document.createElement('div');
            qBlock.className = 'question-block';
            
            qBlock.innerHTML = `<h3>${qIndex + 1}. ${data.question}</h3>`;
            
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options';

            data.options.forEach((opt, oIndex) => {
                const btn = document.createElement('button');
                btn.innerText = opt;
                btn.onclick = () => checkAnswer(qIndex, oIndex, optionsDiv);
                optionsDiv.appendChild(btn);
            });

            qBlock.appendChild(optionsDiv);
            wrapper.appendChild(qBlock);
        });
    }

    // 3. Logika sprawdzania odpowiedzi
    function checkAnswer(questionIdx, selectedIdx, container) {
        const buttons = container.querySelectorAll('button');
        const correctIdx = quizData[questionIdx].correct;

        buttons.forEach((btn, i) => {
            // Wyłączamy wszystkie przyciski w tym pytaniu po kliknięciu
            btn.disabled = true;

            // Zaznaczamy poprawną na zielono
            if (i === correctIdx) {
                btn.classList.add('correct');
            }

            // Jeśli użytkownik wybrał źle, zaznaczamy to na czerwono
            if (i === selectedIdx && selectedIdx !== correctIdx) {
                btn.classList.add('wrong');
            }
        });
    }

    // Uruchomienie testu
    initQuiz();