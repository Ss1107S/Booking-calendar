let currentSelectedDate = new Date();
// Variable to store the selected date in the main calendar
let selectedMainDate = currentSelectedDate;
let selectedCell = null;
window.selectedDateTime = null; // Globally store the selected date and time

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
  autoClose: false,
  onSelect: (selectedDate) => {
    currentSelectedDate = selectedDate;

    updateDateButton(currentSelectedDate);
    generateTable(currentSelectedDate);

    updateCountButton(currentSelectedDate);
  }
});

updateDateButton(currentSelectedDate); // update on load

// Initial generation
generateTable(currentSelectedDate);


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
  const savedSelections = loadSelectedCells();
  const isSelected = savedSelections.some(sel =>
    sel.date === dateString && sel.hour === hour
  );
  if (isSelected) {
    cell.style.backgroundColor = "#dbeafe"; // Highlight selected slot
    selectedCell = cell; // Remember current selected cell
  }

  // Click event handler for the cell
  cell.addEventListener("click", () => {
    if (selectedCell) {
      selectedCell.style.backgroundColor = ""; // Remove highlight from previous selection
    }
    selectedCell = cell;
    cell.style.backgroundColor = "#dbeafe"; // Highlight the currently selected cell

    // Create a Date object for the selected slot
    const selectedDateTime = new Date(cell.dataset.date);
    selectedDateTime.setHours(parseInt(cell.dataset.hour));
    selectedDateTime.setMinutes(0);
    selectedDateTime.setSeconds(0);

    // Save the selected date/time globally
    window.selectedDateTime = selectedDateTime;
    console.log("Selected:", window.selectedDateTime);

    // Save the selection to localStorage
    saveSelectedCell(cell.dataset.date, parseInt(cell.dataset.hour));

    // Update the .count button or other UI elements accordingly
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

});

document.getElementById('languageToggle').addEventListener('click', () => {
  currentLanguage = (currentLanguage === 'en') ? 'hr' : 'en';
  localStorage.setItem('language', currentLanguage);
  translateUI();
});


// --button Add--
// Unique variables for Add buttons and forms
const uniqueAddButton = document.getElementById("addButton");
const uniqueAddSearch = document.getElementById("addSearch");
const uniqueEventModal = document.getElementById("eventModal");
const uniqueFewEventsModal = document.getElementById("fewEventsModal");

const uniqueEventForm = document.getElementById("eventForm");
const uniqueFewEventsForm = document.getElementById("fewEventsForm");

const uniqueAddList = document.getElementById("add-list");

// Event storage for display and sorting
const eventDataMap = {}; // { "YYYY-MM-DD_HH": [ "Meeting", "Zoo" ] }

// Show modal form
function openModal(modal) {
  modal.classList.remove("hidden");
}

// Clear modal forms
function resetForm(formElement) {
  formElement.reset();
}

// Handler to display dropdown menu on Add button click
uniqueAddButton.addEventListener("click", () => {
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

    insertEventIntoCell(window.selectedDateTime, title); // sort = false by default

    resetForm(uniqueEventForm);
    closeModal(uniqueEventModal);
  } catch (err) {
    console.error("Failed to send event:", err);
  }*/
const tags = eventTags.getTags(); // get tags first
insertEventIntoCell(window.selectedDateTime, { title, description, tags });
eventTags.resetTags(); // then clear
resetForm(uniqueEventForm); // then the form
closeModal(uniqueEventModal);
});


// --modal form Few Events--
// Adding Few Events
// (with alphabetical sorting when adding new events)

uniqueFewEventsForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!window.selectedDateTime) {
    alert("Please select a time slot first.");
    return;
  }

  const titles = Array.from(e.target.querySelectorAll('input[name="title[]"]')).map(input => input.value.trim());
  const descriptions = Array.from(e.target.querySelectorAll('textarea[name="description[]"]')).map(textarea => textarea.value.trim());

  const tags = fewEventsTags.getTags(); // save ONLY once

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

    insertEventIntoCell(window.selectedDateTime, summary, true); // sorting is enabled

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
  const dateStr = dateObj.toISOString().split("T")[0];  // Get the date in YYYY-MM-DD format
  const hour = dateObj.getHours();                      // Get the event hour (0–23)
  const key = `${dateStr}_${hour}`;                     // Create a unique key for the cell (date + hour)

  // If there's no event array for this cell yet, create an empty array
  if (!eventDataMap[key]) {
    eventDataMap[key] = [];
  }

  // Add the new event (object with title and tags) to the array
  eventDataMap[key].push(event);

  // If needed, sort the event array by title
  if (sort) {
    eventDataMap[key].sort((a, b) => a.title.localeCompare(b.title));
  }

  // Find the calendar cell DOM element by date and hour
  const targetCell = document.querySelector(
    `.split-cell[data-date="${dateStr}"][data-hour="${hour}"]`
  );

  // If the cell is not found, log a warning and exit
  if (!targetCell) {
    console.warn(`⚠️ Calendar cell not found for date: ${dateStr}, hour: ${hour}`);
    return;
  }

  // Clear the cell's content before adding new events
  targetCell.innerHTML = "";

  // Create a <ul> list to display all events in the cell
  const ul = document.createElement("ul");

// Iterate through each event in the array for this cell
eventDataMap[key].forEach(({ title, description, tags }) => {

  // Create an <li> element for the event
  const li = document.createElement("li");

  // Create a <strong> element for the event title and append it to the <li>
  const titleElem = document.createElement("strong");
  titleElem.textContent = title;
  li.appendChild(titleElem);

  // If there is a description, create a <p> with the description text and append it to the <li>
  if (description) {
    const descElem = document.createElement("p");
    descElem.textContent = description;
    li.appendChild(descElem);
  }

  // Create a container for the event tags 
  const tagsContainer = document.createElement("div");
  tagsContainer.classList.add("tags-container");

  // For each tag, create a <span> and add it to the tags container
  tags.forEach(tag => {
    const tagElem = document.createElement("span");
    tagElem.classList.add("tag");
    tagElem.textContent = tag;
    tagsContainer.appendChild(tagElem);
  });

  // Append the tags container to the <li>
  li.appendChild(tagsContainer);
  
    // Append the event <li> to the <ul> list
    ul.appendChild(li);
  });

  // Insert the event list into the calendar cell
  targetCell.appendChild(ul);
}
// Close modal forms when clicking Cancel
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

  if (!window.selectedDateTime) {
    alert("Please select a time slot first.");
    return;
  }

  const payload = {
    title,
    description,
    datetime: window.selectedDateTime.toISOString(),
    tags: eventTags.getTags(),
    // Other fields can be added: guests, location, time range, etc.
  };

  // Existing event insertion code
  insertEventIntoCell(window.selectedDateTime, {
  title,
  description,
  tags: eventTags.getTags(), 
});

  // Reset tags after submission
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
        description: descriptions[index] || "", // Get description for the corresponding index      
        tags: fewEventsTags.getTags(),
      }, true); // Sorting enabled
    }
  });

  fewEventsTags.resetTags();
  resetForm(uniqueFewEventsForm);
  closeModal(uniqueFewEventsModal);
});

// Reset tags when closing the modal via Cancel
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
    insertEventIntoCell(window.selectedDateTime, {
      title,
      description,
      tags, // Insert tags
    }, true);
  }

  // Add a new block
  addEventBlock();
}


// --button weeklyViewButton--
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


// --handlers for buttonLeft and buttonRight--
const buttonLeft = document.querySelector(".button_left");
const buttonRight = document.querySelector(".button_right");

