// resources.js — logika przełączania zakładek

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deaktywuj wszystkie zakładki i przyciski
      buttons.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      // Aktywuj bieżącą
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.target);
      if (target) target.classList.add('active');
    });
  });
});
