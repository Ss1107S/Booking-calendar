let currentSelectedDate = new Date();
// Переменная для хранения выбранной даты в основном календаре
let selectedMainDate = currentSelectedDate;
let selectedCell = null;
window.selectedDateTime = null; // Глобально храним выбранную дату и время

// Language switching
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

//Отображение даты в кнопке button id="dateButton">Selection Date< + работа Calendar
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
// -- persisted --
let currentLanguage = localStorage.getItem('language') || 'en';

// -- elements --
// Получаем кнопку с классом count
const countButton = document.querySelector(".count");
//Генерация таблицы и синхронизация с календарём
const dayHeadersContainer = document.getElementById("dayHeaders");
const timeSlotsContainer = document.getElementById("timeSlots");
const calendarContainer = document.getElementById('calendar-container');
//Изменение цветового оформления
const themeButtons = document.querySelectorAll('.theme-option');
const targetButtons = document.querySelectorAll('#manageButton, #addButton, #colorThemeButton');


const picker = new DatePicker({
  container: calendarContainer,
  value: currentSelectedDate,
  autoClose: false,
  onSelect: (selectedDate) => {
    currentSelectedDate = selectedDate;

    updateDateButton(currentSelectedDate);
    generateTable(currentSelectedDate);

    updateCountButton(currentSelectedDate);
  }
});

updateDateButton(currentSelectedDate); // update on load

// Первичная генерация
generateTable(currentSelectedDate);



// -- button Count --

function updateDateButton(date) {
  const formatted = months[date.getMonth()] + " " + date.getFullYear();
  document.getElementById("dateButton").textContent = formatted;
}
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

// -- table & cells --

