//Отображение даты в кнопке button id="dateButton">Selection Date< + работа Calendar
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const fp = flatpickr("#calendar-container", {
  inline: true,
  defaultDate: "2025-06-19",
  minDate: "2025-01-01",
  maxDate: "2025-12-31",
  onChange: function(selectedDates) {
    if (selectedDates.length > 0) {
      const date = selectedDates[0];
      const formatted = months[date.getMonth()] + " " + date.getFullYear();
      document.getElementById("dateButton").textContent = formatted;
    }
  }
});

// Обновляем кнопку сразу при загрузке страницы
if (fp.selectedDates.length > 0) {
  const date = fp.selectedDates[0];
  const formatted = months[date.getMonth()] + " " + date.getFullYear();
  document.getElementById("dateButton").textContent = formatted;
}