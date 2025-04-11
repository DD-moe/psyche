async function generate_case(AI, text, instruction_box) {
    const gemini_model = document.getElementById(AI);
    const textarea = document.getElementById(text);
    const instr = `
    Na podstawie podanych informacji wygeneruj instrukcję, bazując na podanym przykładzie:
    "
  Kacper Walicki, lat 27. Młody mężczyzna, bez stałego miejsca zamieszkania, bezrobotny od kilku miesięcy. Według własnych słów, jest "kapitanem gwiezdnej floty" i znajduje się na tajnej misji ocalenia ludzkości przed inwazją kosmitów. Twierdzi, że od lat prowadzi wojnę z "Sułtanem kosmitów", istotą zdolną manipulować umysłami ludzi. W jego narracji pojawiają się postaci jego pomocników – Janusza i Sebastiana – do których czasem się zwraca, ignorując rozmówcę.
  
  Pacjent bywa wulgarny, używa charakterystycznych powiedzonek takich jak: „ciasne jak po praniu”, „napierdalać kosmitów”. Gdy poczuje się niezrozumiany, bywa agresywny werbalnie i potrafi nazwać rozmówcę "tępym konowałem". Często przerywa, odpływa w wątek fantastyczny, a jego wypowiedzi są przepełnione patosem i misją „ratowania wszechświata”.
  
  Zarys sytuacji: Pacjent trafia do gabinetu w ramach interwencji kryzysowej po tym, jak sąsiedzi zgłosili niepokojące hałasy i dziwne okrzyki dochodzące z jego mieszkania. Sam twierdzi, że to przez atak kosmitów i konieczność „obrony placówki”.
  
  Prowadzisz dialog z użytkownikiem. Gdy użytkownik zada pytanie, odpowiedz jako Kacper. Odpowiedzi mogą być nie na temat, pełne patosu, czasem z wulgaryzmami i dygresjami oraz rozmowami z wyimaginowanymi postaciami. UWAGA: podawaj tylko czystą odpowiedź pacjenta, bez "Kacper Walicki: " i bez komentarzy narratora."
  
  `;
  
    const instruction = await gemini_model.generate(textarea.value, instr);
    document.getElementById(instruction_box).value = instruction;
    return instruction;
  }
  
  async function generate_description(AI, instructionText) {
    const gemini_model = document.getElementById(AI);
    const instr = `
    Na podstawie tej instrukcji wygeneruj opis symulacji, bazując na poniższym przykładzie:
  <h2>Kapitan gwiezdnej floty</h2>
  <h3>Poziom trudności: <b>🔴 trudny</b></h3>
  <p>Młody mężczyzna wchodzi do gabinetu bez pukania, rozgląda się nerwowo i siada przodem do drzwi.  
  Wzrok ma czujny, mówi szybko i z pasją coś o walce z kosmitami.  
  Czasem zwraca się do kogoś niewidzialnego, czasem do ciebie – nie zawsze uprzejmie.
  
  <b>⚠️ Uwaga:</b> Symulacja zawiera wulgarny język.</p>

  Zwróć tylko i wyłącznie gotowy kod HTML, bez '''.
  `;
  
    let description = await gemini_model.generate(instructionText, prompt);

    // Usuń potrójne cudzysłowy lub apostrofy otaczające cały wynik
    description = description.trim().replace(/^['"`]{3}|['"`]{3}$/g, '');
    const header = document.querySelector("header");
    header.innerHTML = description;
    return description;
  }
  
  async function new_case(AI, text, instruction_box) {
    const instruction = await generate_case(AI, text, instruction_box);
    await generate_description(AI, instruction);
    await generate_patient_card(AI, instruction);
    console.log('Przypadek gotowy!');
  }

  async function generate_patient_card(AI, instructionText) {
    const gemini_model = document.getElementById(AI);
    const prompt = `
  Na podstawie poniższej instrukcji wygeneruj pełny kod HTML wizytówki pacjenta do umieszczenia wewnątrz <div>. Przykład formatu:
  
  <div class="pearson"> 
    <div class="portrait">🧑🏻‍🚀</div>
    <h3 class="name">Kacper Walicki</h3>
    <h4 class="role">(pacjent)</h4>
    <speech-listener AI="ai" instruction="speaker" speaker="Kacper Walicki"></speech-listener>
  </div>
  
  Zwróć tylko i wyłącznie gotowy kod HTML, bez '''. Ustaw właściwe imię i nazwisko pacjenta oraz emoji zgodnie z profilem, jaki wyczytasz z instrukcji.
  
  INSTRUKCJA:
  `;
  
    let patientCardHTML = await gemini_model.generate(instructionText, prompt);

    // Usuń potrójne cudzysłowy lub apostrofy otaczające cały wynik
    patientCardHTML = patientCardHTML.trim().replace(/^['"`]{3}|['"`]{3}$/g, '');
    const container = document.getElementById("speakers");
    container.innerHTML = patientCardHTML;
  }
  