function generateTable(selectedDate) {
  dayHeadersContainer.innerHTML = "";
  timeSlotsContainer.innerHTML = "";

  const days = [];
  for (let i = -2; i < 5; i++) {
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

    const locale = currentLanguage === 'hr' ? 'hr-HR' : 'en-US';
    const dayName = day.toLocaleDateString(locale, { weekday: "short" });// День недели
    const dayNumber = day.getDate(); // Число

    dayDiv.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 12px;">${dayName}</div>
        <div style="font-size: 16px; font-weight: 600;">${dayNumber}</div>
      </div>
    `;
    
    dayHeadersContainer.appendChild(dayDiv);
    
    // Установка цвета для дня
    if (sameDay(day, selectedDate)) {
      dayDiv.style.color = "rgba(35, 166, 248, 1)"; // выбранный день
    } else if (day < selectedDate) {
      dayDiv.style.color = "#ccc"; // предыдущие дни
    } else {
      dayDiv.style.color = "#000"; // последующие дни
    }
    
    dayHeadersContainer.appendChild(dayDiv);
  });
  
  // Time slots
  for (let hour = 9; hour <= 21; hour++) {
    const row = document.createElement("div");
    row.className = `row_${hour}AM`;
    row.style.display = "flex";

    const timeCell = document.createElement("div");
    timeCell.className = "first_dio";
    timeCell.style.height = "auto";
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

  // Обновляем текст кнопки .count на основе центрального календаря
  updateCountButton(selectedDateTime);
});

      secondDio.appendChild(cell);
    });

    row.appendChild(secondDio);
    timeSlotsContainer.appendChild(row);
  }
}
function clearCellBackgrounds(cells) {
  cells.forEach(cell => {
    cell.style.backgroundColor = ''; // Сброс inline-стиля
    cell.style.backgroundImage = ''; // На случай градиента
  });
}

// Получаем все ячейки календаря
function getCalendarCells() {
  return document.querySelectorAll(
    '.calendar_table .first_dio, .calendar_table .second_dio > div, .time-slots .first_dio, .time-slots .second_dio > div'
  );
}

// -- time helpers --

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


// -- language --

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

      // Перевод текста в календаре (use DatePicker state)
      if (currentSelectedDate) {
        updateDateButton(currentSelectedDate);
      }
      generateTable(currentSelectedDate); // Обновим дни недели

}


// -- theme --

function clearThemeClasses(button) {
  button.classList.remove(
    'bg-blue-700', 'hover:bg-blue-800', 'focus:ring-blue-300',
    'bg-yellow-500', 'hover:bg-yellow-600', 'focus:ring-yellow-300',
    'bg-green-600', 'hover:bg-green-700', 'focus:ring-green-300',
    'bg-red-600', 'hover:bg-red-700', 'focus:ring-red-300',
    'bg-gradient-to-r', 'from-pink-500', 'via-yellow-500', 'to-green-500'
  );
}


// -- events --

// Переводим сразу при загрузке
document.addEventListener('DOMContentLoaded', ()=>{
  translateUI();

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

});

document.getElementById('languageToggle').addEventListener('click', () => {
  currentLanguage = (currentLanguage === 'en') ? 'hr' : 'en';
  localStorage.setItem('language', currentLanguage);
  translateUI();
});


//--button Add--
// Уникальные переменные для Add-кнопок и форм
const uniqueAddButton = document.getElementById("addButton");
const uniqueAddSearch = document.getElementById("addSearch");
const uniqueEventModal = document.getElementById("eventModal");
const uniqueFewEventsModal = document.getElementById("fewEventsModal");

const uniqueEventForm = document.getElementById("eventForm");
const uniqueFewEventsForm = document.getElementById("fewEventsForm");

const uniqueAddList = document.getElementById("add-list");

// Хранилище событий для отображения и сортировки
const eventDataMap = {}; // { "YYYY-MM-DD_HH": [ "Meeting", "Zoo" ] }

// Показать модальную форму
function openModal(modal) {
  modal.classList.remove("hidden");
}

// Очистка модальных форм
function resetForm(formElement) {
  formElement.reset();
}

// Обработчик отображения выпадающего меню при клике на Add
uniqueAddButton.addEventListener("click", () => {
  uniqueAddSearch.classList.toggle("hidden");
});

// Функция закрывает все модальные окна
function closeAllModals() {
  uniqueEventModal.classList.add("hidden");
  uniqueFewEventsModal.classList.add("hidden");
}

// При выборе Event:
uniqueAddList.querySelector(".event-option").addEventListener("click", () => {
  closeAllModals();               // закрываем все формы
  openModal(uniqueEventModal);    // открываем нужную
  uniqueAddSearch.classList.add("hidden"); // скрываем выпадающее меню
});

// При выборе Few Events:
uniqueAddList.querySelector(".fewEvents-option").addEventListener("click", () => {
  closeAllModals();
  openModal(uniqueFewEventsModal);
  uniqueAddSearch.classList.add("hidden");
});

//--modal form Event--
// Добавление Event
uniqueEventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = e.target.title.value.trim();
  const description = e.target.description.value.trim();

  if (!window.selectedDateTime) {
    alert("Please select a time slot first.");
    return;
  }

  const payload = {
    title,
    description,
    datetime: window.selectedDateTime.toISOString(),
  };

  /*try {
    await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    insertEventIntoCell(window.selectedDateTime, title); // sort = false по умолчанию

    resetForm(uniqueEventForm);
    closeModal(uniqueEventModal);
  } catch (err) {
    console.error("Failed to send event:", err);
  }*/
const tags = eventTags.getTags(); // сначала получи теги
insertEventIntoCell(window.selectedDateTime, { title, tags });
eventTags.resetTags(); // потом очисти
resetForm(uniqueEventForm); // потом форма
closeModal(uniqueEventModal);
});
//--modal form Few Events--
// Добавление Few Events 
// (с сортировкой по алфавиту при добавлении новых событий)

uniqueFewEventsForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!window.selectedDateTime) {
    alert("Please select a time slot first.");
    return;
  }

  const titles = Array.from(e.target.querySelectorAll('input[name="title[]"]')).map(input => input.value.trim());
  const descriptions = Array.from(e.target.querySelectorAll('textarea[name="description[]"]')).map(textarea => textarea.value.trim());

  const tags = fewEventsTags.getTags(); // сохраняем ОДИН раз

titles.forEach((title, index) => {
  if (title) {
    insertEventIntoCell(window.selectedDateTime, {
      title,
      description: descriptions[index] || "",
      tags,
    }, true);
  }
});

fewEventsTags.resetTags();
resetForm(uniqueFewEventsForm);
closeModal(uniqueFewEventsModal);
});
  /*try {
    await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    insertEventIntoCell(window.selectedDateTime, summary, true); // сортировка включена

    resetForm(uniqueFewEventsForm);
    closeModal(uniqueFewEventsModal);
  } catch (err) {
    console.error("Failed to send few events:", err);
  }*/

// Вставка события в нужную ячейку календаря
// dateObj — объект даты и времени события
// event — объект события { title: string, tags: string[] }
// sort — если true, сортируем события по названию
function insertEventIntoCell(dateObj, event, sort = false) {
  const dateStr = dateObj.toISOString().split("T")[0];  // Получаем дату в формате YYYY-MM-DD
  const hour = dateObj.getHours();                      // Получаем час события (0-23)
  const key = `${dateStr}_${hour}`;                     // Формируем уникальный ключ для ячейки (дата + час)

  // Если для этой ячейки еще нет массива с событиями, создаём пустой массив
  if (!eventDataMap[key]) {
    eventDataMap[key] = [];
  }

  // Добавляем новое событие (объект с title и tags) в массив
  eventDataMap[key].push(event);

  // Если нужно, сортируем массив событий по названию (title)
  if (sort) {
    eventDataMap[key].sort((a, b) => a.title.localeCompare(b.title));
  }

  // Находим DOM-элемент ячейки календаря по дате и часу
  const targetCell = document.querySelector(
    `.split-cell[data-date="${dateStr}"][data-hour="${hour}"]`
  );

  // Если ячейка не найдена, выводим предупреждение и выходим
  if (!targetCell) {
    console.warn(`⚠️ Calendar cell not found for date: ${dateStr}, hour: ${hour}`);
    return;
  }

  // Очищаем содержимое ячейки перед добавлением новых событий
  targetCell.innerHTML = "";

  // Создаем список ul для отображения всех событий в ячейке
  const ul = document.createElement("ul");

  // Проходим по каждому событию в массиве для данной ячейки
  eventDataMap[key].forEach(({ title, tags }) => {
    // Создаем элемент li с названием события
    const li = document.createElement("li");
    li.textContent = title;

    // Создаем контейнер для тегов события
    const tagsContainer = document.createElement("div");
    tagsContainer.classList.add("tags-container");

    // Для каждого тега создаем span и добавляем в контейнер тегов
    tags.forEach(tag => {
      const tagElem = document.createElement("span");
      tagElem.classList.add("tag");
      tagElem.textContent = tag;
      tagsContainer.appendChild(tagElem);
    });

    // Добавляем контейнер тегов в элемент события
    li.appendChild(tagsContainer);

    // Добавляем событие в список ul
    ul.appendChild(li);
  });

  // Вставляем список событий в ячейку календаря
  targetCell.appendChild(ul);
}
// Закрытие модальных форм при клике на Cancel
function closeModal(modal) {
  modal.classList.add("hidden");
}

uniqueEventForm.querySelector('button[type="button"]').addEventListener("click", () => {
  resetForm(uniqueEventForm);
  closeModal(uniqueEventModal);
});

uniqueFewEventsForm.querySelector('button[type="button"]').addEventListener("click", () => {
  resetForm(uniqueFewEventsForm);
  closeModal(uniqueFewEventsModal);
});






// --- Теги для модальных окон ---

// Функция инициализации тегов для модалки
function initTagInput(tagsInputId, tagsContainerId) {
  const tagsInput = document.getElementById(tagsInputId);
  const tagsContainer = document.getElementById(tagsContainerId);

  // Массив текущих тегов
  let tags = [];

  // Функция отрисовки тегов
  function renderTags() {
    tagsContainer.innerHTML = "";
    tags.forEach((tag, index) => {
      const tagElem = document.createElement("span");
      tagElem.classList.add("tag");
      tagElem.textContent = tag;

      // Кнопка удаления тега
      const removeBtn = document.createElement("span");
      removeBtn.classList.add("remove-tag");
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", () => {
        tags.splice(index, 1);
        renderTags();
      });

      tagElem.appendChild(removeBtn);
      tagsContainer.appendChild(tagElem);
    });
  }

  // Обработчик нажатия Enter
  tagsInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = tagsInput.value.trim();
      if (value && !tags.includes(value)) {
        tags.push(value);
        renderTags();
        tagsInput.value = "";
      }
    }
  });

  // Функция получения тегов
  function getTags() {
    return tags;
  }

  // Функция сброса тегов
  function resetTags() {
    tags = [];
    renderTags();
    tagsInput.value = "";
  }

  return { getTags, resetTags };
}

// --- Инициализация для каждой модалки ---
const eventTags = initTagInput("tagsInput", "tagsContainer");
const fewEventsTags = initTagInput("tagsInputFew", "tagsContainerFew");

// --- Добавление тегов в payload при сабмите ---

uniqueEventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = e.target.title.value.trim();
  const description = e.target.description.value.trim();

  if (!window.selectedDateTime) {
    alert("Please select a time slot first.");
    return;
  }

  const payload = {
    title,
    description,
    datetime: window.selectedDateTime.toISOString(),
    tags: eventTags.getTags(),
    // Можно добавить другие поля: guests, location, time range и т.д.
  };

  // Ваш существующий код вставки события
  insertEventIntoCell(window.selectedDateTime, {
  title,
  tags: eventTags.getTags(), 
});

  // Сброс тегов после отправки
  eventTags.resetTags();

  resetForm(uniqueEventForm);
  closeModal(uniqueEventModal);
});

uniqueFewEventsForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!window.selectedDateTime) {
    alert("Please select a time slot first.");
    return;
  }

  const titles = Array.from(e.target.querySelectorAll('input[name="title[]"]')).map(input => input.value.trim());
  const descriptions = Array.from(e.target.querySelectorAll('textarea[name="description[]"]')).map(textarea => textarea.value.trim());

  titles.forEach((title, index) => {
    if (title) {
      insertEventIntoCell(window.selectedDateTime, {
        title,
        tags: fewEventsTags.getTags(),
      }, true); // сортировка включена
    }
  });

  fewEventsTags.resetTags();
  resetForm(uniqueFewEventsForm);
  closeModal(uniqueFewEventsModal);
});

// --- Сброс тегов при закрытии модалки по Cancel ---
uniqueEventForm.querySelector('button[type="button"]').addEventListener("click", () => {
  eventTags.resetTags();
  resetForm(uniqueEventForm);
  closeModal(uniqueEventModal);
});

uniqueFewEventsForm.querySelector('button[type="button"]').addEventListener("click", () => {
  fewEventsTags.resetTags();
  resetForm(uniqueFewEventsForm);
  closeModal(uniqueFewEventsModal);
});

//Сохранение сразу, при нажатии "Add another event"(чтобы каждое событие сохранялось при его добавлении


function addEventBlockAndSaveCurrent() {
  const titles = Array.from(document.querySelectorAll('input[name="title[]"]')).map(input => input.value.trim());
  const descriptions = Array.from(document.querySelectorAll('textarea[name="description[]"]')).map(textarea => textarea.value.trim());

  const tags = fewEventsTags.getTags(); // ✅ теги получаем один раз здесь

  // Сохраняем последнее заполненное событие
    const lastIndex = titles.length - 1;
  const title = titles[lastIndex];
  const description = descriptions[lastIndex];

  if (title) {
    insertEventIntoCell(window.selectedDateTime, {
      title,
      description,
      tags, // ✅ вставляем теги
    }, true);
  }

  // Добавляем новый блок
  addEventBlock();
}





//--button weeklyViewButton--
// Correct logic for the weeklyViewButton:
// When selecting a corresponding item from the dropdown menu (First week, Second week, etc.),
// a specific week should be displayed, starting from Monday and ending on Sunday.
let isWeeklyViewMode = false;

// Get the date of the Monday of the required week of the month
function getStartOfWeekForMonth(weekIndex, referenceDate) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  
  const firstOfMonth = new Date(year, month, 1);
  
  // Find the first Monday (might be in the previous month)
  const dayOfWeek = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const firstMonday = new Date(year, month, 1 + offsetToMonday);

  const startOfTargetWeek = new Date(firstMonday);
  startOfTargetWeek.setDate(firstMonday.getDate() + weekIndex * 7);
  return startOfTargetWeek;
}

// Function to generate a full week (Mon-Sun)
function generateWeeklyTable(startDate) {
  isWeeklyViewMode = true;
  dayHeadersContainer.innerHTML = "";
  timeSlotsContainer.innerHTML = "";

  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }

  // Day headers
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

    const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
    const dayNumber = day.getDate();

    dayDiv.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 12px;">${dayName}</div>
        <div style="font-size: 16px; font-weight: 600;">${dayNumber}</div>
      </div>
    `;

    dayHeadersContainer.appendChild(dayDiv);
  });

  // Time slots by hour
  for (let hour = 9; hour <= 21; hour++) {
    const row = document.createElement("div");
    row.className = `row_weekly_${hour}`;
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

      const dateString = day.toISOString().split("T")[0];
      cell.dataset.date = dateString;
      cell.dataset.hour = hour;

      // Cell selection handler
      cell.addEventListener("click", () => {
        if (selectedCell) {
          selectedCell.style.backgroundColor = "";
        }

        selectedCell = cell;
        cell.style.backgroundColor = "#dbeafe";

        const selectedDateTime = new Date(cell.dataset.date);
        selectedDateTime.setHours(cell.dataset.hour);
        selectedDateTime.setMinutes(0);
        selectedDateTime.setSeconds(0);

        window.selectedDateTime = selectedDateTime;
        updateCountButton(selectedDateTime);
      });

      secondDio.appendChild(cell);
    });

    row.appendChild(secondDio);
    timeSlotsContainer.appendChild(row);
  }
}

