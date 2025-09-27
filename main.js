 let currentSelectedDate = new Date();
// Variable to store the selected date in the main calendar
let selectedMainDate = currentSelectedDate;
let selectedCell = null;
window.selectedDateTime = null; // Globally store the selected date and time
let selectedEventEl = null;

// Event storage for display and sorting
const eventDataMap = {}; // { "YYYY-MM-DD_HH": [ "Meeting", "Zoo" ] }

let inMemorySelectedCell = null; // { date: "YYYY-MM-DD", hour: 9, text: "" } or null

const LS_EVENTS = 'bookingCalendar.events.v1'; // localStorage key for events

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
        activites: "Activites",
        guests: "Guests",
        locations: "Locations",
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
        activites: "Aktivnosti",
        guests: "Gosti",
        locations: "Lokacije",
        sessionAvailability: "Dostupnost termina",
        otherEvents: "Ostali događaji",
        countDay: "Broj dana"
    }
};

const colorClasses = [
  'event-color-1',
  'event-color-2',
  'event-color-3',
  'event-color-4',
  'event-color-5'
];

//Table Reservation, Private Event, Staff Meeting, Kitchen Maintenance, Supplier Delivery
const SAMPLE_ACTIVITES = [
  { id: "a1", name: "Meeting" },
  { id: "a2", name: "Workshop" },
  { id: "a3", name: "Conference" },
  { id: "a4", name: "Training" },
  { id: "a5", name: "Networking" }
];
const SAMPLE_GUESTS = [
  { id: "u1", name: "Alice Martin" },
  { id: "u2", name: "Boris Novak" },
  { id: "u3", name: "Carla Rossi" },
  { id: "u4", name: "Dino Kovač" },
  { id: "u5", name: "Eva Horvat" }
];

const SAMPLE_LOCATIONS = [
  { id: "l1", name: "Studio A" },
  { id: "l2", name: "Studio B" },
  { id: "l3", name: "Room 101" },
  { id: "l4", name: "Room 202" }
];

// Display the date in the button with id="dateButton" > Selection Date < + Calendar functionality
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// -- persisted --
let currentLanguage = localStorage.getItem('language') || 'en';

// -- elements --
// Get the button with the class 'count'
const countButton = document.querySelector(".count");
// Generate the table and synchronize it with the calendar
const dayHeadersContainer = document.getElementById("dayHeaders");
const timeSlotsContainer = document.getElementById("timeSlots");
const calendarContainer = document.getElementById('calendar-container');
// Change color scheme/styling
const themeButtons = document.querySelectorAll('.theme-option');
const targetButtons = document.querySelectorAll('#manageButton, #addButton, #colorThemeButton');


const picker = new DatePicker({
  container: calendarContainer,
  value: currentSelectedDate,
  baseDate: new Date(),
  autoClose: false,
  onSelect: (selectedDate) => {
    currentSelectedDate = selectedDate;

    updateDateButton(currentSelectedDate);
    generateTable(currentSelectedDate);
    loadEventsFromLocalStorage();
    updateCountButton(currentSelectedDate);
  }
});
picker.setValue(currentSelectedDate);

updateDateButton(currentSelectedDate); // update on load

// Initial generation
generateTable(currentSelectedDate);
loadEventsFromLocalStorage();

