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

//Генерация таблицы и синхронизация с календарём
const dayHeadersContainer = document.getElementById("dayHeaders");
const timeSlotsContainer = document.getElementById("timeSlots");

function generateTable(selectedDate) {
  dayHeadersContainer.innerHTML = "";
  timeSlotsContainer.innerHTML = "";

  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(selectedDate);
    day.setDate(selectedDate.getDate() + i);
    days.push(day);
  }

  // Header row
  days.forEach((day) => {
    const dayDiv = document.createElement("div");
    dayDiv.style.height = "46px";
    dayDiv.style.width = "155px";
    dayDiv.style.border = "1px solid #ccc";
    dayDiv.style.padding = "4px";
    dayDiv.style.boxSizing = "border-box";
    dayDiv.style.display = "flex";
    dayDiv.style.alignItems = "center";
    dayDiv.style.justifyContent = "center";
    dayDiv.textContent = day.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
    dayHeadersContainer.appendChild(dayDiv);
  });

  // Time slots
  for (let hour = 9; hour <= 21; hour++) {
    const row = document.createElement("div");
    row.className = `row_${hour}AM`;
    row.style.display = "flex";

    const timeCell = document.createElement("div");
    timeCell.className = "first_dio";
    timeCell.style.height = "46px";
    timeCell.style.width = "46px";
    timeCell.style.border = "1px solid #ccc";
    timeCell.style.padding = "4px";
    timeCell.style.boxSizing = "border-box";
    timeCell.style.display = "flex";
    timeCell.style.alignItems = "center";
    timeCell.style.justifyContent = "center";
    timeCell.textContent = formatHour(hour);
    row.appendChild(timeCell);

    const secondDio = document.createElement("div");
    secondDio.className = "second_dio";

    days.forEach(() => {
      const col = document.createElement("div");
      col.style.height = "23px";
      col.style.width = "155px";
      col.style.border = "1px solid #ccc";
      col.style.padding = "4px";
      col.style.boxSizing = "border-box";
      secondDio.appendChild(col);
    });

    row.appendChild(secondDio);
    timeSlotsContainer.appendChild(row);
  }
}

function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour > 12 ? hour - 12 : hour;
  return `${hour12} ${suffix}`;
}

// Первичная генерация
generateTable(fp.selectedDates[0] || new Date());

// Перегенерация при выборе даты
fp.config.onChange.push(function(selectedDates) {
  if (selectedDates.length > 0) {
    generateTable(selectedDates[0]);
  }
});

//Переключение языков
const translations = {
    en: {
        title: "Booking Calendar",
        dateButton: "Selection Date",
        scheduleText: "Count of scheduels of this week",
        weeklyView: "Weekly view",
        languageLabel: "EN",
        manage: "Manage",
        add: "Add",
        colorTheme: "Color Theme",
        filterBy: "Filter by:",
        allSelected: "All selected",
        services: "Services",
        staff: "Staff",
        location: "Location",
        sessionAvailability: "Session availability",
        otherEvents: "Other events",
        countDay: "CountDay"
    },
    hr: {
        title: "Kalendar za rezervacije",
        dateButton: "Odabir datuma",
        scheduleText: "Broj rasporeda za ovaj tjedan",
        weeklyView: "Tjedni pregled",
        languageLabel: "HR",
        manage: "Upravljaj",
        add: "Dodaj",
        colorTheme: "Tema boje",
        filterBy: "Filtriraj po:",
        allSelected: "Svi odabrani",
        services: "Usluge",
        staff: "Osoblje",
        location: "Lokacija",
        sessionAvailability: "Dostupnost termina",
        otherEvents: "Ostali događaji",
        countDay: "Broj dana"
    }
};
    let currentLanguage = localStorage.getItem('language') || 'en';

    function translateUI() {
    const t = translations[currentLanguage];

    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (t[key]) {
            // Учитываем, если кнопка содержит вложенные теги (например, иконки)
            if (el.childNodes.length > 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
                el.childNodes[0].nodeValue = t[key] + " ";
            } else {
                el.textContent = t[key];
            }
        }
    });

    // Перевод текста в календаре
    if (fp.selectedDates.length > 0) {
        const date = fp.selectedDates[0];
        const formatted = months[date.getMonth()] + " " + date.getFullYear();
        document.getElementById("dateButton").textContent = formatted;
    }

    generateTable(fp.selectedDates[0]); // Обновим дни недели
}
    document.getElementById('languageToggle').addEventListener('click', () => {
        currentLanguage = (currentLanguage === 'en') ? 'hr' : 'en';
        localStorage.setItem('language', currentLanguage);
        translateUI();
    });

    // Переводим сразу при загрузке
    document.addEventListener('DOMContentLoaded', translateUI);