// Week menu click handler
const weeklyListItems = document.querySelectorAll("#weeklyView-list .theme-option");
weeklyListItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    const selectedDate = currentSelectedDate || new Date();
    const weekStartDate = getStartOfWeekForMonth(index, selectedDate);
    generateWeeklyTable(weekStartDate);
    
    // Update the .count button, passing the date of the first day of the week (Monday)
    updateCountButton(weekStartDate);

    // Optionally: reset the highlight of the selected cell
    if (selectedCell) {
      selectedCell.style.backgroundColor = "";
      selectedCell = null;
    }

    // Update the global selected date and time
    window.selectedDateTime = new Date(weekStartDate);
    window.selectedDateTime.setHours(9, 0, 0, 0); // for example, the first hour of the working day
  });
});


//--handlers for buttonLeft and buttonRight--
const buttonLeft = document.querySelector(".button_left");
const buttonRight = document.querySelector(".button_right");

buttonLeft.addEventListener("click", () => { 
  // Если currentSelectedDate не определена, взять сегодняшнюю дату 
if (!currentSelectedDate) {
   currentSelectedDate = new Date(); 
  } 
  currentSelectedDate.setDate(currentSelectedDate.getDate() - 1);
   // Синхронизируем глобальную дату 
   window.selectedDateTime = new Date(currentSelectedDate); 
   // Обновляем UI
    generateTable(currentSelectedDate); 
    updateCountButton(currentSelectedDate); 
    updateDateButton(currentSelectedDate); 
  }); 
  buttonRight.addEventListener("click", () => {
  if (!currentSelectedDate) { 
    currentSelectedDate = new Date(); 
  }
   currentSelectedDate.setDate(currentSelectedDate.getDate() + 1); 
   window.selectedDateTime = new Date(currentSelectedDate); 
   generateTable(currentSelectedDate); 
   updateCountButton(currentSelectedDate); 
   updateDateButton(currentSelectedDate); });


   