// -- button Count --
function updateDateButton(date) {
  const formatted = months[date.getMonth()] + " " + date.getFullYear();
  document.getElementById("dateButton").textContent = formatted;
}
// Function to update the button text with correct display for today,
// tomorrow, and yesterday, and dynamically insert the selected date from the calendar in other cases.
function updateCountButton(date) {
  const today = new Date();
  // Reset time to compare only by date
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
    const dayName = day.toLocaleDateString(locale, { weekday: "short" });// Day of the week
    const dayNumber = day.getDate(); // Date number

    dayDiv.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 12px;">${dayName}</div>
        <div style="font-size: 16px; font-weight: 600;">${dayNumber}</div>
      </div>
    `;
    
    dayHeadersContainer.appendChild(dayDiv);
    
    // Set color for the day
    if (sameDay(day, selectedDate)) {
      dayDiv.style.color = "rgba(35, 166, 248, 1)"; // Selected day
    } else if (day < selectedDate) {
      dayDiv.style.color = "#ccc"; // Previous days
    } else {
      dayDiv.style.color = "#000"; // Following days
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


let selectedCell = null; 

days.forEach((day) => {
  const cell = document.createElement("div");
  cell.className = "split-cell";

  // Save date and hour as data attributes
  const dateString = day.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  cell.dataset.date = dateString;
  cell.dataset.hour = hour;

  // Restore highlight if this slot was previously selected
  const isSelected = inMemorySelectedCell?.date === dateString && inMemorySelectedCell?.hour === hour
  if (isSelected) {
    //cell.style.backgroundColor = "#dbeafe"; // Highlight selected slot
    selectedCell = cell; // Remember current selected cell
    cell.classList.add("selected");
    window.selectedDateTime = new Date(`${dateString}T${String(hour).padStart(2, '0')}:00:00`);
  }

  // Click event handler for the cell
  cell.addEventListener("click", () => {
    const date = cell.dataset.date;
    const hour = parseInt(cell.dataset.hour);

    document.querySelectorAll(".split-cell.selected").forEach(c => { // clear ALL from DOM
      c.classList.remove("selected");
      c.style.backgroundColor = "";
//      c.textContent = "";
    });

    setInMemorySelectedCell(date, hour, cell.textContent || "");

    // -- mark clicked one
    cell.classList.add("selected");
//    cell.style.backgroundColor = "#dbeafe";

    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hour, 0, 0, 0);
    window.selectedDateTime = selectedDateTime;

    updateCountButton(selectedDateTime);
  });


  secondDio.appendChild(cell);
});


// Add row to timeSlotsContainer
    row.appendChild(secondDio);
    timeSlotsContainer.appendChild(row);
  }
}
function clearCellBackgrounds(cells) {
  cells.forEach(cell => {
    cell.style.backgroundColor = ''; // Reset inline style
    cell.style.backgroundImage = ''; // In case of gradient
  });
}

// Get all calendar cells
function getCalendarCells() {
  return document.querySelectorAll(
    '.calendar_table .first_dio, .calendar_table .second_dio > div, .time-slots .first_dio, .time-slots .second_dio > div'
  );
}

// -- time helpers --
// Helper function for date comparison (ignoring time)
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
            // Account for buttons containing nested tags (e.g., icons)
            if (el.childNodes.length > 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
                el.childNodes[0].nodeValue = t[key] + " ";
            } else {
                el.textContent = t[key];
            }
        }
    });
      // Translate text in the calendar (using DatePicker state)
      if (currentSelectedDate) {
        updateDateButton(currentSelectedDate);
      }
      generateTable(currentSelectedDate); // Update weekdays
      loadEventsFromLocalStorage();
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
let msActivs, msGuests, msLocs, ms2Activs, ms2Guests, ms2Locs;

// -- events --
// Apply translation immediately on load
document.addEventListener('DOMContentLoaded', ()=>{
  translateUI();

  themeButtons.forEach(themeButton => {
    themeButton.addEventListener('click', () => {
      const theme = themeButton.dataset.theme;
      const calendarCells = getCalendarCells();

      // Update buttons
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

      // Update calendar cell colors
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
            // Rainbow effect on cells — alternate colors
            const colors = ['#ed8b8bff', '#f8e07fff', '#66c88aff', '#7eacf6ff', '#b395f8ff']; // розовый, жёлтый, зелёный, синий, фиолетовый
            cell.style.backgroundColor = colors[index % colors.length];
            break;
          case 'blue':
          default:
            // Do nothing — keep the current style
            break;
        }
      });
    });
  });


    // --- Multiselects (Event modal) ---

    msActivs = createFlowbiteMultiselect({
      buttonId: "ms-activites-btn",
      menuId: "ms-activites-menu",
      listId: "ms-activites-list",
      searchId: "ms-activites-search",
      chipsId: "ms-activites-chips",
      hiddenId: "ms-activites-hidden",
      items: SAMPLE_ACTIVITES,
      buttonLabel: "Select activites"
    });

    msGuests = createFlowbiteMultiselect({
      buttonId: "ms-guests-btn",
      menuId: "ms-guests-menu",
      listId: "ms-guests-list",
      searchId: "ms-guests-search",
      chipsId: "ms-guests-chips",
      hiddenId: "ms-guests-hidden",
      items: SAMPLE_GUESTS,
      buttonLabel: "Select guests"
    });

    msLocs = createFlowbiteMultiselect({
      buttonId: "ms-locs-btn",
      menuId: "ms-locs-menu",
      listId: "ms-locs-list",
      searchId: "ms-locs-search",
      chipsId: "ms-locs-chips",
      hiddenId: "ms-locs-hidden",
      items: SAMPLE_LOCATIONS,
      buttonLabel: "Select locations"
    });

    ms2Activs = createFlowbiteMultiselect({
      buttonId: "ms2-activites-btn",
      menuId: "ms2-activites-menu",
      listId: "ms2-activites-list",
      searchId: "ms2-activites-search",
      chipsId: "ms2-activites-chips",
      hiddenId: "ms2-activites-hidden",
      items: SAMPLE_ACTIVITES,
      buttonLabel: "Select activites"
    });

    ms2Guests = createFlowbiteMultiselect({
      buttonId: "ms2-guests-btn",
      menuId: "ms2-guests-menu",
      listId: "ms2-guests-list",
      searchId: "ms2-guests-search",
      chipsId: "ms2-guests-chips",
      hiddenId: "ms2-guests-hidden",
      items: SAMPLE_GUESTS,
      buttonLabel: "Select guests"
    });

    ms2Locs = createFlowbiteMultiselect({
      buttonId: "ms2-locs-btn",
      menuId: "ms2-locs-menu",
      listId: "ms2-locs-list",
      searchId: "ms2-locs-search",
      chipsId: "ms2-locs-chips",
      hiddenId: "ms2-locs-hidden",
      items: SAMPLE_LOCATIONS,
      buttonLabel: "Select locations"
    });


});

document.getElementById('languageToggle').addEventListener('click', () => {
  currentLanguage = (currentLanguage === 'en') ? 'hr' : 'en';
  localStorage.setItem('language', currentLanguage);
  translateUI();
});


// --Утилиты и хелперы--

function generateEventId() {
  return 'event_' + Math.random().toString(36).substr(2, 9);
}


function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Преобразование в 32-битное целое
  }
  return Math.abs(hash);
}




// --button Add--
// Unique variables for Add buttons and forms
const uniqueAddButton = document.getElementById("addButton");
const uniqueAddSearch = document.getElementById("addSearch");
const uniqueEventModal = document.getElementById("eventModal");
const uniqueFewEventsModal = document.getElementById("fewEventsModal");

const uniqueEventForm = document.getElementById("eventForm");
const uniqueFewEventsForm = document.getElementById("fewEventsForm");

const uniqueAddList = document.getElementById("add-list");

// Show modal form
function openModal(modal) {
  modal.classList.remove("hidden");
}

// Clear modal forms
function resetForm(container) {
  const inputs = container.querySelectorAll("input, textarea, select");

  inputs.forEach(input => {
    if (input.type === "checkbox" || input.type === "radio") {
      input.checked = false; // Сброс флажков
    } else {
      input.value = "";      // Сброс обычных полей
    }
  });
}
// Handler to display dropdown menu on Add button click
uniqueAddButton.addEventListener("click", () => {
  if (!window.selectedDateTime) {
    alert("Please select a time slot first.");
    return; // Не показываем меню, если нет выбора
  }
  uniqueAddSearch.classList.toggle("hidden");
});

// Function to close all modal windows
function closeAllModals() {
  uniqueEventModal.classList.add("hidden");
  uniqueFewEventsModal.classList.add("hidden");
}

// When selecting an Event:
uniqueAddList.querySelector(".event-option").addEventListener("click", () => {
  closeAllModals();               // close all forms
  openModal(uniqueEventModal);    // open the required form
  uniqueAddSearch.classList.add("hidden"); // hide the dropdown menu
});

// When selecting Few Events:
uniqueAddList.querySelector(".fewEvents-option").addEventListener("click", () => {
  closeAllModals();
  openModal(uniqueFewEventsModal);
  uniqueAddSearch.classList.add("hidden");
});

// --modal form Event--
// Add Event
uniqueEventForm.querySelector('button[type="submit"]').addEventListener("click", () => {

  if (!window.selectedDateTime) {
  alert("Please select a time slot first.");
  return;
}

  const titleInput = uniqueEventForm.querySelector('input[name="title"]');
  const descriptionTextarea = uniqueEventForm.querySelector('textarea[name="description"]');

  const title = titleInput.value.trim(); 
  const description = descriptionTextarea.value.trim();
  
  if (!title) {
    alert("Please enter a title.");
    return;
  }

  const tags = eventTags.getTags();

  const activites = JSON.parse(document.getElementById("ms-activ-hidden").value || "[]");
  const guests = JSON.parse(document.getElementById("ms-guests-hidden").value || "[]");
  const locations = JSON.parse(document.getElementById("ms-locs-hidden").value || "[]");


  insertEventIntoCell(window.selectedDateTime, {
    title,
    description,
    tags,
    activites,
    guests,
    locations
  });

  saveEventsToLocalStorage();

  /*try {
    await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    insertEventIntoCell(window.selectedDateTime, title); // sort = false by default

  saveEventsToLocalStorage();
    resetForm(uniqueEventForm);
    closeModal(uniqueEventModal);
  } catch (err) {
    console.error("Failed to send event:", err);
    
  }*/
  eventTags.resetTags();
  if (msActivs) msActivs.clear();
  if (msGuests) msGuests.clear();
  if (msLocs)   msLocs.clear();

  resetForm(uniqueEventForm);
  closeModal(uniqueEventModal);

  saveEventsToLocalStorage();
});

// --modal form Few Events--
// Adding Few Events
// (with alphabetical sorting when adding new events)

uniqueFewEventsForm.querySelector('button[type="submit"]').addEventListener("click", () => {
  if (!window.selectedDateTime) {
  alert("Please select a time slot first.");
  return;
}

  const titleInputs = uniqueFewEventsForm.querySelectorAll('input[name="title[]"]');
  const descriptionTextareas = uniqueFewEventsForm.querySelectorAll('textarea[name="description[]"]');
  const tags = fewEventsTags.getTags(); 

  titleInputs.forEach((input, index) => {
    const title = input.value.trim();
    const description = descriptionTextareas[index].value.trim();

    if (title) {
      insertEventIntoCell(window.selectedDateTime, {
        title,
        description,
        tags
      }, true);
    }
  });

  saveEventsToLocalStorage();
  fewEventsTags.resetTags();
  resetForm(uniqueFewEventsForm);
  closeModal(uniqueFewEventsModal);

  saveEventsToLocalStorage();
});



  /*try {
    await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    insertEventIntoCell(window.selectedDateTime, summary, true); // sorting is enabled

  saveEventsToLocalStorage();
    resetForm(uniqueFewEventsForm);
    closeModal(uniqueFewEventsModal);
  } catch (err) {
    console.error("Failed to send few events:", err);
  }*/

// Insert the event into the appropriate calendar cell
// dateObj — object containing the event's date and time
// event — event object { title: string, tags: string[] }
// sort — if true, sort events by title
function insertEventIntoCell(dateObj, event, sort = false) {
  console.log("insertEventIntoCell вызвана");
  if (!(dateObj instanceof Date)) return console.error("event's date is not a date:", {dateObj});
  

  const dateStr = dateObj.toISOString().split("T")[0]; 
  const hour = dateObj.getHours();                   
  const key = `${dateStr}_${hour}`;                

  if (!eventDataMap[key]) eventDataMap[key] = [];
  eventDataMap[key].push(event);


  if (!event.id) event.id = generateEventId(); 
  

  if (sort) eventDataMap[key].sort((a, b) => a.title.localeCompare(b.title));
  

  const targetCell = document.querySelector(
    `.split-cell[data-date="${dateStr}"][data-hour="${hour}"]`
  );

  if (!targetCell) { throw "?"
    //console.warn("Select a cell first, in the week view.") - alert or console.warn() is redundant because this should not be possible, unless data got corrupted, and you already throw a warning.
  }

  renderEventsForCell(targetCell, dateStr, hour);

  console.log("event data:", eventDataMap[key]);
  targetCell.innerHTML = "";

  const ul = document.createElement("ul");

  eventDataMap[key].forEach(event => {
    const { title, description, tags = [] } = event;

    const li = document.createElement("li");
    li.dataset.eventId = event.id;

    const colorIndex = event.colorIndex ?? (hashString(title) % colorClasses.length);
    li.classList.add(colorClasses[colorIndex]);
    li.classList.add("the-event");

    li.addEventListener('click', (e) => {
      if (selectedEventEl === li) {
        e.stopPropagation(); // prevent cell selection
        // toggle off if clicking the same selected event
        li.classList.remove('event-selected');
        selectedEventEl = null;
        return;
      }
      if (selectedEventEl) selectedEventEl.classList.remove('event-selected');
      li.classList.add('event-selected');
      selectedEventEl = li;
    });

    const titleElem = document.createElement("strong");
    titleElem.textContent = title;
    li.appendChild(titleElem);

    if (description) {
      const descElem = document.createElement("p");
      descElem.textContent = description;
      li.appendChild(descElem);
      // li.dataset.eventId = event.id;
    }

    const tagsContainer = document.createElement("div");
    tagsContainer.classList.add("tags-container");

    tags.forEach(tag => {
      const tagElem = document.createElement("span");
      tagElem.classList.add("tag");
      tagElem.textContent = tag;
      tagsContainer.appendChild(tagElem);
    });

    if(tags.length) li.appendChild(tagsContainer);

    if (event.activites && event.activites.length) {
      const a = document.createElement("div");
      a.className = "text-[11px]";
      a.textContent = `Activites: ${event.activites.map(k=>SAMPLE_ACTIVITES.find(v=>v.id == k).name).join(", ")}`;
      li.appendChild(a);
    }
    if (event.guests && event.guests.length) {
      const g = document.createElement("div");
      g.className = "text-[11px]";
      g.textContent = `Guests: ${event.guests.map(k=>SAMPLE_GUESTS.find(v=>v.id == k).name).join(", ")}`;
      li.appendChild(g);
    }
    if (event.locations && event.locations.length) {
      const l = document.createElement("div");
      l.className = "text-[11px]";
      l.textContent = `Locations: ${event.locations.map(k=>SAMPLE_LOCATIONS.find(v=>v.id == k).name).join(", ")}`;
      li.appendChild(l);
    }


    ul.appendChild(li);
  });

  targetCell.appendChild(ul);
}
  
  //saveEventsToLocalStorage();
//}
// Close modal forms when clicking Cancel
function closeModal(modal) {
  modal.classList.add("hidden");
}

// uniqueEventForm.querySelector('button[type="button"]').addEventListener("click", () => {
//   resetForm(uniqueEventForm);
//   closeModal(uniqueEventModal);
// });



// --- Tags for modal windows ---
// Function to initialize tags for the modal
function initTagInput(tagsInputId, tagsContainerId) {
  const tagsInput = document.getElementById(tagsInputId);
  const tagsContainer = document.getElementById(tagsContainerId);

  // Array of current tags
  let tags = [];

  // Function to render tags
  function renderTags() {
    tagsContainer.innerHTML = "";
    tags.forEach((tag, index) => {
      const tagElem = document.createElement("span");
      tagElem.classList.add("tag");
      tagElem.textContent = tag;

      // Tag delete button
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

  // Enter key press handler
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

  // Function to get tags
  function getTags() {
    return tags;
  }

  /// Function to reset tags
  function resetTags() {
    tags = [];
    renderTags();
    tagsInput.value = "";
  }

  return { getTags, resetTags };
}

// -- Initialization for each modal form --
const eventTags = initTagInput("tagsInput", "tagsContainer");
const fewEventsTags = initTagInput("tagsInputFew", "tagsContainerFew");

// Add tags to the payload on submit
uniqueEventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = e.target.title.value.trim();
  const description = e.target.description.value.trim();

  const payload = {
    title,
    description,
   // datetime: window.selectedDateTime.toISOString(),
    //tags: eventTags.getTags(),
    datetime: window.selectedDateTime.toISOString(),
  ...(rawTags.length > 0 && { tags: rawTags }),
    // Other fields can be added: guests, location, time range, etc.
  };

  // Existing event insertion code
  insertEventIntoCell(window.selectedDateTime, {
  title,
  description,
  tags: eventTags.getTags(), 
});

  saveEventsToLocalStorage();
  // Reset tags after submission
  eventTags.resetTags();
  if (msActivs) msActivs.clear();
  if (msGuests) msGuests.clear();
  if (msLocs)   msLocs.clear();

  resetForm(uniqueEventForm);
  closeModal(uniqueEventModal);
  
  //saveEventsToLocalStorage();
});

uniqueFewEventsForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titles = Array.from(e.target.querySelectorAll('input[name="title[]"]')).map(input => input.value.trim());
  const descriptions = Array.from(e.target.querySelectorAll('textarea[name="description[]"]')).map(textarea => textarea.value.trim());

  titles.forEach((title, index) => {
    if (title) {
      insertEventIntoCell(window.selectedDateTime, {
        title,
        description: descriptions[index] || "", // Get description for the corresponding index      
        tags: fewEventsTags.getTags(),
      }, true); // Sorting enabled
    }
  });

  saveEventsToLocalStorage();
  //fewEventsTags.resetTags();
  resetForm(uniqueFewEventsForm);
  closeModal(uniqueFewEventsModal);
  
  // Сохраняем события в localStorage после обновления
  //saveEventsToLocalStorage();
});

// Save immediately when clicking "Add another event" (to save each event upon addition)
function addEventBlockAndSaveCurrent() {
  const titles = Array.from(document.querySelectorAll('input[name="title[]"]')).map(input => input.value.trim());
  const descriptions = Array.from(document.querySelectorAll('textarea[name="description[]"]')).map(textarea => textarea.value.trim());

  const tags = fewEventsTags.getTags(); // Get tags once here

  // Save the last filled event
  const lastIndex = titles.length - 1;
  const title = titles[lastIndex];
  const description = descriptions[lastIndex];

    if (title) {
    console.log("window.selectedDateTime перед вставкой события:", window.selectedDateTime);
    insertEventIntoCell(window.selectedDateTime, {
      title,
      description,
      tags, // Insert tags
    }, true);
  }

  saveEventsToLocalStorage();
  // Add a new block
  addEventBlock();
}


// function clearAllEventsFromDOM() {
//   // remove rendered event nodes
//   document.querySelectorAll('.event').forEach(el => el.remove());

//   // only reset selection styles inside the week grid
//   document.querySelectorAll('.split-cell.selected').forEach(cell => {
//     cell.classList.remove('selected');
//     cell.style.backgroundColor = '';
//     // cell.textContent = ''; // keep whatever behavior you want here
//   });

//   document.querySelectorAll('.event-selected').forEach(el => el.classList.remove('event-selected'));
//   selectedEventEl = null;
// }
function clearAllEventsFromDOM() {
  document.querySelectorAll('.split-cell ul').forEach(ul => ul.remove());

  // don't touch .split-cell.selected here
  document.querySelectorAll('.event-selected').forEach(el => el.classList.remove('event-selected'));
  selectedEventEl = null;
}




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
    const date = cell.dataset.date;
    const hour = parseInt(cell.dataset.hour);

    document.querySelectorAll(".split-cell.selected").forEach(c => {
      c.classList.remove("selected");
      c.style.backgroundColor = "";
      c.textContent = "";
    });

    setInMemorySelectedCell(date, hour, cell.textContent || "");

    cell.classList.add("selected");
//    cell.style.backgroundColor = "#dbeafe";

    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hour, 0, 0, 0);
    window.selectedDateTime = selectedDateTime;

    updateCountButton(selectedDateTime);
  });
      secondDio.appendChild(cell);
    });

    row.appendChild(secondDio);
    timeSlotsContainer.appendChild(row);
  }
}

const weeklyListItems = document.querySelectorAll("#weeklyView-list .theme-option");
weeklyListItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    const selectedDate = currentSelectedDate || new Date();
    const weekStartDate = getStartOfWeekForMonth(index, selectedDate);
    generateWeeklyTable(weekStartDate);

    clearAllEventsFromDOM();
    loadEventsFromLocalStorage();

    
    // Update the .count button, passing the date of the first day of the week (Monday)
    updateCountButton(weekStartDate);

    // Optionally: reset the highlight of the selected cell
    if (selectedCell) {
      selectedCell.style.backgroundColor = "";
      selectedCell = null;
    }
    restoreSelectedCellOnLoad();
    // Update the global selected date and time
    window.selectedDateTime = new Date(weekStartDate);
    window.selectedDateTime.setHours(9, 0, 0, 0); // for example, the first hour of the working day
  });
});


// --handlers for buttonLeft and buttonRight--
const buttonLeft = document.querySelector(".button_left");
const buttonRight = document.querySelector(".button_right");

buttonLeft.addEventListener("click", () => { 
  if (!currentSelectedDate) currentSelectedDate = new Date();
  currentSelectedDate.setDate(currentSelectedDate.getDate() - 1);

  window.selectedDateTime = new Date(currentSelectedDate);
  generateTable(currentSelectedDate);
  updateCountButton(currentSelectedDate);
  updateDateButton(currentSelectedDate);
  loadEventsFromLocalStorage();

  // sync the datepicker UI
  picker.setValue(currentSelectedDate);
});

buttonRight.addEventListener("click", () => {
  if (!currentSelectedDate) currentSelectedDate = new Date();
  currentSelectedDate.setDate(currentSelectedDate.getDate() + 1);

  window.selectedDateTime = new Date(currentSelectedDate);
  generateTable(currentSelectedDate);
  updateCountButton(currentSelectedDate);
  updateDateButton(currentSelectedDate);
  loadEventsFromLocalStorage();

  // sync the datepicker UI
  picker.setValue(currentSelectedDate);
});



// DOM Elements
const manageButton = document.getElementById("manageButton");
const manageSearch = document.getElementById("manageSearch");
const deleteModal = document.getElementById("deleteModal");
const confirmDeleteButton = document.getElementById("confirmDeleteButton");
const declineDeleteButton = document.getElementById("declineDeleteButton");
const deleteModifyOption = manageSearch.querySelector(".modify-option");

const deleteOneModal = document.getElementById("deleteOneModal");
const confirmDeleteOneButton = document.getElementById("confirmDeleteOneButton");
const declineDeleteOneButton = document.getElementById("declineDeleteOneButton");
const deleteOnePreview = document.getElementById("deleteOnePreview");


// Event handler for clicking "Delete" option in the Manage menu
deleteModifyOption.addEventListener("click", () => {
  // Check if a time slot is selected (global variable set on calendar cell click)
  if (!window.selectedDateTime) {
    return alert("Please select a time slot first.");
  }

  // -- selected (single) event --
  const ctx = getSelectedEventContext(); 
  if (ctx) { 
    fillDeleteOnePreview(ctx);
    openModal(deleteOneModal);
    manageSearch.classList.add("hidden");

    confirmDeleteOneButton.onclick = () => {
      eventDataMap[ctx.key] = ctx.arr.filter(e => e.id !== ctx.eventId);
      renderEventsForCell(ctx.cell, ctx.dateStr, ctx.hour);
      if (selectedEventEl) {
        selectedEventEl.classList.remove("event-selected");
        selectedEventEl = null;
      }
      saveEventsToLocalStorage();
      closeModal(deleteOneModal);
    };

    declineDeleteOneButton.onclick = () => {
      closeModal(deleteOneModal);
    };
    return; 
  }

  // -- all events in the cell --

  const dateStr = window.selectedDateTime.toISOString().split("T")[0];
  const hour = window.selectedDateTime.getHours();

  // Find the calendar cell matching selected date and hour
  const deleteSelectedCell = document.querySelector(
    `.split-cell[data-date="${dateStr}"][data-hour="${hour}"]`
  );

  if (!deleteSelectedCell) {
    alert("Please select a valid time slot.");
    return;
  }
  const key = `${dateStr}_${hour}`;

  if(!eventDataMap[key]) return alert("No events in the selected time slot."); 
  else {
      deleteModal.querySelector(".qty").textContent = eventDataMap[key].length;
  }
  openModal(deleteModal);
  manageSearch.classList.add("hidden");

  // Confirm deletion handler
  confirmDeleteButton.onclick = () => {
    // Clear cell content
    deleteSelectedCell.textContent = "";


    // Remove events from eventDataMap
    if (eventDataMap[key]) {
      delete eventDataMap[key];
      //eventDataMap[key] = eventDataMap[key].filter(event => event.id !== eventId);
    }
    
    // Save updated eventDataMap to localStorage
    saveEventsToLocalStorage();

    // Remove from localStorage
    // removeSelectedCell(dateStr, hour);

    closeModal(deleteModal);
  };

  // Cancel deletion handler
  declineDeleteButton.onclick = () => {
    closeModal(deleteModal);
  };
});


function getSelectedEventContext() {
  if (!selectedEventEl) return null;
  const li = selectedEventEl;
  const cell = li.closest(".split-cell");
  if (!cell) return null;

  const dateStr = cell.dataset.date;
  const hour = parseInt(cell.dataset.hour, 10);
  const key = `${dateStr}_${hour}`;
  const eventId = li.dataset.eventId;
  const arr = (eventDataMap[key] || []);
  const ev = arr.find(e => e.id === eventId);

    console.log({dateStr, hour, key, eventId, arr})

  if (!ev) return null;
  return { li, cell, key, dateStr, hour, eventId, arr, ev };
}

function fillDeleteOnePreview({ ev, dateStr, hour }) {
  const get = (sel) => deleteOnePreview.querySelector(sel);

  get('[data-field="title"]').textContent = ev.title || "";
  get('[data-field="description"]').textContent = ev.description || "";
  get('[data-field="date"]').textContent = dateStr;
  get('[data-field="time"]').textContent = `${String(hour).padStart(2,"0")}:00`;

  const tagList = (ev.tags && ev.tags.length) ? ev.tags.join(", ") : "";
  get('[data-field="tags"]').textContent = tagList;

const activNames = (ev.activites && ev.activites.length)
    ? ev.activites.map(id => (SAMPLE_ACTIVITES.find(x=>x.id===id)||{}).name || id).join(", ")
    : "";
  get('[data-field="activites"]').textContent = activNames;

  const guestNames = (ev.guests && ev.guests.length)
    ? ev.guests.map(id => (SAMPLE_GUESTS.find(x=>x.id===id)||{}).name || id).join(", ")
    : "";
  get('[data-field="guests"]').textContent = guestNames;

  const locNames = (ev.locations && ev.locations.length)
    ? ev.locations.map(id => (SAMPLE_LOCATIONS.find(x=>x.id===id)||{}).name || id).join(", ")
    : "";
  get('[data-field="locations"]').textContent = locNames;
}


function removeSelectedCell(dateString, hour) {
}




// Button Update
(function setupUpdateButton() {
    const updateButton = document.getElementById('updatePageBtn');
    if (!updateButton) return;

    updateButton.addEventListener('click', () => {
      restoreSelectedCellOnLoad();
    });
  })();


function setInMemorySelectedCell(dateString, hour, text = "") {
  inMemorySelectedCell = { date: dateString, hour, text };
}

function getInMemorySelectedCell() {
  return inMemorySelectedCell;
}

function clearInMemorySelectedCell() {
  inMemorySelectedCell = null;
}

// Re-apply the single selection (if it is on the currently rendered grid)
function restoreSelectedCellOnLoad() {
  const sel = getInMemorySelectedCell();
  if (!sel) return;
  const cell = document.querySelector(`.split-cell[data-date="${sel.date}"][data-hour="${sel.hour}"]`);
  if (cell) {
    cell.classList.add('selected');
    // If you previously stored cell text, you can restore it:
    if (sel.text) cell.textContent = sel.text;
  }
}



function saveEventsToLocalStorage() {
  try { localStorage.setItem(LS_EVENTS, JSON.stringify(eventDataMap)); }
  catch (e) { console.error('saveEventsToLocalStorage failed:', e); }
}


function renderEventsForCell(cell, dateString, hour) {
  const key = `${dateString}_${hour}`;
  const events = eventDataMap[key] || [];
  cell.innerHTML = "";
  const ul = document.createElement("ul");

  events.forEach(ev => {
    if (!ev.id) throw "event had no id";

    const li = document.createElement("li");
    li.dataset.eventId = ev.id;

    const colorIndex = ev.colorIndex ?? (hashString(ev.title) % colorClasses.length);
    li.classList.add(colorClasses[colorIndex], "the-event");

    li.addEventListener("click", (e) => { // equal to initial
      if (selectedEventEl === li) {
        e.stopPropagation();
        li.classList.remove('event-selected');
        selectedEventEl = null;
        return;
      }
      if (selectedEventEl) selectedEventEl.classList.remove('event-selected');
      li.classList.add('event-selected');
      selectedEventEl = li;
    });

    const titleElem = document.createElement("strong");
    titleElem.textContent = ev.title || "";
    li.appendChild(titleElem);

    if (ev.description) {
      const descElem = document.createElement("p");
      descElem.textContent = ev.description;
      li.appendChild(descElem);
    }

    if (ev.tags && ev.tags.length) {
      const tagsContainer = document.createElement("div");
      tagsContainer.classList.add("tags-container");
      ev.tags.forEach(t => {
        const tagElem = document.createElement("span");
        tagElem.classList.add("tag");
        tagElem.textContent = t;
        tagsContainer.appendChild(tagElem);
      });
      li.appendChild(tagsContainer);
    }
    
    if (ev.activites && ev.activites.length) {
      const a = document.createElement("div");
      a.className = "text-[11px]";
      a.textContent = `Activites: ${ev.activites.map(k => (SAMPLE_ACTIVITES.find(v => v.id == k) || {}).name || k).join(", ")}`;
      li.appendChild(a);
    }

    if (ev.guests && ev.guests.length) {
      const g = document.createElement("div");
      g.className = "text-[11px]";
      g.textContent = `Guests: ${ev.guests.map(k => (SAMPLE_GUESTS.find(v => v.id == k) || {}).name || k).join(", ")}`;
      li.appendChild(g);
    }

    if (ev.locations && ev.locations.length) {
      const l = document.createElement("div");
      l.className = "text-[11px]";
      l.textContent = `Locations: ${ev.locations.map(k => (SAMPLE_LOCATIONS.find(v => v.id == k) || {}).name || k).join(", ")}`;
      li.appendChild(l);
    }

    ul.appendChild(li);
  });

  cell.appendChild(ul);
}

function loadEventsFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_EVENTS);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        Object.keys(eventDataMap).forEach(k => delete eventDataMap[k]);
        Object.assign(eventDataMap, data);
      }
    }
  } catch (e) {
    console.error('loadEventsFromLocalStorage failed:', e);
  }

  clearAllEventsFromDOM();
  Object.keys(eventDataMap).forEach(key => {
    const [date, hourStr] = key.split('_');
    const hour = parseInt(hourStr, 10) || 0;
    const cell = document.querySelector(`.split-cell[data-date="${date}"][data-hour="${hour}"]`);
    if (cell) renderEventsForCell(cell, date, hour);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const today = new Date();
  generateTable(today);
  restoreSelectedCellOnLoad();
  loadEventsFromLocalStorage();
});




// ---

function createFlowbiteMultiselect({
  buttonId, menuId, listId, searchId, chipsId, hiddenId, items, buttonLabel
}) {
  const btn = document.getElementById(buttonId);
  const menu = document.getElementById(menuId);
  const list = document.getElementById(listId);
  const search = document.getElementById(searchId);
  const chips = document.getElementById(chipsId);
  const hidden = document.getElementById(hiddenId);

  const selected = new Map(); // id -> item

  function renderList(filter = "") {
    list.innerHTML = "";
    const f = filter.trim().toLowerCase();
    items
      .filter(it => it.name.toLowerCase().includes(f))
      .forEach(it => {
        const li = document.createElement("li");
        li.className = "flex items-center gap-2 text-sm";
        li.innerHTML = `
          <input type="checkbox" class="w-4 h-4" data-id="${it.id}">
          <label class="cursor-pointer">${it.name}</label>`;
        const cb = li.querySelector("input");
        cb.checked = selected.has(it.id);
        cb.addEventListener("change", () => {
          if (cb.checked) { selected.set(it.id, it); }
          else { selected.delete(it.id); }
          sync();
        });
        list.appendChild(li);
      });
  }

  function renderChips() {
    chips.innerHTML = "";
    [...selected.values()].forEach(it => {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = it.name;
      const x = document.createElement("span");
      x.className = "remove-tag";
      x.textContent = "×";
      x.onclick = () => { selected.delete(it.id); sync(); };
      chip.appendChild(x);
      chips.appendChild(chip);
    });
  }

  function sync() {
    // hidden stores JSON array of ids
    hidden.value = JSON.stringify([...selected.keys()]);
    btn.childNodes[0].nodeValue = `${buttonLabel} (${selected.size}) `;
    renderChips();
    // Keep list checkboxes in sync (when chip removes an item)
    renderList(search.value);
  }

  search.addEventListener("input", () => renderList(search.value));
  renderList();
  sync();

  return {
    getSelectedIds: () => JSON.parse(hidden.value || "[]"),
    clear: () => { selected.clear(); sync(); }
  };
}
