//Отображение даты в кнопке button id="dateButton">Selection Date< + работа Calendar
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const fp = flatpickr("#calendar-container", {
  inline: true,
  defaultDate: new Date(),
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


//Функциональность для отображения верной даты в header_of_table
// Функция форматирования даты в нужный формат для кнопки .count
function formatSelectedDate(date) {
  return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

// Получаем кнопку с классом count
const countButton = document.querySelector(".count");

// Функция для обновления текста кнопки с учетом верного отображения для сегодня,
// завтра и вчера и динамического подставления выбранную дату из календаря в остальных случаях.

function updateCountButton(date) {
  const today = new Date();
  // Обнуляем время для сравнения только по дате
  today.setUTCHours(0, 0, 0, 0);
  const selectedDate = new Date(date.getTime());
  selectedDate.setUTCHours(0, 0, 0, 0);

  const diffDays = Math.round((selectedDate - today) / (1000 * 60 * 60 * 24));

  let text;
  if (diffDays === 0) {
    text = "Today";
  } else if (diffDays === -1) {
    text = "Yesterday";
  } else if (diffDays === 1) {
    text = "Tomorrow";
  } else {
    text = months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
  }

  countButton.textContent = text;
}




//Генерация таблицы и синхронизация с календарём
const dayHeadersContainer = document.getElementById("dayHeaders");
const timeSlotsContainer = document.getElementById("timeSlots");
let selectedCell = null;
window.selectedDateTime = null; // Глобально храним выбранную дату и время

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

    days.forEach((day) => {
      const cell = document.createElement("div");
      cell.className = "split-cell";

      // Сохраняем дату и час в data-атрибутах
      const dateString = day.toISOString().split("T")[0]; // YYYY-MM-DD
      cell.dataset.date = dateString;
      cell.dataset.hour = hour;

      // Обработчик клика на ячейку
      cell.addEventListener("click", () => {
  if (selectedCell) {
    selectedCell.style.backgroundColor = ""; // Убираем подсветку
  }

  selectedCell = cell;
  cell.style.backgroundColor = "#dbeafe"; // Выделение (голубой фон)

  // Сохраняем выбранную дату и время
  const selectedDateTime = new Date(cell.dataset.date);
  selectedDateTime.setHours(cell.dataset.hour);
  selectedDateTime.setMinutes(0);
  selectedDateTime.setSeconds(0);

  window.selectedDateTime = selectedDateTime;
  console.log("Выбрано:", window.selectedDateTime);

  // ✅ Обновляем текст кнопки .count на основе центрального календаря
  updateCountButton(selectedDateTime);
});

      secondDio.appendChild(cell);
    });

    row.appendChild(secondDio);
    timeSlotsContainer.appendChild(row);
  }
}

// Помощник для сравнения дат (без учета времени)
function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
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


// Переменная для хранения выбранной даты в основном календаре
let selectedMainDate = fp.selectedDates[0] || new Date();

// CSS класс для выделения выбранного дня
const style = document.createElement('style');
style.textContent = `
  .selected-day {
    background-color: #3b82f6; /* ярко-синий фон */
    color: white;
    border-radius: 4px;
  }
`;
document.head.appendChild(style);







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



//Изменение цветового оформления
const themeButtons = document.querySelectorAll('.theme-option');
const targetButtons = document.querySelectorAll('#manageButton, #addButton, #colorThemeButton');

// Получаем все ячейки календаря
function getCalendarCells() {
  return document.querySelectorAll(
    '.calendar_table .first_dio, .calendar_table .second_dio > div, .time-slots .first_dio, .time-slots .second_dio > div'
  );
}

function clearThemeClasses(button) {
  button.classList.remove(
    'bg-blue-700', 'hover:bg-blue-800', 'focus:ring-blue-300',
    'bg-yellow-500', 'hover:bg-yellow-600', 'focus:ring-yellow-300',
    'bg-green-600', 'hover:bg-green-700', 'focus:ring-green-300',
    'bg-red-600', 'hover:bg-red-700', 'focus:ring-red-300',
    'bg-gradient-to-r', 'from-pink-500', 'via-yellow-500', 'to-green-500'
  );
}

function clearCellBackgrounds(cells) {
  cells.forEach(cell => {
    cell.style.backgroundColor = ''; // Сброс inline-стиля
    cell.style.backgroundImage = ''; // На случай градиента
  });
}

themeButtons.forEach(themeButton => {
  themeButton.addEventListener('click', () => {
    const theme = themeButton.dataset.theme;
    const calendarCells = getCalendarCells();

    // Обновление кнопок
    targetButtons.forEach(button => {
      clearThemeClasses(button);
      button.classList.remove('dark:bg-blue-600', 'dark:hover:bg-blue-700', 'dark:focus:ring-blue-800');

      switch (theme) {
        case 'blue':
          button.classList.add('bg-blue-700', 'hover:bg-blue-800', 'focus:ring-blue-300');
          break;
        case 'yellow':
          button.classList.add('bg-yellow-500', 'hover:bg-yellow-600', 'focus:ring-yellow-300');
          break;
        case 'green':
          button.classList.add('bg-green-600', 'hover:bg-green-700', 'focus:ring-green-300');
          break;
        case 'red':
          button.classList.add('bg-red-600', 'hover:bg-red-700', 'focus:ring-red-300');
          break;
        case 'multicolor':
          button.classList.add('bg-gradient-to-r', 'from-pink-500', 'via-yellow-500', 'to-green-500');
          break;
      }
    });

    // Обновление цвета ячеек календаря
    clearCellBackgrounds(calendarCells);

    calendarCells.forEach((cell, index) => {
      switch (theme) {
        case 'yellow':
          cell.style.backgroundColor = '#f8e07fff'; // Tailwind yellow-400
          break;
        case 'green':
          cell.style.backgroundColor = '#66c88aff'; // Tailwind green-500
          break;
        case 'red':
          cell.style.backgroundColor = '#ed8b8bff'; // Tailwind red-500
          break;
        case 'multicolor':
          // Радуга на ячейках — чередуем цвета
          const colors = ['#ed8b8bff', '#f8e07fff', '#66c88aff', '#7eacf6ff', '#b395f8ff']; // розовый, жёлтый, зелёный, синий, фиолетовый
          cell.style.backgroundColor = colors[index % colors.length];
          break;
        case 'blue':
        default:
          // Ничего не делать — оставить текущий стиль
          break;
      }
    });
  });
});