buttonLeft.addEventListener("click", () => { 
  // If currentSelectedDate is undefined, use today's date
if (!currentSelectedDate) {
   currentSelectedDate = new Date(); 
  } 
  currentSelectedDate.setDate(currentSelectedDate.getDate() - 1);
   // Synchronize the global date
   window.selectedDateTime = new Date(currentSelectedDate); 
   // Update the UI
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
   


// -- Unique elements for Cancel --
function openModal(modalElement) {
  modalElement.classList.remove('hidden');
}

function closeModal(modalElement) {
  modalElement.classList.add('hidden');
}
// Получаем элементы
const manageButton = document.getElementById("manageButton");
const manageSearch = document.getElementById("manageSearch");
const cancelModal = document.getElementById("cancelModal");
const confirmCancelButton = document.getElementById("confirmCancelButton");
const declineCancelButton = document.getElementById("declineCancelButton");
const cancelModifyOption = manageSearch.querySelector(".modify-option");

// Обработчик клика на пункт Cancel в меню Manage
cancelModifyOption.addEventListener("click", () => {

// Ищем ячейку календаря, у которой дата и час соответствуют выбранным
// Проверяем, выбран ли временной слот (дата и час)
// Это глобальная переменная, устанавливаемая при клике на ячейку календаря
if (!window.selectedDateTime) {
  alert("Please select a time slot first."); // Если нет — показываем сообщение
  return; // Прерываем выполнение
}

// Получаем строку даты в формате YYYY-MM-DD из выбранной даты и времени
const dateStr = window.selectedDateTime.toISOString().split("T")[0];

// Получаем час (0–23) из выбранной даты и времени
const hour = window.selectedDateTime.getHours();

// Ищем ячейку календаря, у которой дата и час соответствуют выбранным
const cancelSelectedCell = document.querySelector(
  `.split-cell[data-date="${dateStr}"][data-hour="${hour}"]`
);

// Если такая ячейка не найдена — предупреждаем пользователя
if (!cancelSelectedCell) {
  alert("Please select a time slot first.");
  return;
}

  openModal(cancelModal);
  manageSearch.classList.add("hidden");

  // Подтверждение удаления через обработчик confirmCancelButton.onclick

confirmCancelButton.onclick = () => {
  cancelSelectedCell.textContent = "";

  const date = cancelSelectedCell.dataset.date;
  const hour = parseInt(cancelSelectedCell.dataset.hour);

  const key = `${date}_${hour}`;

  // Удаляем из eventDataMap
  if (eventDataMap[key]) {
    delete eventDataMap[key];
  }

  // Удаляем из localStorage
  removeSelectedCell(date, hour);

  closeModal(cancelModal);
};
  // Отмена удаления
  declineCancelButton.onclick = () => {
    closeModal(cancelModal);
  };
});
  // Обновление localStorage
/**
 * Удаляет слот (по дате и часу) из localStorage
 * @param {string} dateString — формат YYYY‑MM‑DD
 * @param {number} hour — час
 */
function removeSelectedCell(dateString, hour) {
  try {
    const saved = JSON.parse(localStorage.getItem('selectedCells')) || [];
    const updated = saved.filter(item => !(item.date === dateString && item.hour === hour));
    localStorage.setItem('selectedCells', JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}


   //функции для работы с localStorage

/**
 * Сохраняет выбранный слот (дата + час) в localStorage
 * @param {string} dateString — формат YYYY‑MM‑DD
 * @param {number} hour — час диапазона
 */
function saveSelectedCell(dateString, hour, text = "") {
  try {
    // Retrieve the existing 'selectedCells' array from localStorage, or initialize an empty array if not found.
    const saved = JSON.parse(localStorage.getItem('selectedCells')) || [];

    // Create a new array by updating the matching cell's text, or keeping the existing ones unchanged.
    const updated = saved.map(item =>
      item.date === dateString && item.hour === hour
        ? { ...item, text }  // Update the text for the matching cell
        : item              // Keep the existing item unchanged
    );

    // Check if the specified cell was not found and updated; if not, add a new entry.
    if (!updated.some(item => item.date === dateString && item.hour === hour)) {
      updated.push({ date: dateString, hour, text });
    }

    // Store the updated array back into localStorage under the 'selectedCells' key.
    localStorage.setItem('selectedCells', JSON.stringify(updated));
  } catch (error) {
    // Log any errors that occur during the process.
    console.error('Error saving to localStorage:', error);
  }
}
/**
 * Загружает сохранённые слоты из localStorage
 * @returns {Array<{date: string, hour: number}>}
 */
function loadSelectedCells() {
  return JSON.parse(localStorage.getItem('selectedCells')) || [];
}